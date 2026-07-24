import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawDeerSilhouette } from '../graphics/draw.js';
import { randomRange, randomChoice, createRandom } from '../utils/math.js';

export class AgentPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.agents = [];
    this.preset = config.preset || {};
    
    // Create deterministic seed mixed with character weights of ID
    const charCodeSum = this.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    this.seed = config.seed || (3300 + charCodeSum);
    this.prng = createRandom(this.seed);
  }

  static get capabilities() {
    return {
      needsBuffering: false,
      blending: 'source-over',
      lighting: true,
      effects: ['parallax']
    };
  }

  init(width, height, events) {
    super.init(width, height, events);
    this.agents = [];
    this.prng = createRandom(this.seed); // Reset state to remain deterministic
    this.spawnAgents();

    if (events) {
      events.addEventListener('wildlife-startle', (data) => this.startle(data));
    }
  }

  resize(width, height) {
    super.resize(width, height);
    this.agents.forEach(a => {
      a.x = Math.max(20, Math.min(this.width - 20, a.x));
    });
  }

  // Populate deer herd using the seeded PRNG
  spawnAgents() {
    const maxCount = this.preset.maxCount || 3;
    for (let i = 0; i < maxCount; i++) {
      const state = randomChoice(['walking', 'grazing'], this.prng);
      this.agents.push({
        x: randomRange(this.width * 0.15, this.width * 0.85, this.prng),
        size: randomRange(this.preset.sizeMin || 16, this.preset.sizeMax || 26, this.prng),
        facingRight: this.prng() < 0.5,
        speed: randomRange(this.preset.speedMin || 4, this.preset.speedMax || 12, this.prng),
        state: state,
        stateTime: randomRange(0.0, 5.0, this.prng),
        targetStateTime: state === 'grazing' 
          ? randomRange(this.preset.grazingTimeMin || 4.0, this.preset.grazingTimeMax || 12.0, this.prng)
          : randomRange(this.preset.walkingTimeMin || 2.0, this.preset.walkingTimeMax || 6.0, this.prng),
        targetX: 0
      });
    }
  }

  // Music-driven reaction, dispatched via the 'wildlife-startle' event.
  // `strong` (impacts/drops/climaxes) skips straight to fleeing; a milder
  // trigger pauses the herd in an alert, head-up stance first — a
  // graduated response reads far more believable than a binary flee flag.
  startle({ strong = false } = {}) {
    this.agents.forEach(a => {
      if (a.state === 'fleeing') return; // already reacting, don't reset

      if (strong) {
        this._beginFleeing(a);
      } else {
        a.state = 'alert';
        a.stateTime = 0.0;
        a.targetStateTime = 0.4 + this.prng() * 0.35;
      }
    });
  }

  _beginFleeing(a) {
    a.state = 'fleeing';
    a.stateTime = 0.0;
    a.targetStateTime = 1.8 + this.prng() * 1.4;

    const dir = this.prng() < 0.5 ? -1 : 1;
    a.targetX = Math.max(20, Math.min(this.width - 20, a.x + dir * randomRange(180, 320, this.prng)));
    a.facingRight = a.targetX > a.x;
  }

  update(dt, services, events) {
    const p = this.preset;

    const heightmapLayer = services.layers && services.layers[this.config.anchorHeightmap];
    const heightmapLookup = heightmapLayer ? (x) => heightmapLayer.getHeightAt(x) : null;

    this.agents.forEach(a => {
      a.stateTime += dt;

      if (a.state === 'alert') {
        if (a.stateTime >= a.targetStateTime) {
          this._beginFleeing(a);
        }
      }

      else if (a.state === 'fleeing') {
        const fleeSpeed = a.speed * 3.2;
        const step = fleeSpeed * dt;
        const dist = a.targetX - a.x;
        const dir = Math.sign(dist);
        const timedOut = a.stateTime >= a.targetStateTime;

        if (Math.abs(dist) <= step || timedOut) {
          a.state = 'grazing';
          a.stateTime = 0.0;
          a.targetStateTime = randomRange(p.grazingTimeMin || 4.0, p.grazingTimeMax || 12.0, this.prng);
        } else {
          a.x += dir * step;
          if (a.x <= 20 || a.x >= this.width - 20) {
            a.state = 'grazing';
            a.stateTime = 0.0;
            a.targetStateTime = randomRange(p.grazingTimeMin || 4.0, p.grazingTimeMax || 12.0, this.prng);
          }
        }
      }

      else if (a.state === 'grazing') {
        if (a.stateTime >= a.targetStateTime) {
          // Finish grazing, start walking
          a.state = 'walking';
          a.stateTime = 0.0;
          a.targetStateTime = randomRange(p.walkingTimeMin || 2.0, p.walkingTimeMax || 6.0, this.prng);
          
          const walkDir = this.prng() < 0.5 ? -1 : 1;
          const walkDist = randomRange(60, 200, this.prng);
          a.targetX = Math.max(20, Math.min(this.width - 20, a.x + walkDir * walkDist));
          a.facingRight = a.targetX > a.x;
        }
      } 
      
      else if (a.state === 'walking') {
        const step = a.speed * dt;
        const dist = a.targetX - a.x;
        const dir = Math.sign(dist);

        let slopeFactor = 1.0;
        if (heightmapLookup) {
          const y1 = heightmapLookup(a.x);
          const y2 = heightmapLookup(a.x + dir * 5.0);
          const dy = y2 - y1;
          if (dy < -1.8) {
            slopeFactor = 0.55; // Uphill walking friction
          }
        }

        if (Math.abs(dist) <= step) {
          a.x = a.targetX;
          a.state = 'grazing';
          a.stateTime = 0.0;
          a.targetStateTime = randomRange(p.grazingTimeMin || 4.0, p.grazingTimeMax || 12.0, this.prng);
        } else {
          a.x += dir * step * slopeFactor;
        }

        // Boundary reflection
        if (a.x <= 20 || a.x >= this.width - 20) {
          a.state = 'grazing';
          a.stateTime = 0.0;
          a.targetStateTime = randomRange(p.grazingTimeMin || 4.0, p.grazingTimeMax || 12.0, this.prng);
        }
      }
    });
  }

  draw(ctx, services, lightState) {
    const heightmapLayer = services.layers && services.layers[this.config.anchorHeightmap];
    const heightmapLookup = heightmapLayer ? (x) => heightmapLayer.getHeightAt(x) : (x) => this.height * 0.85;

    const baseColor = this.preset.color || "#222222";
    const litColor = services.lighting.illuminate(baseColor, lightState, 0.4);
    const illuminatedColor = services.lighting.applyMoodGlow(litColor, lightState);

    this.agents.forEach(a => {
      const y = heightmapLookup(a.x);

      // 'fleeing' reuses the walking leg-bob animation at accelerated
      // speed — a fast run without needing new artwork. 'alert' passes
      // straight through: drawDeerSilhouette only special-cases
      // 'grazing'/'walking', so any other state already renders as a
      // static, head-up standing pose for free.
      const renderState = a.state === 'fleeing' ? 'walking' : a.state;
      const renderTime = a.state === 'fleeing' ? a.stateTime * 3.2 : a.stateTime;

      drawDeerSilhouette(
        ctx,
        a.x,
        y,
        a.size,
        a.facingRight,
        renderState,
        renderTime,
        illuminatedColor
      );
    });
  }
}

registerPrimitive('agent', AgentPrimitive);
