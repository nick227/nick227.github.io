import { Noise1D } from '../utils/math.js';

export class MotionService {
  constructor() {
    this.baseSpeed = 1.0;        // Base wind speed multiplier
    this.baseSpeedTarget = 1.0;  // Eased toward continuously (e.g. by NatureDirector)

    this.direction = 1.0;        // 1.0 = left to right, -1.0 = right to left
    this.directionTarget = 1.0;

    this.turbulenceAmount = 1.0;   // Multiplier on noise-driven jitter/chop
    this.turbulenceTarget = 1.0;

    // Per-band wind boosts: a deliberate, literal spectral mapping (bass
    // moves heavy things like trees, mid moves lighter things like grass)
    // rather than an interpreted-mood control. See getWindDisplacement's
    // `band` argument.
    this.bassBoost = 1.0;
    this.bassBoostTarget = 1.0;
    this.midBoost = 1.0;
    this.midBoostTarget = 1.0;

    // Gust envelope. Tracked as a start time + duration (rather than a
    // countdown) so depth-delayed layers can compute "how far into the
    // gust is a layer this far away" independently — see _gustEnvelopeAt.
    this.gustTarget = 0.0;
    this.gustDuration = 0.0;
    this.gustStartTime = -Infinity;
    this.gustPropagationDelay = 2.2; // seconds of extra delay for the most distant layer

    this.mouseGust = 0.0;        // Dynamic mouse-swipe wind influence
    this.gustIntensity = 0.0;    // Foreground (depth=1) gust reference, for getWindVelocity()

    this.noise = new Noise1D(99);
    this.elapsedTime = 0.0;
  }

  update(dt) {
    this.elapsedTime += dt;

    // Ease continuously-controlled fields toward their targets rather than
    // snapping, so an external director can "suggest" values that still
    // read as organic wind rather than a value being flipped. Speed/
    // turbulence use a fast rate (~0.5s to mostly catch up) so a mood
    // shift reads as immediate; direction stays a slow lean on purpose.
    this.baseSpeed += (this.baseSpeedTarget - this.baseSpeed) * Math.min(1, dt * 1.8);
    this.turbulenceAmount += (this.turbulenceTarget - this.turbulenceAmount) * Math.min(1, dt * 1.8);
    this.direction += (this.directionTarget - this.direction) * Math.min(1, dt * 0.15);
    this.bassBoost += (this.bassBoostTarget - this.bassBoost) * Math.min(1, dt * 3.0);
    this.midBoost += (this.midBoostTarget - this.midBoost) * Math.min(1, dt * 3.0);

    this.gustIntensity = this._gustEnvelopeAt(1.0);

    // Exponential decay of mouse swipes impulse wind
    this.mouseGust += (0.0 - this.mouseGust) * 2.8 * dt;
  }

  // Starts a gust envelope. Depth-aware: getWindDisplacement(x, freq, depth)
  // reads it delayed per-depth, so a single trigger can visibly sweep from
  // foreground to distant layers instead of hitting everything at once.
  triggerGust(intensity = 2.5, duration = 4.0) {
    this.gustTarget = intensity;
    this.gustDuration = duration;
    this.gustStartTime = this.elapsedTime;
  }

  // Inject a temporary horizontal force based on mouse swipe velocity
  triggerMouseGust(vx) {
    // Add velocity delta, capped to prevent extreme visual distortion
    const forceDelta = vx * 0.0035;
    this.mouseGust = Math.max(-5.0, Math.min(5.0, this.mouseGust + forceDelta));
  }

  // Immediate + target (used once at channel load, where no easing-in is wanted)
  setBaseSpeed(speed) {
    this.baseSpeed = speed;
    this.baseSpeedTarget = speed;
  }

  // Target-only (used for continuous, eased control — e.g. NatureDirector)
  setBaseSpeedTarget(speed) {
    this.baseSpeedTarget = speed;
  }

  setTurbulenceTarget(amount) {
    this.turbulenceTarget = Math.max(0, amount);
  }

  setDirectionTarget(direction) {
    this.directionTarget = Math.max(-1.5, Math.min(1.5, direction));
  }

  setBassBoostTarget(amount) {
    this.bassBoostTarget = Math.max(0, amount);
  }

  setMidBoostTarget(amount) {
    this.midBoostTarget = Math.max(0, amount);
  }

  // Gust strength at a given depth (0 = most distant layer, 1 = foreground),
  // accounting for the propagation delay so far layers feel it later.
  _gustEnvelopeAt(depth) {
    if (this.gustDuration <= 0) return 0;

    const delay = (1 - depth) * this.gustPropagationDelay;
    const localElapsed = this.elapsedTime - this.gustStartTime - delay;
    if (localElapsed < 0 || localElapsed > this.gustDuration) return 0;

    const progress = localElapsed / this.gustDuration;
    return Math.sin(progress * Math.PI) * this.gustTarget;
  }

  // Calculates a spatial wind displacement angle (in radians) for an object
  // at coordinate X. `depth` should be the layer's parallaxFactor (0..1) —
  // defaults to foreground (no propagation delay) for callers that don't
  // pass one. `band` ('bass' | 'mid' | undefined) applies that band's
  // boost multiplier — the literal spectral-mapping feature, distinct
  // from the general music-is-playing wind response.
  getWindDisplacement(x, spatialFrequency = 0.005, depth = 1.0, band = undefined) {
    const timeFactor = this.elapsedTime * 1.2;
    const noiseVal = this.noise.noise(x * spatialFrequency + timeFactor);

    const bandBoost = band === 'bass' ? this.bassBoost : band === 'mid' ? this.midBoost : 1.0;
    const gustAtDepth = this._gustEnvelopeAt(depth);
    const totalWindStrength = (this.baseSpeed + gustAtDepth + Math.abs(this.mouseGust)) * bandBoost;

    // Wave oscillation combined with turbulence
    const baseOscillation = Math.sin(timeFactor * 0.8 + x * 0.01) * 0.08 * totalWindStrength;
    const turbulence = (noiseVal - 0.5) * 0.15 * totalWindStrength * this.turbulenceAmount;

    // Add direct offset from mouse swipe
    const mouseOffset = this.mouseGust * 0.14;

    return (baseOscillation + turbulence) * this.direction + mouseOffset;
  }

  // Get wind speed in pixels per second for particle physics
  getWindVelocity() {
    const ambientSpeed = (this.baseSpeed * 40.0 + this.gustIntensity * 120.0) * this.direction;
    const swipeSpeed = this.mouseGust * 75.0;
    return ambientSpeed + swipeSpeed;
  }

  // Get turbulence vector for high-frequency particle jitter
  getTurbulence(x, y, scale = 0.01) {
    const t = this.elapsedTime * 2.0;
    const n = this.noise.noise(x * scale + y * scale + t);
    return (n - 0.5) * 8.0 * this.turbulenceAmount;
  }
}
export default MotionService;
