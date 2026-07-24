// Presets for atmospheric items and animal behavior

export const populationPresets = {
  clouds: {
    maxCount: 8,
    speedMin: 4,
    speedMax: 18,
    sizeMin: 90,
    sizeMax: 320,
    opacityMin: 0.25,
    opacityMax: 0.75,
    color: "#ffffff"
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
    color: "#1c2214"
  },

  // Extreme music rain — rainIntensity scales live up to this ceiling
  rainStorm: {
    maxCount: 900,
    thickness: 2.4,
    fallSpeed: 920,
    opacity: 0.55,
    color: "#7ec8ff"
  }
};
