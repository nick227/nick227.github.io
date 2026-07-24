// Reduces raw FFT/time-domain data from a Web Audio AnalyserNode into a
// small set of instantaneous audio features, sampled once per frame.
//
// This is the "sensor" layer — it carries no musical meaning by itself.
// See MusicInterpreter for that. Kept deliberately dumb and cheap so it
// can run every frame without deciding anything.

const BASS_RANGE_HZ = [20, 250];
const MID_RANGE_HZ = [250, 2000];
const TREBLE_RANGE_HZ = [2000, 8000];
const OCCUPANCY_NOISE_FLOOR = 24; // 0-255; bins below this don't count as "active"

function hzToBin(hz, binHz, maxBin) {
  return Math.max(0, Math.min(Math.round(hz / binHz), maxBin));
}

function bandAverage(data, fromBin, toBin) {
  const start = Math.min(fromBin, data.length - 1);
  const end = Math.min(Math.max(toBin, start + 1), data.length);
  let sum = 0;
  for (let i = start; i < end; i++) sum += data[i];
  return end > start ? sum / (end - start) / 255 : 0;
}

export class AudioAnalyzer {
  constructor() {
    this.node = null;
    this.freqData = null;
    this.prevFreqData = null;
    this.timeData = null;
    this.binHz = 0;
    this.warmedUp = false;

    // Public per-frame output — always present, all values 0..1.
    this.features = {
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
      centroid: 0,
      occupancy: 0,
      onset: 0
    };
  }

  // Called once the analysis AnalyserNode exists (after the audio graph
  // is built on first play). Safe to call more than once.
  attach(analyserNode, sampleRate) {
    this.node = analyserNode;
    const binCount = analyserNode.frequencyBinCount;
    this.freqData = new Uint8Array(binCount);
    this.prevFreqData = new Uint8Array(binCount);
    this.timeData = new Uint8Array(analyserNode.fftSize);
    this.binHz = (sampleRate / 2) / binCount;
    this.warmedUp = false;
  }

  // Call once per frame. `active` is false while paused — features decay
  // toward silence rather than freezing mid-frame.
  update(active) {
    if (!this.node || !active) {
      this.warmedUp = false;
      this._decay();
      return this.features;
    }

    this.node.getByteFrequencyData(this.freqData);
    this.node.getByteTimeDomainData(this.timeData);

    const maxBin = this.freqData.length - 1;
    const [bassLo, bassHi] = BASS_RANGE_HZ.map((hz) => hzToBin(hz, this.binHz, maxBin));
    const [midLo, midHi] = MID_RANGE_HZ.map((hz) => hzToBin(hz, this.binHz, maxBin));
    const [trebLo, trebHi] = TREBLE_RANGE_HZ.map((hz) => hzToBin(hz, this.binHz, maxBin));

    const f = this.features;
    f.bass = bandAverage(this.freqData, bassLo, bassHi);
    f.mid = bandAverage(this.freqData, midLo, midHi);
    f.treble = bandAverage(this.freqData, trebLo, trebHi);

    // RMS loudness from time-domain samples (128 is the silent midpoint)
    let sumSquares = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const v = (this.timeData[i] - 128) / 128;
      sumSquares += v * v;
    }
    f.volume = Math.sqrt(sumSquares / this.timeData.length);

    // Spectral centroid ("brightness"), normalized to the analysed range
    let weightedSum = 0;
    let magSum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      weightedSum += i * this.freqData[i];
      magSum += this.freqData[i];
    }
    f.centroid = magSum > 0 ? (weightedSum / magSum) / this.freqData.length : 0;

    // Spectral occupancy: fraction of bins carrying real signal right now
    // (sparse solo instrument vs. a dense wall-of-sound arrangement)
    let activeBins = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      if (this.freqData[i] > OCCUPANCY_NOISE_FLOOR) activeBins++;
    }
    f.occupancy = activeBins / this.freqData.length;

    // Spectral flux onset detection: sum of frame-to-frame increases
    // across bins. Spikes sharply on percussive/transient hits.
    if (!this.warmedUp) {
      // Skip the first active frame so resuming playback can't read the
      // silence-to-sound jump as a false onset spike.
      this.prevFreqData.set(this.freqData);
      f.onset = 0;
      this.warmedUp = true;
    } else {
      let flux = 0;
      for (let i = 0; i < this.freqData.length; i++) {
        const diff = this.freqData[i] - this.prevFreqData[i];
        if (diff > 0) flux += diff;
      }
      f.onset = Math.min(1, (flux / (this.freqData.length * 255)) * 8);
      this.prevFreqData.set(this.freqData);
    }

    return f;
  }

  _decay() {
    const f = this.features;
    f.bass *= 0.9;
    f.mid *= 0.9;
    f.treble *= 0.9;
    f.volume *= 0.9;
    f.occupancy *= 0.9;
    f.onset *= 0.8;
    // centroid is left at its last value — meaningless at zero energy
  }
}
