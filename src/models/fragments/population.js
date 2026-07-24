// Presets for atmospheric items and animal behavior

export const populationPresets = {
  // Drifting sky clouds
  clouds: {
    maxCount: 6,
    speedMin: 4,              // Pixels per second
    speedMax: 15,
    sizeMin: 90,              // Width in pixels
    sizeMax: 280,
    opacityMin: 0.2,
    opacityMax: 0.65,
    color: "#ffffff"
  },

  // Deer/elk silhouettes grazing on hills
  grazingDeer: {
    maxCount: 3,
    speedMin: 3,
    speedMax: 10,
    sizeMin: 18,
    sizeMax: 28,
    grazingTimeMin: 4.0,      // Seconds spent feeding at rest
    grazingTimeMax: 15.0,
    walkingTimeMin: 2.0,      // Seconds spent walking to next spot
    walkingTimeMax: 6.0,
    color: "#1c2214"
  },

  // Storm rain — spawn rate is scaled live by AtmosphereService.rainIntensity,
  // this only defines the "fully storming" ceiling.
  rainStorm: {
    maxCount: 400,
    thickness: 1.2,
    fallSpeed: 650,
    opacity: 0.25,
    color: "#9fb4d0"
  }
};
