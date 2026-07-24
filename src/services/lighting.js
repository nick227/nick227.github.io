import { lerpHex, applyColorSpill, calculateEdgeLight } from '../utils/color.js';

export class LightingService {
  constructor() {
    // Lighting presets for the four daily phases
    this.lightThemes = {
      night: {
        ambient: "#090d1f",
        skySpill: "#11183c",
        rimLight: "#4e5989",
        intensity: 0.15
      },
      dawn: {
        ambient: "#403147",
        skySpill: "#ff9955",
        rimLight: "#ffddaa",
        intensity: 0.65
      },
      day: {
        ambient: "#ffffff",
        skySpill: "#b1dbf3",
        rimLight: "#ffffff",
        intensity: 1.0
      },
      dusk: {
        ambient: "#2d2440",
        skySpill: "#f04422",
        rimLight: "#ffaa55",
        intensity: 0.55
      }
    };

    // Mood boost: an atmosphere lift layered on top of the time-of-day
    // lighting, driven externally (e.g. by NatureDirector while music
    // plays). 0 = no effect, 1 = full boost.
    this.moodBoost = 0;
    this.moodBoostTarget = 0;

    // Lightning: an instant one-shot spike (not target-eased like
    // everything else here) that decays on its own over ~0.45s.
    this.lightningFlash = 0;
  }

  // Fast rise, slower fade — a mood shift should announce itself
  // immediately and then relax gracefully rather than snapping off.
  update(dt) {
    const rate = this.moodBoostTarget > this.moodBoost ? 2.5 : 0.6;
    this.moodBoost += (this.moodBoostTarget - this.moodBoost) * Math.min(1, dt * rate);

    this.lightningFlash = Math.max(0, this.lightningFlash - dt * 2.2);
  }

  setMoodBoostTarget(amount) {
    this.moodBoostTarget = Math.max(0, Math.min(1, amount));
  }

  // Fires an instant bright flash — rides the same `intensity` pipeline
  // illuminate() already uses, so every lit surface flashes for free
  // without extra per-generator draw calls.
  triggerLightning() {
    this.lightningFlash = 1.0;
  }

  // Calculate current lighting colors and intensities based on daytime phase weights
  getLightingState(clock) {
    const phases = clock.getDayPhases(); // { night, dawn, day, dusk }
    const themes = this.lightThemes;

    // Get active phases (usually 1 or 2 are active at a time)
    const active = [];
    for (const key in phases) {
      if (phases[key] > 0) {
        active.push({ name: key, weight: phases[key] });
      }
    }

    const blendColor = (prop) => {
      if (active.length === 1) {
        return themes[active[0].name][prop];
      } else if (active.length === 2) {
        // Blend between the two active phases by their relative weights
        const c1 = themes[active[0].name][prop];
        const c2 = themes[active[1].name][prop];
        // Since weight1 + weight2 = 1.0, the interpolation t is simply weight2
        return lerpHex(c1, c2, active[1].weight);
      }
      return themes.night[prop]; // fallback
    };

    const ambientHex = blendColor('ambient');
    const spillHex = blendColor('skySpill');
    const rimHex = blendColor('rimLight');

    const intensity = (phases.night * themes.night.intensity) +
                      (phases.dawn * themes.dawn.intensity) +
                      (phases.day * themes.day.intensity) +
                      (phases.dusk * themes.dusk.intensity);

    // Rim lighting factor peaks when the sun is near the horizon during dawn/dusk transitions
    const sunAlt = clock.getSunAltitude();
    const horizonFactor = Math.max(0, 1 - Math.abs(sunAlt) * 2.5); // peaks as sunAlt approaches 0
    const rimFactor = horizonFactor * (phases.dawn + phases.dusk);

    // Mood boost lifts ambient brightness a little on top of the time-of-day
    // base (most noticeable at night/dusk/dawn — it's already capped at
    // full daylight). The dedicated, time-of-day-independent glow that
    // makes the boost visible at any hour lives in applyMoodGlow below.
    // Lightning rides the same intensity channel for an instant flash.
    return {
      ambient: ambientHex,
      skySpill: spillHex,
      rimLight: rimHex,
      intensity: Math.min(1.0, intensity + this.moodBoost * 0.2 + this.lightningFlash * 0.7),
      rimFactor: rimFactor,
      moodBoost: this.moodBoost,
      lightningFlash: this.lightningFlash
    };
  }

  // Tint base colors based on sky spill and ambient shadows
  illuminate(baseColor, lightState, spillStrength = 0.5) {
    // 1. Spill sky color into the asset
    const spilled = applyColorSpill(baseColor, lightState.skySpill, lightState.intensity * spillStrength);
    // 2. Darken and shadow-tint based on overall ambient light intensity
    return lerpHex(spilled, lightState.ambient, 1 - lightState.intensity);
  }

  // Highlight upper edges during sunrise/sunset
  applyRimHighlight(baseColor, lightState) {
    if (lightState.rimFactor <= 0) return baseColor;
    return calculateEdgeLight(baseColor, lightState.rimLight, lightState.rimFactor);
  }

  // Warm highlight blended in proportional to mood boost + lightning flash
  // — deliberately independent of time-of-day/rimFactor, so a music-driven
  // mood shift (and the instant play-start pulse) reads the same at noon
  // as it does at midnight.
  applyMoodGlow(baseColor, lightState) {
    const glow = lightState.moodBoost + (lightState.lightningFlash || 0);
    if (!glow) return baseColor;
    return calculateEdgeLight(baseColor, '#fff2c0', Math.min(1, glow) * 0.75);
  }
}
