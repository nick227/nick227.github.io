// Core Renderer Engine orchestrator for canvas sizing, transitions, parallax, and effects

import { createPrimitive } from './factory.js';
import { PostProcessor } from '../effects/postprocess.js';
import { Compositor } from '../effects/compositor.js';
import { resizeCanvasToDisplay } from '../graphics/canvas.js';

export class Renderer {
  constructor(canvas, services, events) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.services = services;
    this.events = events;

    this.postProcessor = new PostProcessor();
    this.compositor = new Compositor();

    // Post-process intensities — externally controllable (e.g. by an
    // AtmosphereService); these are just the pipeline's own defaults.
    this.bloomIntensity = 0.22;
    this.vignetteIntensity = 0.48;

    // Double buffer canvas to avoid frame tearing or flicker
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCtx = this.bufferCanvas.getContext('2d');

    // Layer stacks
    this.activeLayers = [];
    this.incomingLayers = [];

    // Parallax mouse variables
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    // "Musical breathing": a slow, phrase-scale horizontal lean, separate
    // from and additive with mouse parallax — driven by NatureDirector off
    // momentum, not beats, so it reads as a slow cinematic drift.
    this.breatheX = 0;
    this.breatheXTarget = 0;

    // Channel transition controller
    this.transitionProgress = 1.0;
    this.transitionSpeed = 0.75; // Fades complete in ~1.3 seconds
    
    this.setupListeners();
  }

  setupListeners() {
    // Mouse movement listener for desktop parallax displacement
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      this.targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Touch support for mobile parallax displacement
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX / window.innerWidth) - 0.5;
        this.targetMouseY = (e.touches[0].clientY / window.innerHeight) - 0.5;
      }
    });
  }

  // Compile and load layers for a channel preset
  loadChannel(channelPreset) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Purge old event listeners to prevent memory leaks from discarded layers
    if (this.events) {
      this.events.clearAllListeners();
    }

    const compiledLayers = channelPreset.layers.map(layerConf => {
      const layer = createPrimitive(layerConf.type, layerConf.config);
      layer.id = layerConf.id;
      layer.type = layerConf.type; // Map the type property for diagnostics, dispatcher lookup, and compositor checks
      layer.parallaxFactor = layerConf.parallax;
      layer.init(width, height, this.events);
      return layer;
    });

    // Share layers with the global services container to allow lookup cross-referencing
    this.services.layers = {};
    compiledLayers.forEach(l => {
      this.services.layers[l.id] = l;
    });

    if (this.activeLayers.length === 0) {
      // First channel loaded, boot immediately
      this.activeLayers = compiledLayers;
      this.transitionProgress = 1.0;
    } else {
      // Fade transition triggered
      this.incomingLayers = compiledLayers;
      this.transitionProgress = 0.0;
    }
  }

  // Slow phrase-scale lean, in [-1, 1]. Eased internally at a multi-second
  // pace (see update()) — callers shouldn't try to animate it themselves.
  setBreatheTarget(x) {
    this.breatheXTarget = Math.max(-1, Math.min(1, x));
  }

  // Handle updates for all running layer physics/states
  update(dt) {
    // Smooth mouse coordinates using linear interpolation for dampening
    this.mouseX += (this.targetMouseX - this.mouseX) * 4.5 * dt;
    this.mouseY += (this.targetMouseY - this.mouseY) * 4.5 * dt;

    // Deliberately much slower than mouse parallax — a cinematic lean,
    // not something that should ever feel responsive/twitchy.
    this.breatheX += (this.breatheXTarget - this.breatheX) * Math.min(1, dt * 0.3);

    // Update active layer physics
    this.activeLayers.forEach(l => l.update(dt, this.services, this.events));

    // Handle fading/cross-over transitions
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += dt * this.transitionSpeed;
      
      // Update incoming layers simultaneously during transitions
      this.incomingLayers.forEach(l => l.update(dt, this.services, this.events));

      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.activeLayers = this.incomingLayers;
        this.incomingLayers = [];
        
        // Re-align layer shortcuts for heightmap lookup references
        this.services.layers = {};
        this.activeLayers.forEach(l => {
          this.services.layers[l.id] = l;
        });
      }
    }
  }

  // Handle canvas and layer resizing explicitly
  resize(width, height) {
    resizeCanvasToDisplay(this.canvas, width, height);
    resizeCanvasToDisplay(this.bufferCanvas, width, height);
    this.activeLayers.forEach(l => l.resize(width, height));
    this.incomingLayers.forEach(l => l.resize(width, height));
  }

  // Draw layers onto the double buffer and blit with post-processing filters
  render() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Sync buffer canvas sizes if they mismatch client size
    const dpr = window.devicePixelRatio || 1;
    if (
      this.canvas.width !== Math.round(width * dpr) || 
      this.canvas.height !== Math.round(height * dpr)
    ) {
      this.resize(width, height);
    }

    // Clear target rendering buffer
    this.bufferCtx.clearRect(0, 0, width, height);

    // Fetch dynamic lighting details
    const lightState = this.services.lighting.getLightingState(this.services.time);

    // Resolve sky colors for depth haze references
    const activeBackdrop = this.activeLayers.find(l => l.type === 'backdrop') ||
                           this.incomingLayers.find(l => l.type === 'backdrop');
    const skyColors = activeBackdrop ? activeBackdrop.getSkyColors(this.services.time.time) : [];

    // Helper to draw a layer stack
    const drawStack = (layers, opacityFactor) => {
      layers.forEach(layer => {
        const finalOpacity = layer.opacity * opacityFactor;
        if (finalOpacity <= 0) return;

        // Apply global blend and opacity rules
        this.compositor.beginLayer(this.bufferCtx, layer, finalOpacity);

        this.bufferCtx.save();
        // Displace position by mouse coordinates based on parallax depth,
        // plus the slow independent "breathing" lean layered on top.
        const maxParallaxDistance = 32.0;
        const dx = this.mouseX * layer.parallaxFactor * maxParallaxDistance
                 + this.breatheX * layer.parallaxFactor * 22.0;
        const dy = this.mouseY * layer.parallaxFactor * maxParallaxDistance * 0.4; // lower vertical movement
        this.bufferCtx.translate(dx, dy);

        // Render layer contents
        layer.draw(this.bufferCtx, this.services, lightState);

        this.bufferCtx.restore();

        // Apply depth haze overlays and restore canvas context state
        this.compositor.endLayer(this.bufferCtx, width, height, layer, skyColors);
      });
    };

    // Draw active stacks depending on transition phase
    if (this.transitionProgress >= 1.0) {
      drawStack(this.activeLayers, 1.0);
    } else {
      drawStack(this.activeLayers, 1.0 - this.transitionProgress);
      drawStack(this.incomingLayers, this.transitionProgress);
    }

    // Blit from double buffer onto viewport
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.bufferCanvas, 0, 0);

    // Run post-processing filters
    this.postProcessor.applyBloom(this.ctx, this.bufferCanvas, width, height, this.bloomIntensity);
    this.postProcessor.applyVignette(this.ctx, width, height, this.vignetteIntensity);
  }
}
export default Renderer;
