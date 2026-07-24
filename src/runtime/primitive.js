export class CanvasPrimitive {
  constructor(config = {}) {
    this.config = config;
    this.id = config.id || Math.random().toString(36).substring(2, 9);
    this.opacity = config.opacity !== undefined ? config.opacity : 1.0;
    
    // Parallax coefficient: 0 = static (sky), 0.1 = background mountains, 1.0 = foreground foliage
    this.parallaxFactor = config.parallaxFactor !== undefined ? config.parallaxFactor : 0.0;
  }

  // Capability metadata. Subclasses should override this.
  static get capabilities() {
    return {
      needsBuffering: false,   // Render once to offscreen cache for performance optimization
      blending: 'source-over',  // Global composite operation type
      lighting: false,         // Subject to sky ambient tint / color spill
      effects: []              // Additional visual passes
    };
  }

  // Called when first loaded or re-initialized
  init(width, height, events) {
    this.width = width;
    this.height = height;
    this.events = events;
  }

  // State updates (dt = time delta in seconds, services = wind/light, events = dispatcher)
  update(dt, services, events) {
    // To be implemented by subclasses
  }

  // Core drawing commands (ctx = CanvasRenderingContext2D, services = wind/light, lightState = color details)
  draw(ctx, services, lightState) {
    // To be implemented by subclasses
  }

  // Handle canvas size changes
  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
