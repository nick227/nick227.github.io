import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawGrassMeadow, drawPineTrees } from '../graphics/draw.js';
import { randomRange, randomChoice, createRandom } from '../utils/math.js';

export class OscillatorPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.elements = [];
    this.preset = config.preset || {};
    // Use configuration seed or default constants mixed with ID hash to ensure deterministic variety
    const charCodeSum = this.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    this.seed = config.seed || (config.anchorHeightmap ? 4400 + charCodeSum : 2200 + charCodeSum);
  }

  static get capabilities() {
    return {
      needsBuffering: false, // Foliage sways continuously with the wind field
      blending: 'source-over',
      lighting: true,
      effects: ['parallax']
    };
  }

  init(width, height) {
    super.init(width, height);
    this.generateElements();
  }

  resize(width, height) {
    super.resize(width, height);
    this.generateElements();
  }

  // Generates positions and dimensions using a local seeded random instance
  generateElements() {
    this.elements = [];
    const p = this.preset;
    const prng = createRandom(this.seed);

    if (p.treeCount !== undefined) {
      // 1. Generate Pine Trees
      for (let i = 0; i < p.treeCount; i++) {
        const x = randomRange(0, this.width, prng);
        const height = randomRange(p.heightMin, p.heightMax, prng);
        const color = randomChoice(p.treeColors || ["#112211"], prng);
        
        this.elements.push({
          type: 'tree',
          x,
          height,
          widthFactor: p.widthFactor || 0.3,
          swayScale: p.swayScale !== undefined ? p.swayScale : 0.2,
          branchLayers: p.branchFactor || 5,
          colorIndex: p.treeColors.indexOf(color),
          baseColor: color
        });
      }
      
      // Sort trees by height to draw shorter ones in the background
      this.elements.sort((a, b) => a.height - b.height);

    } else if (p.density !== undefined) {
      // 2. Generate Grass Blades / Flowers
      const bladeCount = Math.floor(this.width * p.density);
      for (let i = 0; i < bladeCount; i++) {
        const x = (i / bladeCount) * this.width + randomRange(-4, 4, prng);
        const height = randomRange(p.heightMin, p.heightMax, prng);
        const thickness = randomRange(p.thickness * 0.7, p.thickness * 1.3, prng);
        const color = randomChoice(p.bladeColors || ["#224422"], prng);
        
        const isFlower = prng() < (p.flowerChance || 0.0);
        const flowerColor = isFlower ? randomChoice(p.flowerColors, prng) : null;
        
        this.elements.push({
          type: 'grass',
          x,
          height,
          thickness,
          swayScale: randomRange(p.swayScale * 0.8, p.swayScale * 1.2, prng),
          colorIndex: p.bladeColors.indexOf(color),
          baseColor: color,
          isFlower,
          flowerColorIndex: isFlower ? p.flowerColors.indexOf(flowerColor) : -1,
          flowerBaseColor: flowerColor,
          flowerSize: randomRange(3, 6, prng)
        });
      }
    }
  }

  update(dt, services, events) {
    // Sway calculations are dynamic and checked per-draw
  }

  draw(ctx, services, lightState) {
    const p = this.preset;
    
    const heightmapLayer = services.layers && services.layers[this.config.anchorHeightmap];
    const heightmapLookup = heightmapLayer ? (x) => heightmapLayer.getHeightAt(x) : (x) => this.height * 0.85;

    const isTreePreset = p.treeCount !== undefined;
    const baseColors = isTreePreset ? p.treeColors : p.bladeColors;
    const illuminatedPalette = baseColors.map(color => {
      const lit = services.lighting.illuminate(color, lightState, this.config.spillStrength || 0.3);
      return services.lighting.applyMoodGlow(lit, lightState);
    });

    let illuminatedFlowerPalette = [];
    if (!isTreePreset && p.flowerColors) {
      illuminatedFlowerPalette = p.flowerColors.map(color => {
        const lit = services.lighting.illuminate(color, lightState, 0.4);
        const rimmed = services.lighting.applyRimHighlight(lit, lightState);
        return services.lighting.applyMoodGlow(rimmed, lightState);
      });
    }

    if (isTreePreset) {
      // Pre-apply rim lighting once to the color palette
      const rimmedPalette = illuminatedPalette.map(color =>
        services.lighting.applyRimHighlight(color, lightState)
      );
      
      const averageWindX = this.width * 0.5;
      const globalWindAngle = services.motion.getWindDisplacement(averageWindX, 0.002, this.parallaxFactor, 'bass');

      drawPineTrees(ctx, this.elements, heightmapLookup, globalWindAngle, rimmedPalette);
    } else {
      const getWindDisplacement = (x) => services.motion.getWindDisplacement(x, 0.0035, this.parallaxFactor, 'mid');

      drawGrassMeadow(ctx, this.elements, heightmapLookup, getWindDisplacement, illuminatedPalette, illuminatedFlowerPalette);
    }
  }
}

registerPrimitive('oscillator', OscillatorPrimitive);
