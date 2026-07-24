// Gradual music-only apocalypse ladder.
//
// Sky shift is the always-on opening cue. While music plays, escalation
// age climbs and unlocks heavier phenoms. On stop, age freezes and
// AtmosphereService targets ease back to zero (fade-out lives there).

const STAGE = {
  clouds: 0.0,
  rain: 0.0,      // heavy from the first frame of play
  meteors: 4.0,
  ufos: 8.0,
  monsters: 12.0
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

    // Slow climb — full apocalypse takes ~20s of continuous play.
    // Intensity/tension only nudge the clock, never gate the early phenoms.
    const pace = 1.0 + state.intensity * 0.8 + state.tension * 0.4;
    this.age += dt * pace;

    const t = this.age;
    const force = 0.55 + state.intensity * 0.45; // still heavy at low music

    // Sky: unmistakable from frame one of play.
    const skyShift = 1.0;

    // Clouds + extreme rain: the two heavy phenoms that always ride with the sky.
    const cloudBoost = Math.min(1, 0.85 + force * 0.15);
    const rainIntensity = Math.min(1, 0.85 + force * 0.15);

    // Colorful meteor storm — mid escalation.
    const meteorGate = t <= STAGE.meteors ? 0 : Math.min(1, (t - STAGE.meteors) / 4);
    const meteorStorm = Math.min(1, (0.55 + force * 0.45) * meteorGate);

    // UFOs then monsters — late-game apocalypse.
    const ufoGate = t <= STAGE.ufos ? 0 : Math.min(1, (t - STAGE.ufos) / 4);
    const ufoPresence = Math.min(1, (0.5 + force * 0.5) * ufoGate);

    const monsterGate = t <= STAGE.monsters ? 0 : Math.min(1, (t - STAGE.monsters) / 5);
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
