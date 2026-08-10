// Procedural heightmap terrain presets

import { canvasPalette } from '../palette.js';

export const terrainPresets = {
  // Deep background mountain peaks
  distantMountains: {
    octaves: 5,
    roughness: 0.52,
    lacunarity: 2.1,
    amplitude: 0.42,       // Takes up to 42% of canvas height
    baseHeight: 0.50,      // Centered at mid-screen
    parallaxFactor: 0.12,  // Minimal movement
    baseColor: canvasPalette.terrain.distantMountains.base, // Slate charcoal/grey
    spillStrength: 0.8,    // High atmospheric scattering (haze/sky tint)
    shadowColor: canvasPalette.terrain.distantMountains.shadow,
    seed: 1337
  },

  // Secondary mountain ridge
  midMountains: {
    octaves: 4,
    roughness: 0.48,
    lacunarity: 2.0,
    amplitude: 0.28,
    baseHeight: 0.62,
    parallaxFactor: 0.25,
    baseColor: canvasPalette.terrain.midMountains.base, // Dark blue-grey slate
    spillStrength: 0.6,
    shadowColor: canvasPalette.terrain.midMountains.shadow,
    seed: 5678
  },

  // Soft rolling hills (tree line area)
  rollingHills: {
    octaves: 3,
    roughness: 0.42,
    lacunarity: 1.8,
    amplitude: 0.16,
    baseHeight: 0.74,
    parallaxFactor: 0.55,
    baseColor: canvasPalette.terrain.rollingHills.base, // Deep forest moss green
    spillStrength: 0.4,
    shadowColor: canvasPalette.terrain.rollingHills.shadow,
    seed: 8888
  },

  // Grass and flower bed base
  foregroundPlains: {
    octaves: 2,
    roughness: 0.40,
    lacunarity: 2.0,
    amplitude: 0.05,
    baseHeight: 0.88,
    parallaxFactor: 0.90,  // Moves rapidly relative to scroll/cursor
    baseColor: canvasPalette.terrain.foregroundPlains.base, // Rich soil/grass green
    spillStrength: 0.2,    // Little atmospheric scatter, highly saturated
    shadowColor: canvasPalette.terrain.foregroundPlains.shadow,
    seed: 9999
  }
};
