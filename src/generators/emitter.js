import { CanvasPrimitive } from '../runtime/primitive.js';
import { registerPrimitive } from '../runtime/registry.js';
import { drawStars, drawClouds, drawWeather, drawLeaves, drawBirds, drawAurora, drawMeteors, drawUfos, drawMonsters } from '../graphics/draw.js';
import { randomRange, randomChoice, createRandom } from '../utils/math.js';
import { spawnMusicPhenoms } from './music-phenoms.js';

const AURORA_COLORS = ['rgba(120,255,180,0.9)', 'rgba(90,190,255,0.85)', 'rgba(200,130,255,0.8)'];

export class EmitterPrimitive extends CanvasPrimitive {
  constructor(config) {
    super(config);
    this.spawnTimer = 0.0;
    this.particleTypes = config.particleTypes || [];
    this.auroraRibbons = [];

    // Seed setup
    const charCodeSum = this.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    this.seed = config.seed || (7700 + charCodeSum);
    this.prng = createRandom(this.seed);

    // Large enough for extreme music rain + meteor storms
    this.poolSize = 1600;
    this.particles = Array.from({ length: this.poolSize }, () => ({
      active: false,
      type: '',
      x: 0, y: 0, vx: 0, vy: 0,
      size: 0, baseAlpha: 0, alpha: 0,
      twinkleSpeed: 0, twinklePhase: 0,
      color: '', speed: 0, opacity: 0,
      wobble: 0, wobbleSpeed: 0, wobbleRange: 0,
      thickness: 0, swayScale: 0, angle: 0,
      rotationSpeed: 0, wingPosition: 0,
      flapTimer: 0, flapInterval: 0,
      facing: 1
    }));
    this.activeCount = 0;
    this._meteorAcc = 0;
    this._ufoAcc = 0;
    this._monsterAcc = 0;
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
    
    // Reset pool count and seed generator state on init
    this.activeCount = 0;
    for (let i = 0; i < this.poolSize; i++) {
      this.particles[i].active = false;
    }
    
    this.prng = createRandom(this.seed);
    this.initializeStaticSystems();

    // Subscribe to semantic dispatcher signals
    if (events) {
      events.addEventListener('spawn-birds', (data) => this.onSpawnBirds(data));
      events.addEventListener('spawn-fireflies', (data) => this.onSpawnFireflies(data));
      events.addEventListener('spawn-click-particles', (data) => this.onSpawnClickParticles(data));
      events.addEventListener('spawn-meteors', (data) => this.onSpawnMeteors(data));
    }
  }

