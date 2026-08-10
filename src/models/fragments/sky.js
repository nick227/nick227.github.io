// Reusable sky presets and celestial coordinates by time of day

import { canvasPalette } from '../palette.js';

export const skyGradients = {
  // Zenith-to-horizon gradients keyed by decimal hours (0 to 24)
  hourly: canvasPalette.sky.hourly
};

export const celestialConfig = {
  sunSize: 32,
  sunGlow: 80,
  sunColor: canvasPalette.celestial.sun,
  moonSize: 24,
  moonGlow: 40,
  moonColor: canvasPalette.celestial.moon,
  
  // Star generation parameters for the backdrop
  starCount: 150,
  starColors: canvasPalette.celestial.stars
};
