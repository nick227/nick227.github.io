// Presets and properties for foliage and swaying elements

export const vegetationPresets = {
  // Lush grass carpet in the foreground
  lushGrass: {
    density: 0.6,               // Blades per pixel along horizontal screen
    heightMin: 20,              // Blade height range (px)
    heightMax: 55,
    thickness: 2.5,             // Base blade thickness
    swayScale: 1.4,             // Flex response multiplier to wind gusts
    bladeColors: ["#2e521c", "#3d6b27", "#528a38", "#223e14"],
    flowerChance: 0.05,         // Chance of a blade being a flower stem
    flowerColors: ["#e84a5f", "#ffd3b6", "#a8e6cf", "#ff8b94", "#ffffff"]
  },

  // Silhouette pine forest outlines on the hills
  pineForest: {
    treeCount: 22,
    heightMin: 110,
    heightMax: 210,
    widthFactor: 0.32,          // Aspect ratio of the pine tree cone width
    swayScale: 0.55,            // Visible lean under music wind; still stiffer than grass
    branchFactor: 6,            // Density of branch segments
    treeColors: ["#0f2017", "#172d21", "#08140e"]
  }
};
