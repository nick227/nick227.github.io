import { skyGradients, celestialConfig } from './fragments/sky.js';
import { terrainPresets } from './fragments/terrain.js';
import { vegetationPresets } from './fragments/vegetation.js';
import { populationPresets } from './fragments/population.js';

// Single background preset for the page: a tranquil mountain range
// synced to local time, with stars/clouds drifting over pine ridges.
export const ACTIVE_CHANNEL = {
  id: "alpine-wilderness",
  baseWind: 1.0,
  layers: [
    {
      id: "sky-backdrop",
      type: "backdrop",
      parallax: 0.0,
      config: {
        gradients: skyGradients.hourly,
        celestial: celestialConfig
      }
    },
    {
      id: "stars-clouds",
      type: "emitter",
      parallax: 0.05,
      config: {
        particleTypes: ["stars", "clouds", "rain"],
        stars: celestialConfig,
        clouds: populationPresets.clouds,
        rain: populationPresets.rainStorm
      }
    },
    {
      id: "distant-mountains",
      type: "heightmap",
      parallax: 0.12,
      config: terrainPresets.distantMountains
    },
    {
      id: "mid-mountains",
      type: "heightmap",
      parallax: 0.25,
      config: terrainPresets.midMountains
    },
    {
      id: "rolling-hills",
      type: "heightmap",
      parallax: 0.55,
      config: terrainPresets.rollingHills
    },
    {
      id: "hill-forest",
      type: "oscillator",
      parallax: 0.55,
      config: {
        preset: vegetationPresets.pineForest,
        anchorHeightmap: "rolling-hills" // Anchor trees to the rolling hills layer
      }
    },
    {
      id: "grazing-deer",
      type: "agent",
      parallax: 0.55,
      config: {
        preset: populationPresets.grazingDeer,
        anchorHeightmap: "rolling-hills" // Roam on the rolling hills
      }
    },
    {
      id: "foreground-plains",
      type: "heightmap",
      parallax: 0.90,
      config: terrainPresets.foregroundPlains
    },
    {
      id: "grass-meadow",
      type: "oscillator",
      parallax: 0.90,
      config: {
        preset: vegetationPresets.lushGrass,
        anchorHeightmap: "foreground-plains" // Anchor grass to the plains
      }
    }
  ]
};
