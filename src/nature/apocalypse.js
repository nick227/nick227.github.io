// Gradual music-only apocalypse ladder.
//
// Sky shift is the always-on opening cue. While music plays, escalation
// age climbs and unlocks heavier phenoms. On stop, age freezes and
// AtmosphereService targets ease back to zero (fade-out lives there).

const STAGE = {
  clouds: 0.0,
  rain: 2.5,
  meteors: 8.0,
  ufos: 16.0,
  monsters: 24.0
};

export class ApocalypseDirector {
  constructor() {
    this.age = 0;
    this._wasActive = false;
  }

  // Returns the atmosphere targets for this frame. NatureDirector pushes
  // them onto AtmosphereService; this module never touches services itself.
  update(dt, state, active) {
    if (!active) {
      this._wasActive = false;
      return {
        skyShift: 0,
        cloudBoost: 0,
        rainIntensity: 0,
        meteorStorm: 0,
        ufoPresence: 0,
        monsterPresence: 0,
        aurora: 0,
        bloom: 0.22,
        haze: 0.42,
        vignette: 0.48
      };
    }

    if (!this._wasActive) this.age = 0;
    this._wasActive = true;

    // Full apocalypse takes ~40s of continuous play.
    const pace = 0.7 + state.intensity * 0.5 + state.tension * 0.25;
    this.age += dt * pace;

    const t = this.age;
    const force = 0.55 + state.intensity * 0.45;

    // Sky leads — still first, but ramps over a few seconds instead of slamming.
    const skyShift = Math.min(1, t / 3.5);

    // Clouds ride with the sky; rain arrives a beat later and fills in slowly.
    const cloudBoost = Math.min(1, (0.85 + force * 0.15) * Math.min(1, t / 5));
    const rainGate = t <= STAGE.rain ? 0 : Math.min(1, (t - STAGE.rain) / 6);
    const rainIntensity = Math.min(1, (0.85 + force * 0.15) * rainGate);

    // Later phenoms unlock further apart and swell over longer windows.
    const meteorGate = t <= STAGE.meteors ? 0 : Math.min(1, (t - STAGE.meteors) / 8);
    const meteorStorm = Math.min(1, (0.55 + force * 0.45) * meteorGate);

    const ufoGate = t <= STAGE.ufos ? 0 : Math.min(1, (t - STAGE.ufos) / 8);
    const ufoPresence = Math.min(1, (0.5 + force * 0.5) * ufoGate);

    const monsterGate = t <= STAGE.monsters ? 0 : Math.min(1, (t - STAGE.monsters) / 10);
    const monsterPresence = Math.min(1, (0.45 + force * 0.55) * monsterGate);

    return {
      skyShift,
      cloudBoost,
      rainIntensity,
      meteorStorm,
      ufoPresence,
      monsterPresence,
      aurora: Math.min(1, skyShift * 0.85 + meteorStorm * 0.4),
      bloom: Math.min(0.55, 0.2 + skyShift * 0.25 + meteorStorm * 0.15),
      haze: 0.35 + rainIntensity * 0.25,
      vignette: 0.4 + monsterPresence * 0.2
    };
  }
}
