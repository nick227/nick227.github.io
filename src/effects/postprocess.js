// Post-processing visual filters (Bloom, Film Grain, Vignette)

import { canvasPalette } from '../models/palette.js';

export class PostProcessor {
  constructor() {
    this.grainCanvas = null;
    this.bloomCanvas = null;
    this.initGrain();
  }

  // Pre-generate a static noise canvas to avoid expensive per-frame CPU pixel iterations
  initGrain() {
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = 128;
    this.grainCanvas.height = 128;
    const ctx = this.grainCanvas.getContext('2d');
    const imgData = ctx.createImageData(128, 128);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;       // R
      data[i + 1] = val;   // G
      data[i + 2] = val;   // B
      data[i + 3] = 10;    // Faint alpha opacity (approx 0.04)
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Tiles the grain noise pattern with a random offset every tick
  applyFilmGrain(ctx, width, height) {
    if (!this.grainCanvas) return;
    
    ctx.save();
    const pattern = ctx.createPattern(this.grainCanvas, 'repeat');
    ctx.fillStyle = pattern;
    
    // Shift coordinate system randomly to animate the noise pattern
    ctx.translate(Math.random() * 128, Math.random() * 128);
    ctx.fillRect(-128, -128, width + 128, height + 128);
    ctx.restore();
  }

  // Renders a radial shading overlay to darken the screen edges
  applyVignette(ctx, width, height, intensity = 0.55) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.40,
      width / 2, height / 2, Math.max(width, height) * 0.85
    );
    grad.addColorStop(0, canvasPalette.postprocess.vignetteCenter);
    grad.addColorStop(1, `rgba(${canvasPalette.postprocess.vignetteRgb}, ${intensity})`); // Multiplies with a deep slate hue
    
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Generates high-speed light bloom using downscaled canvas blurring
  applyBloom(ctx, sourceCanvas, width, height, intensity = 0.22) {
    if (!this.bloomCanvas) {
      this.bloomCanvas = document.createElement('canvas');
    }
    
    // Downscale target to 1/4 resolution to speed up rendering calculations
    const scale = 0.25;
    const bloomW = Math.round(width * scale);
    const bloomH = Math.round(height * scale);

    if (this.bloomCanvas.width !== bloomW || this.bloomCanvas.height !== bloomH) {
      this.bloomCanvas.width = bloomW;
      this.bloomCanvas.height = bloomH;
    }

    const bCtx = this.bloomCanvas.getContext('2d');
    bCtx.clearRect(0, 0, bloomW, bloomH);
    bCtx.drawImage(sourceCanvas, 0, 0, bloomW, bloomH);

    // Apply hardware-accelerated native canvas blur filter
    bCtx.save();
    bCtx.filter = 'blur(6px)';
    bCtx.drawImage(this.bloomCanvas, 0, 0);
    bCtx.restore();

    // Composite blurred offscreen back to main screen using screen blend mode
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(this.bloomCanvas, 0, 0, width, height);
    ctx.restore();
  }
}
