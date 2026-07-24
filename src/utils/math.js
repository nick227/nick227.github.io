// Seeded random number generator (Mulberry32 algorithm)
export function createRandom(seed) {
  let h = (seed ^ 0xDEADBEEF) >>> 0;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (((h ^= h >>> 16) >>> 0) / 4294967296);
  };
}

// Simple 1D Value Noise and FBM for procedural terrain/animations
export class Noise1D {
  constructor(seed = 12345) {
    this.seed = seed;
    this.values = new Float32Array(256);
    const r = createRandom(seed);
    for (let i = 0; i < 256; i++) {
      this.values[i] = r();
    }
  }

  noise(x) {
    const floorX = Math.floor(x);
    const X = ((floorX % 256) + 256) % 256;
    const xf = x - floorX;
    
    // Smoothstep interpolation (3t^2 - 2t^3)
    const u = xf * xf * (3 - 2 * xf);
    
    const v1 = this.values[X];
    const v2 = this.values[(X + 1) % 256];
    
    return v1 + u * (v2 - v1);
  }

  // Fractal Brownian Motion
  fbm(x, octaves = 4, roughness = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= roughness;
      frequency *= lacunarity;
    }
    
    return total / maxValue;
  }
}

// Interpolation helpers
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  const clampedVal = Math.max(inMin, Math.min(inMax, value));
  return outMin + (outMax - outMin) * (clampedVal - inMin) / (inMax - inMin);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Random utilities with optional PRNG overrides
export function randomRange(min, max, prng = Math.random) {
  return min + prng() * (max - min);
}

export function randomChoice(arr, prng = Math.random) {
  return arr[Math.floor(prng() * arr.length)];
}

// Easing functions
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
