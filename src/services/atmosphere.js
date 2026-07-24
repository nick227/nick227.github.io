// Controls the scene's fog/haze, bloom, vignette, and sky-phenomena mood
// (aurora presence, star sparkle). Haze/bloom/vignette are effects the
// renderer already had as fixed constants (Compositor.hazeIntensity,
// PostProcessor bloom/vignette intensities); aurora/sparkle are new but
// follow the exact same "ease toward a suggested target" pattern as
// WindField, so NatureDirector controls all five the same way.

export class AtmosphereService {
  constructor() {
    // Defaults match the renderer's original hardcoded constants, so
    // registering this service with no NatureDirector input changes
    // nothing about the baseline look.
    this.haze = 0.42;
    this.hazeTarget = 0.42;

    this.bloom = 0.22;
    this.bloomTarget = 0.22;

    this.vignette = 0.48;
    this.vignetteTarget = 0.48;

    // Both default to 0 — no aurora/extra sparkle without music at all.
    this.auroraIntensity = 0;
    this.auroraIntensityTarget = 0;

    this.starSparkle = 0;
    this.starSparkleTarget = 0;

    // Rain: 0 = clear, 1 = full storm. Driven by NatureDirector's storm
    // buildup mechanic, not a raw musical signal directly.
    this.rainIntensity = 0;
    this.rainIntensityTarget = 0;
  }

  update(dt) {
    const rate = 1.2; // atmosphere should drift, not snap
    this.haze += (this.hazeTarget - this.haze) * Math.min(1, dt * rate);
    this.bloom += (this.bloomTarget - this.bloom) * Math.min(1, dt * rate);
    this.vignette += (this.vignetteTarget - this.vignette) * Math.min(1, dt * rate);

    const skyRate = 1.5;
    this.auroraIntensity += (this.auroraIntensityTarget - this.auroraIntensity) * Math.min(1, dt * skyRate);
    this.starSparkle += (this.starSparkleTarget - this.starSparkle) * Math.min(1, dt * skyRate);

    // Rain rises fast (a storm should feel like it arrives) but clears
    // more slowly, like real weather trailing off.
    const rainRate = this.rainIntensityTarget > this.rainIntensity ? 1.2 : 0.3;
    this.rainIntensity += (this.rainIntensityTarget - this.rainIntensity) * Math.min(1, dt * rainRate);
  }

  setHazeTarget(amount) {
    this.hazeTarget = Math.max(0, Math.min(1, amount));
  }

  setBloomTarget(amount) {
    this.bloomTarget = Math.max(0, Math.min(0.6, amount));
  }

  setVignetteTarget(amount) {
    this.vignetteTarget = Math.max(0.15, Math.min(0.7, amount));
  }

  setAuroraIntensityTarget(amount) {
    this.auroraIntensityTarget = Math.max(0, Math.min(1, amount));
  }

  setStarSparkleTarget(amount) {
    this.starSparkleTarget = Math.max(0, Math.min(1, amount));
  }

  setRainIntensityTarget(amount) {
    this.rainIntensityTarget = Math.max(0, Math.min(1, amount));
  }
}
