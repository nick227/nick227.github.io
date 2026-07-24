// Turns instantaneous AudioFeatures into smoothed, contextual musical
// signals. This is where "raw FFT" becomes "what the music is doing" —
// nothing downstream of this should ever need to know about frequency
// bins again.
//
// All time constants below are a first-pass tuned by ear against the
// generative placeholder pad. They will need re-tuning once a real
// track is in the player — the *shape* of these curves (which signals
// rise fast/slow, fall fast/slow) matters more than the exact numbers.

// Exponential approach toward `target`, with independent time constants
// for rising vs. falling. Passing one tau makes it a plain symmetric EMA.
function approach(current, target, dt, attackTau, releaseTau = attackTau) {
  const tau = target > current ? attackTau : releaseTau;
  const alpha = 1 - Math.exp(-dt / Math.max(tau, 0.001));
  return current + (target - current) * alpha;
}

const MAX_PEAKS = 8;
const MIN_PEAK_GAP = 0.12; // seconds; caps rhythm tracking at ~500 BPM
const RHYTHM_TIMEOUT = 2.5; // seconds of silence before "pulse" gives up

export class MusicInterpreter {
  constructor() {
    this.clock = 0;

    this.peakTimes = [];
    this.lastPeakAt = -Infinity;
    this.onsetAvg = 0;

    this.fastIntensity = 0;
    this.slowIntensity = 0;

    this.state = {
      intensity: 0,  // overall musical force
      pulse: 0,      // rhythmic strength, independent of any one beat
      density: 0,    // sparse vs. busy arrangement
      brightness: 0, // dark/warm vs. bright/shimmering
      tension: 0,    // sustained harshness / unresolved rising energy
      momentum: 0,   // -1..1, is intensity building, falling, or stable
      stillness: 1   // sustained quiet/minimal activity
    };
  }

  update(dt, features) {
    this.clock += dt;
    const s = this.state;

    // Intensity: overall musical force
    const intensityRaw = Math.min(
      1,
      0.5 * features.volume + 0.2 * features.bass + 0.2 * features.mid + 0.1 * features.treble
    );
    s.intensity = approach(s.intensity, intensityRaw, dt, 0.3, 0.6);

    // Momentum: fast trend vs. slow trend of the same raw signal
    this.fastIntensity = approach(this.fastIntensity, intensityRaw, dt, 0.4);
    this.slowIntensity = approach(this.slowIntensity, intensityRaw, dt, 4.0);
    s.momentum = Math.max(-1, Math.min(1, (this.fastIntensity - this.slowIntensity) * 4));

    // Density: smoothed spectral occupancy
    s.density = approach(s.density, features.occupancy, dt, 0.5, 0.8);

    // Brightness: smoothed spectral centroid
    s.brightness = approach(s.brightness, features.centroid, dt, 0.2, 0.5);

    // Pulse: rhythmic regularity — rises only once onsets land steadily,
    // falls quickly once they stop, rather than tracking any one beat.
    this._trackOnsetPeaks(features.onset, dt);
    s.pulse = approach(s.pulse, this._pulseFromPeaks(), dt, 1.0, 1.5);

    // Tension: sustained brightness/density plus a rising trend that
    // hasn't resolved yet
    const tensionRaw = Math.min(1, 0.4 * s.brightness + 0.3 * s.density + 0.3 * Math.max(0, s.momentum));
    s.tension = approach(s.tension, tensionRaw, dt, 2.0, 3.0);

    // Stillness: rises slowly (needs sustained quiet), breaks quickly
    // the moment the music comes back
    const stillnessRaw = 1 - s.intensity;
    s.stillness = approach(s.stillness, stillnessRaw, dt, 3.0, 0.4);

    return s;
  }

  _trackOnsetPeaks(onset, dt) {
    this.onsetAvg = approach(this.onsetAvg, onset, dt, 1.5);
    const threshold = Math.max(0.08, this.onsetAvg * 1.6);

    if (onset > threshold && this.clock - this.lastPeakAt > MIN_PEAK_GAP) {
      this.lastPeakAt = this.clock;
      this.peakTimes.push(this.clock);
      if (this.peakTimes.length > MAX_PEAKS) this.peakTimes.shift();
    }
  }

  _pulseFromPeaks() {
    // No recent onsets — rhythm has stopped, not just gotten quiet
    if (this.clock - this.lastPeakAt > RHYTHM_TIMEOUT || this.peakTimes.length < 4) return 0;

    const intervals = [];
    for (let i = 1; i < this.peakTimes.length; i++) {
      intervals.push(this.peakTimes[i] - this.peakTimes[i - 1]);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (mean <= 0) return 0;

    const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
    const coeffOfVariation = Math.sqrt(variance) / mean;

    // Low variation between onset intervals = steady rhythm = high pulse
    return Math.max(0, Math.min(1, 1 - coeffOfVariation));
  }
}