  resize(width, height) {
    super.resize(width, height);
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      p.x = Math.min(p.x, this.width);
      p.y = Math.min(p.y, this.height);
    }
    this.initializeStaticSystems();
  }

  // Activates an available particle slot and populates its properties in-place
  spawnParticle(type, x, y, vx, vy, properties = null) {
    if (this.activeCount >= this.poolSize) return null;
    
    const p = this.particles[this.activeCount];
    p.active = true;
    p.type = type;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;

    // Reset properties to default
    p.size = 0; p.baseAlpha = 0; p.alpha = 0;
    p.twinkleSpeed = 0; p.twinklePhase = 0;
    p.color = ''; p.speed = 0; p.opacity = 0;
    p.wobble = 0; p.wobbleSpeed = 0; p.wobbleRange = 0;
    p.thickness = 0; p.swayScale = 0; p.angle = 0;
    p.rotationSpeed = 0; p.wingPosition = 0;
    p.flapTimer = 0; p.flapInterval = 0;
    p.facing = 1;

    if (properties) {
      for (const key in properties) {
        p[key] = properties[key];
      }
    }

    this.activeCount++;
    return p;
  }

  // Deactivates a particle at index by swapping it with the last active element in O(1)
  deactivateParticle(idx) {
    const lastIdx = this.activeCount - 1;
    if (idx !== lastIdx) {
      const dest = this.particles[idx];
      const src = this.particles[lastIdx];
      this.copyParticle(dest, src);
    }
    this.particles[lastIdx].active = false;
    this.activeCount--;
  }

  // Fast register copy helper
  copyParticle(dest, src) {
    dest.type = src.type;
    dest.x = src.x;
    dest.y = src.y;
    dest.vx = src.vx;
    dest.vy = src.vy;
    dest.size = src.size;
    dest.baseAlpha = src.baseAlpha;
    dest.alpha = src.alpha;
    dest.twinkleSpeed = src.twinkleSpeed;
    dest.twinklePhase = src.twinklePhase;
    dest.color = src.color;
    dest.speed = src.speed;
    dest.opacity = src.opacity;
    dest.wobble = src.wobble;
    dest.wobbleSpeed = src.wobbleSpeed;
    dest.wobbleRange = src.wobbleRange;
    dest.thickness = src.thickness;
    dest.swayScale = src.swayScale;
    dest.angle = src.angle;
    dest.rotationSpeed = src.rotationSpeed;
    dest.wingPosition = src.wingPosition;
    dest.flapTimer = src.flapTimer;
    dest.flapInterval = src.flapInterval;
    dest.facing = src.facing;
  }

  // Event handler for semantic bird flock spawning
  onSpawnBirds(data) {
    if (this.parallaxFactor > 0.15) return;

    const count = data.count || 5;
    const direction = data.direction || 1;
    const flightY = this.height * (data.yRatio || 0.25);
    const startX = direction === 1 ? -60 : this.width + 60;

    for (let i = 0; i < count; i++) {
      const ox = -direction * (i * 24 + randomRange(0, 15, this.prng));
      const oy = (i * 12 + randomRange(0, 8, this.prng)) - (count * 6);
      const speed = randomRange(60.0, 95.0, this.prng);

      this.spawnParticle('bird', startX + ox, flightY + oy, direction * speed, randomRange(-3.0, 3.0, this.prng), {
        size: randomRange(12, 22, this.prng),
        opacity: randomRange(0.7, 0.95, this.prng),
        wingPosition: 0.0,
        flapTimer: 0.0,
        flapInterval: randomRange(0.10, 0.18, this.prng),
        color: "#1c2432"
      });
    }
  }

  // Event handler for semantic firefly spawning
  onSpawnFireflies(data) {
    if (this.parallaxFactor < 0.6) return;

    const count = data.count || 3;
    for (let i = 0; i < count; i++) {
      this.spawnParticle('snow', 
        randomRange(20, this.width - 20, this.prng),
        randomRange(this.height * 0.70, this.height * 0.92, this.prng),
        randomRange(-20, 20, this.prng),
        randomRange(-10, -25, this.prng),
        {
          size: randomRange(2.0, 3.5, this.prng),
          opacity: randomRange(0.65, 0.98, this.prng),
          wobble: randomRange(0, Math.PI * 2, this.prng),
          wobbleSpeed: randomRange(1.8, 3.5, this.prng),
          wobbleRange: 3.5,
          color: "#aaff33"
        }
      );
    }
  }

  // Event handler to spawn foliage/snow/glimmer bursts on click coordinates
  onSpawnClickParticles(data) {
    const x = data.x;
    const y = data.y;

    if (this.particleTypes.includes('leaves')) {
      const leafConfig = this.config.leaves;
      const count = 6;
      for (let i = 0; i < count; i++) {
        this.spawnParticle('leaf', x, y, 
          randomRange(-60, 60, this.prng),
          randomRange(-40, 10, this.prng),
          {
            size: randomRange(leafConfig.sizeMin * 0.8, leafConfig.sizeMax * 1.2, this.prng),
            wobble: randomRange(0, Math.PI * 2, this.prng),
            wobbleSpeed: randomRange(leafConfig.wobbleSpeedMin, leafConfig.wobbleSpeedMax, this.prng),
            swayScale: leafConfig.swayScale,
            angle: randomRange(0, Math.PI * 2, this.prng),
            rotationSpeed: randomRange(-2.5, 2.5, this.prng),
            color: randomChoice(leafConfig.colors, this.prng)
          }
        );
      }
    }

    if (this.particleTypes.includes('snow') || this.particleTypes.includes('stars')) {
      const count = 8;
      for (let i = 0; i < count; i++) {
        this.spawnParticle('snow', x, y, 
          randomRange(-40, 40, this.prng),
          randomRange(-40, 20, this.prng),
          {
            size: randomRange(1.5, 3.0, this.prng),
            opacity: randomRange(0.7, 1.0, this.prng),
            wobble: randomRange(0, Math.PI * 2, this.prng),
            wobbleSpeed: randomRange(2.0, 4.2, this.prng),
            wobbleRange: 4.5,
            color: this.particleTypes.includes('snow') ? "#aaff33" : "#ffffff"
          }
        );
      }
    }
  }

  onSpawnMeteors(data) {
    if (this.parallaxFactor > 0.15) return;

    const palette = data.colorful
      ? ['#ff4d6d', '#ff9f1c', '#ffe66d', '#7bf1a8', '#4cc9f0', '#c77dff', '#ffffff']
      : ['#ffffff', '#cdeaff', '#ffe9c2'];
    const count = data.count || 2;
    for (let i = 0; i < count; i++) {
      const startX = randomRange(this.width * 0.05, this.width * 0.9, this.prng);
      const startY = randomRange(-30, this.height * 0.25, this.prng);
      const speed = randomRange(480, 920, this.prng);
      const angle = randomRange(0.3, 0.75, this.prng);

      this.spawnParticle('meteor', startX, startY, Math.cos(angle) * speed, Math.sin(angle) * speed, {
        size: randomRange(3.2, 7.0, this.prng),
        opacity: randomRange(0.85, 1.0, this.prng),
        color: randomChoice(palette, this.prng)
      });
    }
  }

  // Builds a few wavy aurora ribbons once — their motion comes from an
  // animated phase in update(), not from re-spawning like particles.
  initializeAurora() {
    this.auroraRibbons = AURORA_COLORS.map((color, i) => ({
      baseY: this.height * (0.04 + i * 0.06),
      amplitude: randomRange(26, 44, this.prng),
      frequency: randomRange(0.004, 0.009, this.prng),
      phase: randomRange(0, Math.PI * 2, this.prng),
      thickness: randomRange(90, 150, this.prng),
      speed: randomRange(0.15, 0.3, this.prng),
      opacity: randomRange(0.75, 1.0, this.prng),
      color
    }));
  }

  initializeStaticSystems() {
    if (this.particleTypes.includes('stars')) {
      this.initializeAurora();

      // Clear old stars using swap-to-delete loop
      for (let i = 0; i < this.activeCount; i++) {
        if (this.particles[i].type === 'star') {
          this.deactivateParticle(i);
          i--;
        }
      }
      const starConfig = this.config.stars || { starCount: 150 };
      for (let i = 0; i < starConfig.starCount; i++) {
        this.spawnParticle('star',
          randomRange(0, this.width, this.prng),
          randomRange(0, this.height * 0.65, this.prng),
          0, 0,
          {
            size: randomRange(0.6, 2.2, this.prng),
            baseAlpha: randomRange(0.2, 0.9, this.prng),
            alpha: 0.0,
            twinkleSpeed: randomRange(1.5, 4.0, this.prng),
            twinklePhase: randomRange(0, Math.PI * 2, this.prng),
            color: randomChoice(starConfig.starColors || ["#ffffff"], this.prng)
          }
        );
      }
    }

    if (this.particleTypes.includes('clouds')) {
      let currentCloudCount = 0;
      for (let i = 0; i < this.activeCount; i++) {
        if (this.particles[i].type === 'cloud') currentCloudCount++;
      }
      
      const cloudConfig = this.config.clouds || { maxCount: 6 };
      if (currentCloudCount < cloudConfig.maxCount) {
        const toSpawn = cloudConfig.maxCount - currentCloudCount;
        for (let i = 0; i < toSpawn; i++) {
          this.spawnParticle('cloud',
            randomRange(-150, this.width + 100, this.prng),
            randomRange(this.height * 0.05, this.height * 0.40, this.prng),
            0, 0,
            {
              size: randomRange(cloudConfig.sizeMin, cloudConfig.sizeMax, this.prng),
              opacity: randomRange(cloudConfig.opacityMin, cloudConfig.opacityMax, this.prng),
              speed: randomRange(cloudConfig.speedMin, cloudConfig.speedMax, this.prng),
              color: cloudConfig.color || "#ffffff"
            }
          );
        }
      }
    }
  }

  update(dt, services, events) {
    const windSpeed = services.motion.getWindVelocity();
    const sparkle = services.atmosphere ? services.atmosphere.starSparkle : 0;

    // Aurora ribbons drift independently of the particle pool — just a
    // slow phase advance per band, no spawning/expiry involved.
    for (let i = 0; i < this.auroraRibbons.length; i++) {
      this.auroraRibbons[i].phase += dt * this.auroraRibbons[i].speed;
    }

    // 1. Contiguously Update Existing Particles
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      let expired = false;

      if (p.type === 'star') {
        // Treble/brightness ("sparkle") speeds up and deepens the twinkle,
        // and lifts base visibility — "more visible stars, faster scintillation".
        p.twinklePhase += dt * p.twinkleSpeed * (1 + sparkle * 1.5);
        const alphaBoost = p.baseAlpha * sparkle * 0.3;
        p.alpha = Math.max(0.0, Math.min(1.0, p.baseAlpha + alphaBoost + Math.sin(p.twinklePhase) * (0.2 + sparkle * 0.15)));
      }

      else if (p.type === 'meteor') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        expired = p.y >= this.height + 50 || p.x >= this.width + 100;
      }

      else if (p.type === 'cloud') {
        const cloudSpeed = p.speed + windSpeed * 0.05;
        p.x += cloudSpeed * dt;
        
        if (p.x > this.width + 200) {
          p.x = -p.size - 100;
          p.y = randomRange(this.height * 0.05, this.height * 0.40, this.prng);
        }
      } 
      
      else if (p.type === 'rain') {
        p.x += (p.vx + windSpeed) * dt;
        p.y += p.vy * dt;
        expired = p.y >= this.height + 50 || p.x <= -150 || p.x >= this.width + 150;
      } 
      
      else if (p.type === 'snow') {
        p.wobble += dt * p.wobbleSpeed;
        const jitter = services.motion.getTurbulence(p.x, p.y, 0.02);
        p.x += (p.vx + windSpeed * 0.4 + jitter) * dt;
        p.y += p.vy * dt;
        expired = p.y >= this.height + 50 || p.x <= -150 || p.x >= this.width + 150;
      } 
      
      else if (p.type === 'leaf') {
        p.wobble += dt * p.wobbleSpeed;
        p.x += (p.vx + windSpeed * 0.75 + Math.sin(p.wobble) * p.swayScale * 40.0) * dt;
        p.y += p.vy * dt;
        p.angle += p.rotationSpeed * dt;
        expired = p.y >= this.height + 50 || p.x <= -150 || p.x >= this.width + 150;
      }
      
      else if (p.type === 'bird') {
        p.flapTimer += dt;
        if (p.flapTimer >= p.flapInterval) {
          p.flapTimer = 0.0;
          p.wingPosition = p.wingPosition === 0.0 ? -1.0 : (p.wingPosition === -1.0 ? 1.0 : 0.0);
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        expired = p.vx > 0 ? p.x >= this.width + 100 : p.x <= -100;
      }

      else if (p.type === 'ufo') {
        p.wobble += dt * p.wobbleSpeed;
        p.x += p.vx * dt;
        p.y += p.vy * dt + Math.sin(p.wobble) * 8 * dt;
        expired = p.vx > 0 ? p.x >= this.width + 120 : p.x <= -120;
      }

      else if (p.type === 'monster') {
        p.wobble += dt * p.wobbleSpeed;
        p.x += p.vx * dt;
        const hills = services.layers && (services.layers['rolling-hills'] || services.layers['mid-mountains']);
        if (hills) p.y = hills.getHeightAt(p.x);
        expired = p.x < -80 || p.x > this.width + 80;
      }

      if (expired) {
        this.deactivateParticle(i);
        i--; // Step back to re-evaluate this index containing swapped particle
      }
    }

    // Music-only apocalypse phenoms (extra clouds, meteor storm, UFOs, monsters)
    spawnMusicPhenoms(this, dt, services.atmosphere, services.layers);

    // 2. Spawn Active Weather/Foliage Particles dynamically
    const typesLen = this.particleTypes.length;
    for (let t = 0; t < typesLen; t++) {
      const type = this.particleTypes[t];

      if (type === 'rain') {
        const rainConfig = this.config.rain;
        const rainIntensity = services.atmosphere ? services.atmosphere.rainIntensity : 0;
        const effectiveMax = Math.floor(rainConfig.maxCount * rainIntensity);

        let currentRainCount = 0;
        for (let i = 0; i < this.activeCount; i++) {
          if (this.particles[i].type === 'rain') currentRainCount++;
        }
        // Burst harder at high intensity so extreme rain fills in fast
        const burst = Math.min(40, 12 + Math.floor(rainIntensity * 32));
        const countToSpawn = Math.min(burst, effectiveMax - currentRainCount);
        const rainColor = (services.atmosphere && services.atmosphere.skyShift > 0.3)
          ? '#a8f0ff'
          : rainConfig.color;

        for (let i = 0; i < countToSpawn; i++) {
          this.spawnParticle('rain',
            randomRange(-100, this.width + 100, this.prng),
            randomRange(-60, -5, this.prng),
            randomRange(-18, 18, this.prng),
            randomRange(rainConfig.fallSpeed * 0.85, rainConfig.fallSpeed * 1.4, this.prng),
            {
              thickness: rainConfig.thickness * (0.9 + rainIntensity * 0.6),
              opacity: randomRange(rainConfig.opacity * 0.7, rainConfig.opacity * 1.4, this.prng),
              color: rainColor
            }
          );
        }
      } 
      
      else if (type === 'snow') {
        const snowConfig = this.config.snow;
        let currentSnowCount = 0;
        for (let i = 0; i < this.activeCount; i++) {
          if (this.particles[i].type === 'snow') currentSnowCount++;
        }
        const countToSpawn = Math.min(5, snowConfig.maxCount - currentSnowCount);
        
        for (let i = 0; i < countToSpawn; i++) {
          this.spawnParticle('snow',
            randomRange(-50, this.width + 50, this.prng),
            randomRange(-20, -5, this.prng),
            randomRange(-5, 5, this.prng),
            randomRange(snowConfig.fallSpeed * 0.7, snowConfig.fallSpeed * 1.3, this.prng),
            {
              size: randomRange(snowConfig.sizeMin, snowConfig.sizeMax, this.prng),
              opacity: randomRange(snowConfig.opacity * 0.7, snowConfig.opacity * 1.0, this.prng),
              wobble: randomRange(0, Math.PI * 2, this.prng),
              wobbleSpeed: randomRange(1.2, 2.8, this.prng),
              wobbleRange: snowConfig.wobbleRange,
              color: snowConfig.color
            }
          );
        }
      } 
      
      else if (type === 'leaves') {
        const leafConfig = this.config.leaves;
        let currentLeafCount = 0;
        for (let i = 0; i < this.activeCount; i++) {
          if (this.particles[i].type === 'leaf') currentLeafCount++;
        }
        
        this.spawnTimer += dt;
        if (this.spawnTimer >= 0.15 && currentLeafCount < leafConfig.maxCount) {
          this.spawnTimer = 0.0;
          this.spawnParticle('leaf',
            randomRange(-50, this.width * 0.95, this.prng),
            randomRange(-30, this.height * 0.35, this.prng),
            randomRange(10, 30, this.prng),
            randomRange(leafConfig.fallSpeedMin, leafConfig.fallSpeedMax, this.prng),
            {
              size: randomRange(leafConfig.sizeMin, leafConfig.sizeMax, this.prng),
              wobble: randomRange(0, Math.PI * 2, this.prng),
              wobbleSpeed: randomRange(leafConfig.wobbleSpeedMin, leafConfig.wobbleSpeedMax, this.prng),
              swayScale: leafConfig.swayScale,
              angle: randomRange(0, Math.PI * 2, this.prng),
              rotationSpeed: randomRange(-1.5, 1.5, this.prng),
              color: randomChoice(leafConfig.colors, this.prng)
            }
          );
        }
      }
    }
  }

  draw(ctx, services, lightState) {
    const atm = services.atmosphere;
    const apocalypse = atm ? (atm.skyShift > 0.05 || atm.meteorStorm > 0.05 || atm.ufoPresence > 0.05) : false;
    const nightWeight = services.time.getDayPhases().night;
    // Music apocalypse forces sky phenomena visible even at noon
    const skyVisible = lightState.intensity < 0.8 || apocalypse;

    if (skyVisible) {
      drawStars(ctx, this.particles, this.activeCount, Math.max(nightWeight, atm ? atm.skyShift * 0.7 : 0));
      if (atm) {
        drawAurora(ctx, this.auroraRibbons, this.width, atm.auroraIntensity * Math.max(nightWeight, atm.skyShift));
      }
    }

    drawClouds(ctx, this.particles, this.activeCount, lightState, services.lighting);
    // After clouds so saucers/streaks aren't buried under the overcast
    drawMeteors(ctx, this.particles, this.activeCount);
    drawUfos(ctx, this.particles, this.activeCount);
    drawMonsters(ctx, this.particles, this.activeCount);
    drawBirds(ctx, this.particles, this.activeCount);
    drawWeather(ctx, this.particles, 'rain', this.activeCount);
    drawWeather(ctx, this.particles, 'snow', this.activeCount);
    drawLeaves(ctx, this.particles, this.activeCount, lightState, services.lighting);
  }
}

registerPrimitive('emitter', EmitterPrimitive);
