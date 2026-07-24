// Turns continuous MusicState into discrete, cooldown-guarded musical
// events — the vocabulary that nature (or anything else) reacts to.
// Emits through the app's existing EventDispatcher, the same bus every
// other event in the engine already uses.
//
// Nothing here should decide what an event *means* for the visuals —
// that belongs to a future NatureDirector. This module only decides
// *when something musically noteworthy happened*.

const COOLDOWNS = {
  beat: 0.12,
  strongBeat: 0.25,
  impact: 0.5,
  riseStart: 1.5,
  risePeak: 1.5,
  drop: 2.0,
  sectionChange: 4.0,
  silenceEntered: 1.0,
  silenceExited: 1.0,
  climax: 10.0
};

export class AudioDirector {
  constructor(eventDispatcher) {
    this.events = eventDispatcher;
    this.clock = 0;
    this.lastFired = {};

    this.onsetAvg = 0;
    this.onsetMax = 0.0001;

    this.wasStill = false;
    this.prevMomentum = 0;
    this.risingSince = null;

    this.sectionBaseline = null;
    this.sectionDeviationSince = null;

    this.climaxSince = null;
  }

  _canFire(name) {
    const last = this.lastFired[name] ?? -Infinity;
    return this.clock - last >= COOLDOWNS[name];
  }

  _fire(name, payload) {
    this.lastFired[name] = this.clock;
    this.events.emit(name, { ...payload, t: this.clock });
  }

  update(dt, state, features) {
    this.clock += dt;

    this._updateBeats(dt, state, features);
    this._updateRise(state);
    this._updateSilence(state);
    this._updateSectionChange(dt, state);
    this._updateClimax(state);
  }

  _updateBeats(dt, state, features) {
    // Adaptive threshold that tracks recent typical vs. peak onset energy
    this.onsetAvg += (features.onset - this.onsetAvg) * Math.min(1, dt * 2);
    this.onsetMax = Math.max(features.onset, this.onsetMax * (1 - dt * 0.5));
    const beatThreshold = Math.max(0.05, this.onsetAvg + (this.onsetMax - this.onsetAvg) * 0.45);

    if (features.onset <= beatThreshold) return;

    if (this._canFire('beat')) {
      this._fire('beat', { strength: features.onset, intensity: state.intensity });
    }

    const isStrong = features.onset > this.onsetMax * 0.85;
    if (isStrong && this._canFire('strongBeat')) {
      this._fire('strongBeat', { strength: features.onset, intensity: state.intensity });
    }

    const isImpact = features.onset > this.onsetMax * 0.95 && state.intensity > 0.35;
    if (isImpact && this._canFire('impact')) {
      this._fire('impact', { strength: features.onset, intensity: state.intensity });

      // A drop is an impact that lands right after a real buildup
      if (this.risingSince !== null && state.tension > 0.45 && this._canFire('drop')) {
        this._fire('drop', { intensity: state.intensity, tension: state.tension });
      }
    }
  }

  _updateRise(state) {
    const momentum = state.momentum;

    if (momentum > 0.15 && this.prevMomentum <= 0.15) {
      this.risingSince = this.clock;
      if (this._canFire('riseStart')) this._fire('riseStart', { momentum });
    }

    if (momentum < this.prevMomentum && this.prevMomentum > 0.3 && this.risingSince !== null) {
      if (this._canFire('risePeak')) {
        this._fire('risePeak', { momentum: this.prevMomentum, intensity: state.intensity });
      }
      this.risingSince = null;
    }

    this.prevMomentum = momentum;
  }

  _updateSilence(state) {
    if (!this.wasStill && state.stillness > 0.7) {
      this.wasStill = true;
      if (this._canFire('silenceEntered')) this._fire('silenceEntered', { stillness: state.stillness });
    } else if (this.wasStill && state.stillness < 0.3) {
      this.wasStill = false;
      if (this._canFire('silenceExited')) this._fire('silenceExited', { stillness: state.stillness });
    }
  }

  _updateSectionChange(dt, state) {
    if (!this.sectionBaseline) {
      this.sectionBaseline = { intensity: state.intensity, density: state.density, brightness: state.brightness };
      return;
    }

    const b = this.sectionBaseline;
    const delta = Math.abs(state.intensity - b.intensity) + Math.abs(state.density - b.density) + Math.abs(state.brightness - b.brightness);

    if (delta > 0.6) {
      if (this.sectionDeviationSince === null) this.sectionDeviationSince = this.clock;

      if (this.clock - this.sectionDeviationSince > 1.0 && this._canFire('sectionChange')) {
        this._fire('sectionChange', { delta });
        this.sectionBaseline = { intensity: state.intensity, density: state.density, brightness: state.brightness };
        this.sectionDeviationSince = null;
      }
    } else {
      this.sectionDeviationSince = null;
      // Slowly drift the baseline during stable passages so it tracks
      // gradual change instead of firing on it
      b.intensity += (state.intensity - b.intensity) * dt * 0.05;
      b.density += (state.density - b.density) * dt * 0.05;
      b.brightness += (state.brightness - b.brightness) * dt * 0.05;
    }
  }

  _updateClimax(state) {
    const inClimax = state.intensity > 0.7 && state.pulse > 0.5 && state.tension > 0.6;

    if (!inClimax) {
      this.climaxSince = null;
      return;
    }

    if (this.climaxSince === null) this.climaxSince = this.clock;

    if (this.clock - this.climaxSince > 2.0 && this._canFire('climax')) {
      this._fire('climax', { intensity: state.intensity, tension: state.tension });
    }
  }
}
