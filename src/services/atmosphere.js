// Scene mood + music-only apocalypse levels. Every field eases toward a
// target so NatureDirector can slam phenoms on and still get a smooth
// fade-out when music stops.

function ease(current, target, dt, upRate, downRate) {
  const rate = target > current ? upRate : downRate;
  return current + (target - current) * Math.min(1, dt * rate);
}

export class AtmosphereService {
  constructor() {
    this.haze = 0.42;
    this.hazeTarget = 0.42;
    this.bloom = 0.22;
    this.bloomTarget = 0.22;
    this.vignette = 0.48;
    this.vignetteTarget = 0.48;

    this.auroraIntensity = 0;
    this.auroraIntensityTarget = 0;
    this.starSparkle = 0;
    this.starSparkleTarget = 0;
    this.rainIntensity = 0;
    this.rainIntensityTarget = 0;

    // Music-only apocalypse phenoms — zero without a track playing.
    this.skyShift = 0;
    this.skyShiftTarget = 0;
    this.cloudBoost = 0;
    this.cloudBoostTarget = 0;
    this.meteorStorm = 0;
    this.meteorStormTarget = 0;
    this.ufoPresence = 0;
    this.ufoPresenceTarget = 0;
    this.monsterPresence = 0;
    this.monsterPresenceTarget = 0;
  }

  update(dt) {
    this.haze = ease(this.haze, this.hazeTarget, dt, 1.4, 0.35);
    this.bloom = ease(this.bloom, this.bloomTarget, dt, 1.4, 0.35);
    this.vignette = ease(this.vignette, this.vignetteTarget, dt, 1.4, 0.35);
    this.auroraIntensity = ease(this.auroraIntensity, this.auroraIntensityTarget, dt, 2.0, 0.4);
    this.starSparkle = ease(this.starSparkle, this.starSparkleTarget, dt, 2.0, 0.4);

    // Phenoms ease in gently, leave slowly on music stop.
    this.skyShift = ease(this.skyShift, this.skyShiftTarget, dt, 1.2, 0.45);
    this.cloudBoost = ease(this.cloudBoost, this.cloudBoostTarget, dt, 0.9, 0.35);
    this.rainIntensity = ease(this.rainIntensity, this.rainIntensityTarget, dt, 0.8, 0.28);
    this.meteorStorm = ease(this.meteorStorm, this.meteorStormTarget, dt, 1.0, 0.4);
    this.ufoPresence = ease(this.ufoPresence, this.ufoPresenceTarget, dt, 0.7, 0.35);
    this.monsterPresence = ease(this.monsterPresence, this.monsterPresenceTarget, dt, 0.6, 0.3);
  }

  setHazeTarget(amount) { this.hazeTarget = Math.max(0, Math.min(1, amount)); }
  setBloomTarget(amount) { this.bloomTarget = Math.max(0, Math.min(0.6, amount)); }
  setVignetteTarget(amount) { this.vignetteTarget = Math.max(0.15, Math.min(0.7, amount)); }
  setAuroraIntensityTarget(amount) { this.auroraIntensityTarget = Math.max(0, Math.min(1, amount)); }
  setStarSparkleTarget(amount) { this.starSparkleTarget = Math.max(0, Math.min(1, amount)); }
  setRainIntensityTarget(amount) { this.rainIntensityTarget = Math.max(0, Math.min(1, amount)); }
  setSkyShiftTarget(amount) { this.skyShiftTarget = Math.max(0, Math.min(1, amount)); }
  setCloudBoostTarget(amount) { this.cloudBoostTarget = Math.max(0, Math.min(1, amount)); }
  setMeteorStormTarget(amount) { this.meteorStormTarget = Math.max(0, Math.min(1, amount)); }
  setUfoPresenceTarget(amount) { this.ufoPresenceTarget = Math.max(0, Math.min(1, amount)); }
  setMonsterPresenceTarget(amount) { this.monsterPresenceTarget = Math.max(0, Math.min(1, amount)); }
}
