// Music-only apocalypse particle spawns for EmitterPrimitive.
// Keeps the continuous phenom logic out of the already-large emitter file.

import { randomRange, randomChoice } from '../utils/math.js';

const METEOR_COLORS = [
  '#ff4d6d', '#ff9f1c', '#ffe66d', '#7bf1a8', '#4cc9f0', '#c77dff', '#ff006e', '#ffffff'
];

const UFO_COLORS = ['#b8f2e6', '#a0e7e5', '#daf0ee', '#c9f0ff'];
const MONSTER_COLORS = ['#0a0804', '#140c06', '#1a0510', '#05140a'];

export function countOfType(particles, activeCount, type) {
  let n = 0;
  for (let i = 0; i < activeCount; i++) {
    if (particles[i].type === type) n++;
  }
  return n;
}

export function spawnMusicPhenoms(emitter, dt, atmosphere, layers) {
  if (!atmosphere) return;

  spawnExtraClouds(emitter, atmosphere.cloudBoost);
  pruneExtraClouds(emitter, atmosphere.cloudBoost);
  spawnMeteorStorm(emitter, dt, atmosphere.meteorStorm);
  spawnUfos(emitter, dt, atmosphere.ufoPresence);
  spawnMonsters(emitter, dt, atmosphere.monsterPresence, layers);
}

function pruneExtraClouds(emitter, cloudBoost) {
  if (!emitter.particleTypes.includes('clouds')) return;
  const cloudConfig = emitter.config.clouds || { maxCount: 8 };
  const target = Math.max(cloudConfig.maxCount, Math.floor(cloudConfig.maxCount * (1 + cloudBoost * 2.5)));
  let cloudCount = countOfType(emitter.particles, emitter.activeCount, 'cloud');
  if (cloudCount <= target) return;

  for (let i = emitter.activeCount - 1; i >= 0 && cloudCount > target; i--) {
    const p = emitter.particles[i];
    if (p.type !== 'cloud') continue;
    p.opacity *= 0.94;
    if (p.opacity < 0.05) {
      emitter.deactivateParticle(i);
      cloudCount--;
    }
  }
}

function spawnExtraClouds(emitter, cloudBoost) {
  if (cloudBoost < 0.05 || !emitter.particleTypes.includes('clouds')) return;

  const cloudConfig = emitter.config.clouds || { maxCount: 8 };
  const target = Math.floor(cloudConfig.maxCount * (1 + cloudBoost * 2.5));
  const current = countOfType(emitter.particles, emitter.activeCount, 'cloud');
  const toSpawn = Math.min(4, target - current);
  if (toSpawn <= 0) return;

  for (let i = 0; i < toSpawn; i++) {
    emitter.spawnParticle('cloud',
      randomRange(-200, emitter.width + 80, emitter.prng),
      randomRange(emitter.height * 0.02, emitter.height * 0.48, emitter.prng),
      0, 0,
      {
        size: randomRange(cloudConfig.sizeMin * 1.2, cloudConfig.sizeMax * 1.5, emitter.prng),
        opacity: randomRange(0.45, 0.9, emitter.prng) * (0.7 + cloudBoost * 0.3),
        speed: randomRange(cloudConfig.speedMin * 1.3, cloudConfig.speedMax * 1.8, emitter.prng),
        color: randomChoice(['#c4a8d8', '#b898c8', '#e0b8b8', '#d0c0e0', '#ffffff'], emitter.prng)
      }
    );
  }
}

function spawnMeteorStorm(emitter, dt, storm) {
  if (storm < 0.05 || emitter.parallaxFactor > 0.15) return;

  emitter._meteorAcc = (emitter._meteorAcc || 0) + dt * storm * 22;
  while (emitter._meteorAcc >= 1) {
    emitter._meteorAcc -= 1;
    const startX = randomRange(-40, emitter.width * 0.95, emitter.prng);
    const startY = randomRange(-40, emitter.height * 0.3, emitter.prng);
    const speed = randomRange(500, 1100, emitter.prng);
    const angle = randomRange(0.28, 0.8, emitter.prng);

    emitter.spawnParticle('meteor', startX, startY,
      Math.cos(angle) * speed, Math.sin(angle) * speed,
      {
        size: randomRange(5, 11, emitter.prng) * (0.8 + storm * 0.5),
        opacity: 1,
        color: randomChoice(METEOR_COLORS, emitter.prng)
      }
    );
  }
}

function spawnUfos(emitter, dt, presence) {
  if (presence < 0.08 || emitter.parallaxFactor > 0.15) return;

  const current = countOfType(emitter.particles, emitter.activeCount, 'ufo');
  const target = Math.floor(2 + presence * 6);
  if (current >= target) return;

  emitter._ufoAcc = (emitter._ufoAcc || 0) + dt * presence * 0.7;
  if (emitter._ufoAcc < 1) return;
  emitter._ufoAcc = 0;

  const dir = emitter.prng() < 0.5 ? 1 : -1;
  const startX = dir > 0 ? -80 : emitter.width + 80;

  emitter.spawnParticle('ufo', startX,
    randomRange(emitter.height * 0.06, emitter.height * 0.35, emitter.prng),
    dir * randomRange(50, 100, emitter.prng),
    randomRange(-8, 8, emitter.prng),
    {
      size: randomRange(40, 72, emitter.prng),
      opacity: randomRange(0.85, 1.0, emitter.prng),
      color: randomChoice(UFO_COLORS, emitter.prng),
      wobble: randomRange(0, Math.PI * 2, emitter.prng),
      wobbleSpeed: randomRange(1.5, 3.0, emitter.prng)
    }
  );
}

function spawnMonsters(emitter, dt, presence, layers) {
  if (presence < 0.1) return;
  if (emitter.parallaxFactor > 0.2) return;

  const current = countOfType(emitter.particles, emitter.activeCount, 'monster');
  const target = Math.floor(2 + presence * 5);
  if (current >= target) return;

  emitter._monsterAcc = (emitter._monsterAcc || 0) + dt * presence * 0.55;
  if (emitter._monsterAcc < 1) return;
  emitter._monsterAcc = 0;

  const hills = layers && (layers['rolling-hills'] || layers['mid-mountains']);
  const x = randomRange(emitter.width * 0.08, emitter.width * 0.92, emitter.prng);
  const groundY = hills ? hills.getHeightAt(x) : emitter.height * 0.62;
  const dir = emitter.prng() < 0.5 ? 1 : -1;

  emitter.spawnParticle('monster', x, groundY,
    dir * randomRange(22, 48, emitter.prng), 0,
    {
      size: randomRange(55, 100, emitter.prng) * (0.75 + presence * 0.5),
      opacity: 1,
      color: randomChoice(MONSTER_COLORS, emitter.prng),
      wobble: 0,
      wobbleSpeed: randomRange(2.5, 4.5, emitter.prng),
      facing: dir
    }
  );
}
