import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawBackdrop } from '../graphics/draw.js';
import { lerpHex } from '../utils/color.js';

// Ominous music-sky palette — lerped over the time-of-day sky so play
// always paints an unmistakable color shift, not just a brightness bump.
const APOCALYPSE_SKY = ['#12002a', '#3b0650', '#8b0a2a', '#ff5a1f'];

export class BackdropPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.gradients = config.gradients || [];
    this.celestial = config.celestial || {
      sunSize: 30, sunGlow: 70, sunColor: '#fff',
      moonSize: 20, moonGlow: 30, moonColor: '#eee'
    };
    this.currentColors = [];
  }

  static get capabilities() {
    return { needsBuffering: false, blending: 'source-over', lighting: false, effects: [] };
  }

  getSkyColors(hour) {
    if (this.gradients.length === 0) {
      this.currentColors.length = 2;
      this.currentColors[0] = '#000000';
      this.currentColors[1] = '#000000';
      return this.currentColors;
    }
    if (this.gradients.length === 1) {
      const single = this.gradients[0].colors;
      this.currentColors.length = single.length;
      for (let i = 0; i < single.length; i++) this.currentColors[i] = single[i];
      return this.currentColors;
    }

    const sorted = [...this.gradients].sort((a, b) => a.hour - b.hour);
    let before = sorted[sorted.length - 1];
    let after = sorted[0];

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].hour <= hour) before = sorted[i];
      if (sorted[i].hour > hour) {
        after = sorted[i];
        break;
      }
    }

    let t = 0;
    if (before.hour !== after.hour) {
      if (after.hour < before.hour) {
        const range = (24 - before.hour) + after.hour;
        const current = hour >= before.hour ? (hour - before.hour) : ((24 - before.hour) + hour);
        t = current / range;
      } else {
        t = (hour - before.hour) / (after.hour - before.hour);
      }
    }

    const maxColors = Math.max(before.colors.length, after.colors.length);
    this.currentColors.length = maxColors;
    for (let i = 0; i < maxColors; i++) {
      const c1 = before.colors[Math.min(i, before.colors.length - 1)];
      const c2 = after.colors[Math.min(i, after.colors.length - 1)];
      this.currentColors[i] = lerpHex(c1, c2, t);
    }
    return this.currentColors;
  }

  update() {}

  draw(ctx, services) {
    const clock = services.time;
    const hour = clock.time;
    const colors = this.getSkyColors(hour);

    // skyShift is the primary music cue — heavy blend toward apocalypse
    // colors. lightningFlash adds a one-frame punch on play-start.
    const atm = services.atmosphere;
    const lighting = services.lighting;
    const shift = atm ? atm.skyShift : 0;
    const flash = lighting ? lighting.lightningFlash * 0.35 : 0;
    const amount = Math.min(1, shift * 0.98 + flash);

    const displayColors = amount > 0.001
      ? colors.map((c, i) => lerpHex(c, APOCALYPSE_SKY[i % APOCALYPSE_SKY.length], amount))
      : colors;

    const sunAlt = clock.getSunAltitude();
    const moonAlt = clock.getMoonAltitude();
    const sunX = (hour / 24.0) * this.width;
    const sunY = this.height * 0.52 - sunAlt * (this.height * 0.42);
    const moonX = (((hour + 12.0) % 24.0) / 24.0) * this.width;
    const moonY = this.height * 0.52 - moonAlt * (this.height * 0.42);

    drawBackdrop(
      ctx, this.width, this.height, displayColors,
      sunAlt > -0.2 ? { x: sunX, y: sunY } : null,
      moonAlt > -0.2 ? { x: moonX, y: moonY } : null,
      this.celestial
    );
  }
}

registerPrimitive('backdrop', BackdropPrimitive);
