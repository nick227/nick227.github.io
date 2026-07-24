// Minimal generative ambient player driving a live spectrum visualizer.
//
// There is no external audio file wired up yet, so a small synth pad
// plus an occasional plucked note stands in as "the track" — this keeps
// the play/pause + visualizer UI fully functional. Swap `_ensureGraph`
// for an <audio>/MediaElementAudioSourceNode graph once a real track
// is available; the analyser + drawing code needs no changes.

const CHORD_FREQS = [110.0, 138.59, 164.81, 220.0]; // A2, C#3, E3, A3
const ARP_NOTES = [440.0, 493.88, 587.33, 659.25, 739.99]; // A B D E F# pentatonic

export class SpectrumPlayer {
  constructor(canvas, barCount = 28) {
    this.canvas = canvas;
    this.barCount = barCount;
    this.levels = new Uint8Array(barCount);
    this.playing = false;

    this.audioCtx = null;
    this.analyser = null;
    this.master = null;
    this.arpTimer = null;

    this._setupCanvas();
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx2d = this.canvas.getContext('2d');
    this.ctx2d.scale(dpr, dpr);
    this.cssWidth = width;
    this.cssHeight = height;
  }

  // Lazily builds the synth graph on first play — must run inside a user
  // gesture so the AudioContext isn't created (and blocked) ahead of time.
  _ensureGraph() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const master = ctx.createGain();
    // Loud enough that AudioAnalyzer's RMS/intensity clear the
    // impact threshold (~0.35) — the old 0.32 master left intensity
    // stuck near 0.19, so hero nature events never fired.
    master.gain.value = 0.55;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    filter.frequency.value = 1400;

    // Slow LFO sweeps the filter cutoff for gentle, evolving movement
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 700;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Warm detuned pad chord
    CHORD_FREQS.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
    });

    // Visual analyser: tuned to look good (smoothed, coarse resolution)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;

    // Analysis analyser: tuned to measure well (unsmoothed, finer
    // resolution — smoothing at the node level would blur the transients
    // AudioAnalyzer needs for onset/beat detection). Tapped from the same
    // point in the graph so it "hears" exactly what the visual bar does.
    const analysisNode = ctx.createAnalyser();
    analysisNode.fftSize = 1024;
    analysisNode.smoothingTimeConstant = 0.2;

    filter.connect(master);
    master.connect(analyser);
    master.connect(analysisNode); // tap only — not connected onward, so
                                   // it can't double the audible output
    analyser.connect(ctx.destination);

    this.audioCtx = ctx;
    this.master = master;
    this.analyser = analyser;
    this.analysisNode = analysisNode;
    this.freqData = new Uint8Array(analyser.frequencyBinCount);

    console.log('[Audio] Graph built. audioCtx.state =', ctx.state, '| sampleRate =', ctx.sampleRate);
  }

  // Returns { node, sampleRate } for the analysis tap once the audio
  // graph exists, or null before the first play. Kept separate from the
  // visual analyser so AudioAnalyzer never has to know about drawing.
  getAnalysisInfo() {
    if (!this.audioCtx || !this.analysisNode) return null;
    return { node: this.analysisNode, sampleRate: this.audioCtx.sampleRate };
  }

  isPlaying() {
    return this.playing;
  }

  _scheduleArp() {
    clearTimeout(this.arpTimer);
    const fire = () => {
      if (!this.playing) return;
      this._pluck(ARP_NOTES[Math.floor(Math.random() * ARP_NOTES.length)]);
      // Occasional heavier hit so onset/impact detection has something
      // percussive to latch onto (the pad alone is too smooth).
      if (Math.random() < 0.35) this._thump();
      this.arpTimer = setTimeout(fire, 700 + Math.random() * 700);
    };
    fire();
  }

  _pluck(freq) {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Soft low thump — enough spectral flux for beat/impact without
  // turning the ambient pad into a drum track.
  _thump() {
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.18);

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Returns the new playing state, or null if Web Audio isn't supported.
  async toggle() {
    this._ensureGraph();
    if (!this.audioCtx) return null;

    if (this.playing) {
      this.playing = false;
      clearTimeout(this.arpTimer);
      await this.audioCtx.suspend();
    } else {
      await this.audioCtx.resume();
      this.playing = true;
      this._scheduleArp();
    }
    return this.playing;
  }

  _tick() {
    const { barCount, levels } = this;

    if (this.playing && this.analyser) {
      this.analyser.getByteFrequencyData(this.freqData);
      for (let i = 0; i < barCount; i++) {
        levels[i] = this.freqData[i] || 0;
      }
    } else {
      // Smoothly decay toward silence instead of freezing mid-frame
      for (let i = 0; i < barCount; i++) {
        levels[i] = Math.max(0, levels[i] * 0.85 - 1);
      }
    }

    this._draw();
    requestAnimationFrame(this._tick);
  }

  _draw() {
    const c = this.ctx2d;
    const width = this.cssWidth;
    const height = this.cssHeight;
    const barCount = this.barCount;
    const barWidth = width / barCount;

    c.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const level = this.levels[i] / 255;
      const barHeight = Math.max(2, level * height);
      const hue = 70 + (i / barCount) * 150; // brand lime -> cool blue
      c.fillStyle = `hsl(${hue}, 85%, ${35 + level * 35}%)`;
      c.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1.5), barHeight);
    }
  }
}
