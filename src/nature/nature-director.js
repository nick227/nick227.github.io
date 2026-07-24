// The "showrunner": translates musical meaning into coherent environmental
// state and pushes it onto whichever nature subsystems are registered.
//
// NatureDirector mostly never talks to AudioAnalyzer directly — it sees
// AudioDirector's discrete events and MusicInterpreter's continuous
// MusicState (intensity, pulse, density, brightness, tension, momentum,
// stillness). That boundary is what keeps this from turning into a pile
// of scattered "bass * 0.7 -> tree sway" one-liners: every *interpreted*
// mapping in the whole app lives in this one file.
//
// _updateVegetation is a deliberate, narrow exception: raw band energies
// (bass/mid) are passed in alongside MusicState specifically for the
// "landscape as spatial frequency map" feature, where a literal spectral
// mapping (not interpreted mood) is the actual intent — see its comment.
//
// Sky phenomena (aurora, star sparkle) live on AtmosphereService, same as
// haze/bloom/vignette — see _updateAtmosphere. Wildlife doesn't register
// as a system at all: the deer/agent primitives are created fresh per
// channel load, so NatureDirector reaches them the same way the rest of
// the engine already reaches transient layers — through the shared
// EventDispatcher ('wildlife-startle', 'spawn-meteors') rather than a
// direct reference. See _onImpact/_onDrop/_onClimax.
//
// "Storm Awakening" (_updateStorm + _releaseStorm) is the one scripted
// choreography so far: sustained rising tension/momentum — a real
// buildup section, not a spike — slowly brings in rain, and if a drop or
// climax lands while that buildup is substantial, it pays off with a
// lightning strike + full rain burst (on top of the gust wave those
// events already trigger). This is deliberately reactive rather than a
// fixed timer script — it only fires because the music actually built
// to it. If more named sequences get added later, this is the pattern
// to generalize into a proper sequencer; one sequence doesn't earn that
// abstraction yet.
//
// Extending later: register additional subsystems the same way —
// registerSystem(name, instance) — then add an _updateX(state, active)
// method following the shape of _updateWind/_updateLighting below. Each
// _updateX defends against its system being absent, so registration
// order never matters.

export class NatureDirector {
  constructor(eventDispatcher) {
    this.events = eventDispatcher;
    this.systems = {};
    this._wasActive = false;

    // What wind should relax back to when no music is actively playing —
    // otherwise the continuous mapping below would read "silence" as "low
    // energy" and permanently pull the ambient wind down from the scene's
    // own default. Override via setNeutralWind() with the active channel's
    // real baseWind.
    this.neutralWind = { baseSpeed: 1.0, turbulence: 1.0, direction: 1.0 };

    // Storm Awakening buildup accumulator — see class comment.
    this.stormBuildup = 0;
    this.stormReleaseTimer = 0;

    this.events.addEventListener('impact', (data) => this._onImpact(data));
    this.events.addEventListener('drop', (data) => this._onDrop(data));
    this.events.addEventListener('climax', (data) => this._onClimax(data));

    // Future hook points — still intentionally unhandled:
    //   'beat' / 'strongBeat'   -> too frequent for whole-scene reactions;
    //                              reserve for small/cheap per-beat detail later
    //   'riseStart' / 'risePeak' -> storm buildup currently reads momentum/
    //                              tension directly each frame instead;
    //                              revisit if these ever need a discrete cue
    //   'sectionChange'          -> weather/sky mood transitions
    //   'silenceEntered/Exited'  -> idle ambient state
  }

  registerSystem(name, instance) {
    this.systems[name] = instance;
    console.log(`[NatureDirector] registered system "${name}" ->`, instance?.constructor?.name);
  }

  // The wind values to relax back toward whenever music isn't playing.
  setNeutralWind({ baseSpeed = 1.0, turbulence = 1.0, direction = 1.0 } = {}) {
    this.neutralWind = { baseSpeed, turbulence, direction };
  }

