// Showrunner: MusicState -> nature subsystems + music-only apocalypse.

import { ApocalypseDirector } from './apocalypse.js';

export class NatureDirector {
  constructor(eventDispatcher) {
    this.events = eventDispatcher;
    this.systems = {};
    this._wasActive = false;
    this.neutralWind = { baseSpeed: 1.0, turbulence: 1.0, direction: 1.0 };
    this.apocalypse = new ApocalypseDirector();
    // Exposed for debug overlay compatibility with older storm meter.
    this.stormBuildup = 0;

    this.events.addEventListener('impact', (data) => this._onImpact(data));
    this.events.addEventListener('drop', (data) => this._onDrop(data));
    this.events.addEventListener('climax', (data) => this._onClimax(data));
  }

  registerSystem(name, instance) {
    this.systems[name] = instance;
  }

  setNeutralWind({ baseSpeed = 1.0, turbulence = 1.0, direction = 1.0 } = {}) {
    this.neutralWind = { baseSpeed, turbulence, direction };
  }

  update(dt, state, active, features) {
    if (active && !this._wasActive) {
      this.systems.wind?.triggerGust(4.0, 5.0);
      this.systems.lighting?.triggerLightning();
    }
    this._wasActive = active;

    this._updateWind(state, active);
    this._updateLighting(state, active);
    this._updateApocalypse(dt, state, active);
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

    wind.setBaseSpeedTarget(Math.min(5.5, 2.2 + state.intensity * 2.8 + state.density * 1.0));
    wind.setTurbulenceTarget(Math.min(4.0, 1.6 + state.tension * 1.8 + state.density * 0.7));
    wind.setDirectionTarget(1.0 + state.momentum * 0.35);
  }

  _updateLighting(state, active) {
    const lighting = this.systems.lighting;
    if (!lighting) return;
    if (!active) {
      lighting.setMoodBoostTarget(0);
      return;
    }
    lighting.setMoodBoostTarget(Math.min(1.0, 0.7 + state.intensity * 0.3 + state.tension * 0.2));
  }

  _updateApocalypse(dt, state, active) {
    const atmosphere = this.systems.atmosphere;
    if (!atmosphere) return;

    const fx = this.apocalypse.update(dt, state, active);
    this.stormBuildup = this.apocalypse.age / 20;

    atmosphere.setSkyShiftTarget(fx.skyShift);
    atmosphere.setCloudBoostTarget(fx.cloudBoost);
    atmosphere.setRainIntensityTarget(fx.rainIntensity);
    atmosphere.setMeteorStormTarget(fx.meteorStorm);
    atmosphere.setUfoPresenceTarget(fx.ufoPresence);
    atmosphere.setMonsterPresenceTarget(fx.monsterPresence);
    atmosphere.setAuroraIntensityTarget(fx.aurora);
    atmosphere.setStarSparkleTarget(fx.skyShift * 0.6);
    atmosphere.setBloomTarget(fx.bloom);
    atmosphere.setHazeTarget(fx.haze);
    atmosphere.setVignetteTarget(fx.vignette);
  }

  _updateCamera(state, active) {
    const camera = this.systems.camera;
    if (!camera) return;
    camera.setBreatheTarget(active ? state.momentum * 1.2 : 0);
  }

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
    this.events.emit('wildlife-startle', { strong: false });
    this.events.emit('spawn-meteors', { count: 3, colorful: true });
  }

  _onDrop({ intensity, tension }) {
    this.systems.wind?.triggerGust(2.5 + intensity * 3.0 + tension, 5.5);
    this.events.emit('wildlife-startle', { strong: true });
    this.events.emit('spawn-meteors', { count: 8, colorful: true });
    this.systems.lighting?.triggerLightning();
  }

  _onClimax({ intensity }) {
    this.systems.wind?.triggerGust(3.0 + intensity * 2.5, 6.5);
    this.events.emit('wildlife-startle', { strong: true });
    this.events.emit('spawn-meteors', { count: 14, colorful: true });
    this.systems.lighting?.triggerLightning();
  }
}
