// Compositor to manage layer blending, opacity transitions, and depth haze

import { canvasPalette } from '../models/palette.js';

export class Compositor {
  constructor() {
    // Base strength of the atmospheric haze (higher = more fog density)
    this.hazeIntensity = 0.42; 
  }

  // Prepares the canvas state for rendering a layer (alpha, blend modes)
  beginLayer(ctx, layer, activeOpacity) {
    ctx.save();
    ctx.globalAlpha = activeOpacity;
    
    const blendMode = layer.constructor.capabilities.blending || 'source-over';
    ctx.globalCompositeOperation = blendMode;
  }

  // Applies post-drawing overlays (like depth haze) and restores canvas state
  endLayer(ctx, width, height, layer, skyColors) {
    const caps = layer.constructor.capabilities;

    // Apply atmospheric scattering (haze) based on parallax depth
    // Only applied to layers with depth (0.05 < parallaxFactor < 0.85)
    if (
      caps.effects && 
      caps.effects.includes('parallax') && 
      layer.parallaxFactor > 0.05 && 
      layer.parallaxFactor < 0.85
    ) {
      this.applyDepthHaze(ctx, width, height, layer.parallaxFactor, skyColors);
    }

    ctx.restore();
  }

  // Blends mountain layers into the horizon color using source-atop composition
  applyDepthHaze(ctx, width, height, parallaxFactor, skyColors) {
    if (!skyColors || skyColors.length === 0) return;

    // The horizon color is defined as the bottom-most sky gradient stop
    const horizonColor = skyColors[skyColors.length - 1];

    // Further away = smaller parallax = thicker haze
    const depthFactor = 1.0 - parallaxFactor; // e.g. distantMountains (0.12 parallax) = 0.88 depth
    const hazeOpacity = depthFactor * this.hazeIntensity;

    ctx.save();
    ctx.globalAlpha = hazeOpacity;
    ctx.globalCompositeOperation = 'source-atop'; // Restricts drawing to the painted silhouette of this layer

    // Linear gradient stretching from middle height to screen bottom
    const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
    grad.addColorStop(0, canvasPalette.terrain.depthHazeTransparent);
    grad.addColorStop(0.9, horizonColor);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
