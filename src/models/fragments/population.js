// Presets for atmospheric items and animal behavior

import { canvasPalette } from '../palette.js';

export const populationPresets = {
  clouds: {
    maxCount: 8,
    speedMin: 4,
    speedMax: 18,
    sizeMin: 90,
    sizeMax: 320,
    opacityMin: 0.25,
    opacityMax: 0.75,
    color: canvasPalette.population.cloud
  },

  grazingDeer: {
    maxCount: 3,
    speedMin: 3,
    speedMax: 10,
    sizeMin: 18,
    sizeMax: 28,
    grazingTimeMin: 4.0,
    grazingTimeMax: 15.0,
    walkingTimeMin: 2.0,
    walkingTimeMax: 6.0,
    color: canvasPalette.population.deer
  },

  // Extreme music rain — rainIntensity scales live up to this ceiling
  rainStorm: {
    maxCount: 900,
    thickness: 2.4,
    fallSpeed: 920,
    opacity: 0.55,
    color: canvasPalette.population.rain
  }
};