  // Continuous mapping — called once per frame with MusicInterpreter's
  // state. `active` should be false whenever no track is actually
  // playing, so silence-from-no-music can't be misread as "low energy".
  // `features` (raw bass/mid/treble/etc.) is optional and only consumed
  // by _updateVegetation — see the class comment for why that one's
  // different.
  update(dt, state, active, features) {
    // The moment music (re)starts should be an unmistakable, immediate
    // event — not something the viewer has to wait several seconds of
    // rising intensity to notice. Fire a big announcing gust right on
    // the silence -> playing edge, then let continuous mapping carry on
    // from there (it already has its own floor for "music is playing").
    if (active !== this._wasActive) {
      console.log(`[NatureDirector] active: ${this._wasActive} -> ${active} | systems registered:`, Object.keys(this.systems));
    }
    if (active && !this._wasActive) {
      this.systems.wind?.triggerGust(4.0, 5.0);
      // Reuse the storm's lightning flash as a generic "announce this
      // moment" pulse — an instant, unmissable brightness/sky spike that
      // doesn't depend on the track's own (possibly quiet) dynamics.
      this.systems.lighting?.triggerLightning();
    }
    this._wasActive = active;

    this._updateWind(state, active);
    this._updateLighting(state, active);
    this._updateAtmosphere(state, active);
    this._updateStorm(dt, state, active);
    this._updateCamera(state, active);
    if (features) this._updateVegetation(features, active);
  }

  _updateWind(state, active) {
    const wind = this.systems.wind;
    if (!wind) return;

    if (!active) {
      const n = this.neutralWind;
      wind.setBaseSpeedTarget(n.baseSpeed);
      wind.setTurbulenceTarget(n.turbulence);
      wind.setDirectionTarget(n.direction);
      return;
    }

    // A floor well above neutral means "music is playing at all" always
    // reads as clearly windier than silence, even through quiet passages;
    // intensity/density scale further on top of that floor.
    const targetSpeed = 2.2 + state.intensity * 2.8 + state.density * 1.0;
    wind.setBaseSpeedTarget(Math.min(5.5, targetSpeed));

    // Sustained tension/density roughens the wind rather than just
    // strengthening it — a busy, harsh passage should feel choppier.
    const targetTurbulence = 1.6 + state.tension * 1.8 + state.density * 0.7;
    wind.setTurbulenceTarget(Math.min(4.0, targetTurbulence));

    // A rising section subtly leans the wind direction rather than
    // reversing it outright.
    wind.setDirectionTarget(1.0 + state.momentum * 0.35);
  }

  _updateLighting(state, active) {
    const lighting = this.systems.lighting;
    if (!lighting) return;

    if (!active) {
      lighting.setMoodBoostTarget(0);
      return;
    }

    // Same "floor while active" idea as wind: an immediate, obvious glow
    // the instant music starts, breathing further with force and tension.
    const target = 0.55 + state.intensity * 0.45 + state.tension * 0.3;
    lighting.setMoodBoostTarget(Math.min(1.0, target));
  }

  _updateAtmosphere(state, active) {
    const atmosphere = this.systems.atmosphere;
    if (!atmosphere) return;

    if (!active) {
      // Renderer's own original constants — see AtmosphereService defaults.
      atmosphere.setHazeTarget(0.42);
      atmosphere.setBloomTarget(0.22);
      atmosphere.setVignetteTarget(0.48);
      atmosphere.setAuroraIntensityTarget(0);
      atmosphere.setStarSparkleTarget(0);
      return;
    }

    // Quiet, still passages: mist settles in, the view narrows and dims.
    // Energetic passages: atmosphere clears, glow lifts, framing opens up.
    // ("A quiet verse: mist settles into valleys, movement becomes slow.
    //   The chorus: fog clears, the landscape opens, light gets stronger.")
    atmosphere.setHazeTarget(0.62 - state.intensity * 0.4);
    atmosphere.setBloomTarget(0.12 + state.intensity * 0.35 + state.tension * 0.15);
    atmosphere.setVignetteTarget(0.62 - state.intensity * 0.22 - state.pulse * 0.1);

    // Sky phenomena: bright, charged passages bring out the aurora and
    // make the stars sparkle harder (drawing itself gates both by night
    // phase, so this just decides how much is available to show).
    atmosphere.setAuroraIntensityTarget(state.brightness * 0.7 + state.tension * 0.5);
    atmosphere.setStarSparkleTarget(state.brightness * 0.8 + state.intensity * 0.2);
  }

