// Canvas Resize Integrity Test
import { HeightmapPrimitive } from '../src/generators/heightmap.js';
import { OscillatorPrimitive } from '../src/generators/oscillator.js';
import { EmitterPrimitive } from '../src/generators/emitter.js';
import { AgentPrimitive } from '../src/generators/agent.js';

// Mock minimal browser DOM objects in Node.js execution context
global.window = {
  devicePixelRatio: 2,
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        style: {},
        getContext: () => ({
          resetTransform: () => {},
          scale: () => {},
          clearRect: () => {},
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: () => {},
          createPattern: () => ({})
        })
      };
    }
    return {};
  }
};

let hasFailed = false;

function testResizeLifecycle(name, primitiveInstance) {
  try {
    console.log(`Testing resize lifecycle of "${name}"...`);
    
    // Test initial setup
    primitiveInstance.init(800, 600);
    if (primitiveInstance.width !== 800 || primitiveInstance.height !== 600) {
      throw new Error(`Init dimensions mismatch: expected 800x600, got ${primitiveInstance.width}x${primitiveInstance.height}`);
    }

    // Test resize transition
    primitiveInstance.resize(1920, 1080);
    if (primitiveInstance.width !== 1920 || primitiveInstance.height !== 1080) {
      throw new Error(`Resize dimensions mismatch: expected 1920x1080, got ${primitiveInstance.width}x${primitiveInstance.height}`);
    }
    
    console.log(`[OK] "${name}" passed.`);
  } catch (err) {
    console.error(`[ERROR] "${name}" failed:`, err.message);
    hasFailed = true;
  }
}

// 1. Instantiate Heightmap configuration
const heightmap = new HeightmapPrimitive({
  id: "test-heightmap",
  baseHeight: 0.6,
  amplitude: 0.25,
  octaves: 3,
  roughness: 0.5,
  lacunarity: 2.0
});

// 2. Instantiate Oscillator grass configuration
const oscillator = new OscillatorPrimitive({
  id: "test-oscillator",
  preset: {
    density: 0.2,
    heightMin: 15,
    heightMax: 45,
    thickness: 2.0,
    swayScale: 1.0,
    bladeColors: ["#112211", "#223322"]
  }
});

// 3. Instantiate Emitter clouds configuration
const emitter = new EmitterPrimitive({
  id: "test-emitter",
  particleTypes: ["stars", "clouds"],
  clouds: {
    maxCount: 3,
    sizeMin: 80,
    sizeMax: 150,
    opacityMin: 0.2,
    opacityMax: 0.5,
    speedMin: 2,
    speedMax: 5
  }
});

// 4. Instantiate Agent deer configuration
const agent = new AgentPrimitive({
  id: "test-agent",
  preset: {
    maxCount: 2,
    sizeMin: 12,
    sizeMax: 22,
    speedMin: 2,
    speedMax: 6
  }
});

testResizeLifecycle("HeightmapPrimitive", heightmap);
testResizeLifecycle("OscillatorPrimitive", oscillator);
testResizeLifecycle("EmitterPrimitive", emitter);
testResizeLifecycle("AgentPrimitive", agent);

if (hasFailed) {
  console.error("Result: FAIL. Resize integrity check failed.");
  process.exit(1);
} else {
  console.log("Result: PASS. All layer primitives resize correctly!");
  process.exit(0);
}
