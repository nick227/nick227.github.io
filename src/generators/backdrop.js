import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawBackdrop } from '../graphics/draw.js';
import { lerpHex, hexToRgb, rgbToHsl, hslToHex } from '../utils/color.js';

// Boosts saturation/lightness rather than blending toward an unrelated
// color — a flat lerp toward warm gold desaturates a blue sky into mud;
// this instead makes the sky's own hue read as more vivid/electric, like
// the atmosphere is charging up rather than fading toward a new color.
function energizeSkyColor(hex, boost) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  // Aggressive enough to read at noon, when moodBoost can't lift
  // lighting.intensity (already capped at 1.0).
  const s = Math.min(100, hsl.s + boost * 60);
  const l = Math.min(88, hsl.l + boost * 28);
  return hslToHex(hsl.h, s, l);
}

export class BackdropPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.gradients = config.gradients || [];
    this.celestial = config.celestial || { sunSize: 30, sunGlow: 70, sunColor: '#fff', moonSize: 20, moonGlow: 30, moonColor: '#eee' };
    
    // Pre-allocated array to avoid allocations in tick loops
    this.currentColors = [];
  }

  static get capabilities() {
    return {
      needsBuffering: false,
      blending: 'source-over',
      lighting: false,
      effects: []
    };
  }

  // Interpolates sky colors in-place based on the current hour of the clock
  getSkyColors(hour) {
    if (this.gradients.length === 0) {
      this.currentColors[0] = "#000000";
      this.currentColors[1] = "#000000";
      this.currentColors.length = 2;
      return this.currentColors;
    }
    if (this.gradients.length === 1) {
      const single = this.gradients[0].colors;
      const len = single.length;
      this.currentColors.length = len;
      for (let i = 0; i < len; i++) {
        this.currentColors[i] = single[i];
      }
      return this.currentColors;
    }

    // Find surrounding hours in sorted array
    const sorted = [...this.gradients].sort((a, b) => a.hour - b.hour);
    
    let before = sorted[sorted.length - 1];
    let after = sorted[0];

    const sortedLen = sorted.length;
    for (let i = 0; i < sortedLen; i++) {
      if (sorted[i].hour <= hour) {
        before = sorted[i];
      }
      if (sorted[i].hour > hour) {
        after = sorted[i];
        break;
      }
    }

    // Calculate interpolation t
    let t = 0;
    if (before.hour === after.hour) {
      t = 0;
    } else if (after.hour < before.hour) {
      const range = (24 - before.hour) + after.hour;
      const current = hour >= before.hour ? (hour - before.hour) : ((24 - before.hour) + hour);
      t = current / range;
    } else {
      t = (hour - before.hour) / (after.hour - before.hour);
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

  update(dt, services, events) {
    // Backdrop doesn't have local animation state, it depends purely on the clock
  }

  draw(ctx, services) {
    const clock = services.time;
    const hour = clock.time;
    const colors = this.getSkyColors(hour);

    // The sky is the single largest thing on screen, so it needs to be
    // the most obvious "music just started" cue. It rides two signals:
    // moodBoost (sustained, tracks the music) plus lightningFlash (an
    // instant one-shot spike NatureDirector fires right on the
    // silence->playing edge) — so pressing play always produces one big,
    // unmissable pulse through the sky itself, independent of how quiet
    // the ongoing track's continuous mapping happens to be.
    const lighting = services.lighting;
    const boost = lighting ? Math.min(1.6, lighting.moodBoost + lighting.lightningFlash) : 0;
    const displayColors = boost > 0.001
      ? colors.map((c) => energizeSkyColor(c, boost))
      : colors;

    // Calculate celestial positions
    const sunAlt = clock.getSunAltitude();
    const moonAlt = clock.getMoonAltitude();

    // Map sun/moon horizontally across the sky
    const sunX = (hour / 24.0) * this.width;
    const sunY = this.height * 0.52 - sunAlt * (this.height * 0.42);

    const moonX = (((hour + 12.0) % 24.0) / 24.0) * this.width;
    const moonY = this.height * 0.52 - moonAlt * (this.height * 0.42);

    const sunPos = sunAlt > -0.2 ? { x: sunX, y: sunY } : null;
    const moonPos = moonAlt > -0.2 ? { x: moonX, y: moonY } : null;

    drawBackdrop(ctx, this.width, this.height, displayColors, sunPos, moonPos, this.celestial);
  }
}

// Auto-register primitive
registerPrimitive('backdrop', BackdropPrimitive);