  // "Storm Awakening": a real buildup — sustained rising momentum *and*
  // tension held together, not a momentary spike — slowly brings rain in
  // ahead of any actual drop, like clouds gathering and distant thunder.
  _updateStorm(dt, state, active) {
    const atmosphere = this.systems.atmosphere;
    if (!atmosphere) return;

    if (!active) {
      this.stormBuildup = 0;
      this.stormReleaseTimer = 0;
      atmosphere.setRainIntensityTarget(0);
      return;
    }

    // A released storm gets to actually rain for a while — otherwise this
    // buildup-based mapping would overwrite _releaseStorm's rain target
    // back down to ~0 on the very next frame, since buildup resets to 0
    // the instant it releases.
    if (this.stormReleaseTimer > 0) {
      this.stormReleaseTimer = Math.max(0, this.stormReleaseTimer - dt);
      if (this.stormReleaseTimer === 0) {
        atmosphere.setRainIntensityTarget(0); // the storm passes
      }
      return;
    }

    const building = state.momentum > 0.15 && state.tension > 0.35;
    const buildRate = building ? 0.12 : -0.25; // slow to build, quicker to release if conditions drop
    this.stormBuildup = Math.max(0, Math.min(1, this.stormBuildup + buildRate * dt));

    // Rain only starts once buildup is substantial — a light mist of
    // "something's coming" before the storm itself is earned.
    const rainTarget = this.stormBuildup > 0.5 ? (this.stormBuildup - 0.5) * 2 : 0;
    atmosphere.setRainIntensityTarget(rainTarget);
  }

  // The payoff: a lightning strike + full rain burst, on top of whichever
  // gust wave the triggering event already fired. Resets the buildup, so
  // the next storm has to earn itself again rather than re-firing instantly.
  _releaseStorm() {
    this.systems.lighting?.triggerLightning();
    this.systems.atmosphere?.setRainIntensityTarget(1.0);
    this.stormBuildup = 0;
    this.stormReleaseTimer = 7.0; // let it actually rain for a while before clearing
  }

  // Slow phrase-level camera lean — rising sections lean in, falling
  // sections release back, on a multi-second timescale (see Renderer's
  // own easing). Deliberately not beat-driven.
  _updateCamera(state, active) {
    const camera = this.systems.camera;
    if (!camera) return;

    if (!active) {
      camera.setBreatheTarget(0);
      return;
    }

    camera.setBreatheTarget(state.momentum * 1.2);
  }

  // Deliberate exception to "no raw bins" (see class comment): this is
  // the one feature meant to be a literal spectral map onto the
  // landscape rather than an interpreted mood — bass moves the big heavy
  // things (trees), mid moves the smaller, faster things (grass/flowers).
  // A future treble -> fine-detail-particles layer would extend this
  // same method once that particle system exists.
  _updateVegetation(features, active) {
    const wind = this.systems.wind;
    if (!wind) return;

    if (!active) {
      wind.setBassBoostTarget(1.0);
      wind.setMidBoostTarget(1.0);
      return;
    }

    wind.setBassBoostTarget(1.0 + features.bass * 2.5);
    wind.setMidBoostTarget(1.0 + features.mid * 2.0);
  }

  _onImpact({ intensity }) {
    this.systems.wind?.triggerGust(1.2 + intensity * 2.2, 3.0);
    // A mild trigger — the herd pauses and looks up rather than bolting.
    this.events.emit('wildlife-startle', { strong: false });
  }

  _onDrop({ intensity, tension }) {
    // A drop deserves a bigger, longer wave than a plain impact — this is
    // the moment a musical swell should visibly travel across the whole
    // depth of the landscape, thanks to WindField's gust propagation delay.
    this.systems.wind?.triggerGust(2.5 + intensity * 3.0 + tension, 5.5);
    this.events.emit('wildlife-startle', { strong: true });
    this.events.emit('spawn-meteors', { count: 2 });

    if (this.stormBuildup > 0.6) this._releaseStorm();
  }

  _onClimax({ intensity }) {
    this.systems.wind?.triggerGust(3.0 + intensity * 2.5, 6.5);
    this.events.emit('wildlife-startle', { strong: true });
    this.events.emit('spawn-meteors', { count: 4 });

    if (this.stormBuildup > 0.6) this._releaseStorm();
  }
}
