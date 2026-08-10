// Presets and properties for foliage and swaying elements

import { canvasPalette } from '../palette.js';

export const vegetationPresets = {
  // Lush grass carpet in the foreground
  lushGrass: {
    density: 0.6,               // Blades per pixel along horizontal screen
    heightMin: 20,              // Blade height range (px)
    heightMax: 55,
    thickness: 2.5,             // Base blade thickness
    swayScale: 1.4,             // Flex response multiplier to wind gusts
    bladeColors: canvasPalette.vegetation.grass,
    flowerChance: 0.05,         // Chance of a blade being a flower stem
    flowerColors: canvasPalette.vegetation.flowers
  },

  // Silhouette pine forest outlines on the hills
  pineForest: {
    treeCount: 22,
    heightMin: 110,
    heightMax: 210,
    widthFactor: 0.32,          // Aspect ratio of the pine tree cone width
    swayScale: 0.55,            // Visible lean under music wind; still stiffer than grass
    branchFactor: 6,            // Density of branch segments
    treeColors: canvasPalette.vegetation.pineTrees
  }
};
