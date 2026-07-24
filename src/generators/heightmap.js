import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawHeightmap } from '../graphics/draw.js';
import { Noise1D } from '../utils/math.js';

export class HeightmapPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.points = [];
    this.noiseGen = new Noise1D(config.seed || Math.random());
    this.resolution = 4; // Sample height every 4 pixels for performance
  }

  static get capabilities() {
    return {
      needsBuffering: true, // Heightmaps are static and benefit heavily from offscreen caching
      blending: 'source-over',
      lighting: true,      // Responds to ambient shadows and color spill
      effects: ['parallax']
    };
  }

  init(width, height) {
    super.init(width, height);
    this.generateTerrain();
  }

  resize(width, height) {
    super.resize(width, height);
    this.generateTerrain();
  }

  generateTerrain() {
    const pointsCount = Math.ceil(this.width / this.resolution) + 1;
    this.points = [];
    
    const baseHeight = this.config.baseHeight !== undefined ? this.config.baseHeight : 0.7;
    const amplitude = this.config.amplitude !== undefined ? this.config.amplitude : 0.2;
    const octaves = this.config.octaves || 3;
    const roughness = this.config.roughness || 0.5;
    const lacunarity = this.config.lacunarity || 2.0;

    // Use noise to generate smooth heights
    for (let i = 0; i < pointsCount; i++) {
      const x = i * this.resolution;
      // Map x to a low frequency frequency
      const sampleX = x * 0.0018; 
      
      const noiseVal = this.noiseGen.fbm(sampleX, octaves, roughness, lacunarity);
      
      // Calculate final pixel height (y)
      const heightOffset = (noiseVal - 0.5) * amplitude * this.height;
      const y = baseHeight * this.height + heightOffset;
      
      this.points.push({ x, y });
    }
  }

  // Look up height at a specific horizontal coordinate
  getHeightAt(x) {
    if (this.points.length === 0) return this.height * 0.8;
    
    const idx = x / this.resolution;
    const i = Math.floor(idx);
    const f = idx - i;
    
    if (i < 0) return this.points[0].y;
    if (i >= this.points.length - 1) return this.points[this.points.length - 1].y;
    
    // Linear interpolation between the two sampled points
    return this.points[i].y + (this.points[i + 1].y - this.points[i].y) * f;
  }

  update(dt, services, events) {
    // Heightmap shape is static
  }

  draw(ctx, services, lightState) {
    const isLit = this.constructor.capabilities.lighting;
    
    // Calculate illuminated colors
    const litFillColor = services.lighting.illuminate(
      this.config.baseColor,
      lightState,
      this.config.spillStrength
    );
    const fillColor = services.lighting.applyMoodGlow(litFillColor, lightState);

    const shadowColor = this.config.shadowColor
      ? services.lighting.illuminate(this.config.shadowColor, lightState, this.config.spillStrength)
      : null;

    drawHeightmap(
      ctx, 
      this.points, 
      this.width, 
      this.height, 
      fillColor, 
      shadowColor, 
      lightState, 
      isLit
    );
  }
}

// Auto-register primitive
registerPrimitive('heightmap', HeightmapPrimitive);
