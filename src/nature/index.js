import { ACTIVE_CHANNEL } from '../models/channels.js';
import { Clock } from '../utils/time.js';
import { MotionService } from '../services/motion.js';
import { LightingService } from '../services/lighting.js';
import { AtmosphereService } from '../services/atmosphere.js';
import { EventDispatcher } from '../events/dispatcher.js';
import { Renderer } from '../runtime/renderer.js';
import { SpectrumPlayer } from '../audio/spectrum-player.js';
import { AudioAnalyzer } from '../audio/analyzer.js';
import { MusicInterpreter } from '../audio/interpreter.js';
import { AudioDirector } from '../audio/director.js';
import { AudioDebugOverlay } from '../audio/debug-overlay.js';
import { NatureDirector } from './nature-director.js';

// Import primitives to trigger self-registration.
import '../generators/backdrop.js';
import '../generators/heightmap.js';
import '../generators/oscillator.js';
import '../generators/emitter.js';
import '../generators/agent.js';

const AUDIO_DIRECTOR_EVENTS = [
  'beat', 'strongBeat', 'impact', 'riseStart', 'risePeak',
  'drop', 'sectionChange', 'silenceEntered', 'silenceExited', 'climax'
];

const NATURE_EVENTS = ['wildlife-startle', 'spawn-meteors'];

let started = false;

/**
 * Public lifecycle interface for the generative nature background.
 */
export const Nature = Object.freeze({
  start() {
    if (started) return true;

    const canvas = document.getElementById('nature-canvas');
    if (!canvas) return false;

    started = true;

    const clock = new Clock(true);
    const motion = new MotionService();
    const lighting = new LightingService();
    const atmosphere = new AtmosphereService();
    const events = new EventDispatcher();

    const services = {
      time: clock,
      motion,
      lighting,
      atmosphere,
      layers: {}
    };

    const renderer = new Renderer(canvas, services, events);

    motion.setBaseSpeed(ACTIVE_CHANNEL.baseWind);
    renderer.loadChannel(ACTIVE_CHANNEL);

    let lastMouseRawX = null;

    window.addEventListener('mousemove', (event) => {
      if (lastMouseRawX !== null) {
        motion.triggerMouseGust(event.clientX - lastMouseRawX);
      }
      lastMouseRawX = event.clientX;
    });

    window.addEventListener('click', (event) => {
      if (event.target === canvas) {
        events.emit('spawn-click-particles', {
          x: event.clientX,
          y: event.clientY
        });
      }
    });

    const audioToggleButton = document.getElementById('audio-toggle');
    const audioCanvas = document.getElementById('audio-visualizer');
    let spectrumPlayer = null;

    if (audioToggleButton && audioCanvas) {
      spectrumPlayer = new SpectrumPlayer(audioCanvas);

      audioToggleButton.addEventListener('click', async () => {
        const isPlaying = await spectrumPlayer.toggle();
        console.log(
          '[Audio] toggle() ->',
          isPlaying,
          '| audioCtx state:',
          spectrumPlayer.audioCtx?.state
        );

        if (isPlaying === null) {
          console.warn('[Audio] Web Audio unsupported in this browser — nothing downstream can react.');
          return;
        }

        audioToggleButton.classList.toggle('is-playing', isPlaying);
        audioToggleButton.setAttribute('aria-pressed', String(isPlaying));
        audioToggleButton.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
      });
    }

    const audioAnalyzer = new AudioAnalyzer();
    const musicInterpreter = new MusicInterpreter();
    const audioDirector = new AudioDirector(events);
    let audioAnalysisAttached = false;

    const natureDirector = new NatureDirector(events);
    natureDirector.registerSystem('wind', motion);
    natureDirector.registerSystem('lighting', lighting);
    natureDirector.registerSystem('atmosphere', atmosphere);
    natureDirector.registerSystem('camera', renderer);
    natureDirector.setNeutralWind({
      baseSpeed: ACTIVE_CHANNEL.baseWind,
      turbulence: 1.0,
      direction: 1.0
    });

    const debugAudio = new URLSearchParams(window.location.search).has('debugAudio');
    let audioDebugOverlay = null;

    if (debugAudio) {
      audioDebugOverlay = new AudioDebugOverlay();
      AUDIO_DIRECTOR_EVENTS.forEach((name) => {
        events.addEventListener(name, (data) => audioDebugOverlay.logEvent(name, data));
      });
      NATURE_EVENTS.forEach((name) => {
        events.addEventListener(name, (data) => audioDebugOverlay.logEvent(name, data));
      });

      // Test/inspection hook only — never referenced by production code.
      window.__debug = {
        clock,
        atmosphere,
        motion,
        lighting,
        events,
        natureDirector,
        services
      };
    }

    let lastTime = performance.now();
    let lastHeartbeatLog = 0;

    function tick(now) {
      const dt = Math.min(0.08, (now - lastTime) / 1000.0);
      lastTime = now;

      // Keep retrying if a frame fails so the nature loop cannot silently
      // freeze while the spectrum visualizer continues animating.
      try {
        clock.update(dt);
        motion.update(dt);
        lighting.update(dt);
        atmosphere.update(dt);

        renderer.compositor.hazeIntensity = atmosphere.haze;
        renderer.bloomIntensity = atmosphere.bloom;
        renderer.vignetteIntensity = atmosphere.vignette;

        events.update(dt, services, renderer.activeLayers);

        if (spectrumPlayer && !audioAnalysisAttached) {
          const analysisInfo = spectrumPlayer.getAnalysisInfo();
          if (analysisInfo) {
            audioAnalyzer.attach(analysisInfo.node, analysisInfo.sampleRate);
            audioAnalysisAttached = true;
            console.log('[Audio] Analysis tap attached, sampleRate =', analysisInfo.sampleRate);
          }
        }

        const isAudioActive = !!spectrumPlayer && spectrumPlayer.isPlaying();
        const audioFeatures = audioAnalyzer.update(isAudioActive);
        const musicState = musicInterpreter.update(dt, audioFeatures);

        audioDirector.update(dt, musicState, audioFeatures);
        natureDirector.update(dt, musicState, isAudioActive, audioFeatures);

        if (isAudioActive && now - lastHeartbeatLog > 1000) {
          lastHeartbeatLog = now;
          console.log('[Heartbeat]', {
            audioFeatures: {
              bass: +audioFeatures.bass.toFixed(2),
              mid: +audioFeatures.mid.toFixed(2),
              volume: +audioFeatures.volume.toFixed(2)
            },
            musicState: {
              intensity: +musicState.intensity.toFixed(2),
              tension: +musicState.tension.toFixed(2)
            },
            wind: {
              speed: +motion.baseSpeed.toFixed(2),
              turbulence: +motion.turbulenceAmount.toFixed(2),
              gust: +motion.gustIntensity.toFixed(2)
            },
            lighting: {
              moodBoost: +lighting.moodBoost.toFixed(2)
            },
            atmosphere: {
              haze: +atmosphere.haze.toFixed(2),
              bloom: +atmosphere.bloom.toFixed(2),
              rain: +atmosphere.rainIntensity.toFixed(2)
            }
          });
        }

        if (audioDebugOverlay) {
          audioDebugOverlay.render(musicState);
          audioDebugOverlay.renderExtra('wind', {
            speed: motion.baseSpeed,
            turbulence: motion.turbulenceAmount,
            direction: motion.direction,
            gust: motion.gustIntensity,
            bassBoost: motion.bassBoost,
            midBoost: motion.midBoost
          });
          audioDebugOverlay.renderExtra('lighting', {
            moodBoost: lighting.moodBoost,
            lightning: lighting.lightningFlash
          });
          audioDebugOverlay.renderExtra('atmosphere', {
            haze: atmosphere.haze,
            bloom: atmosphere.bloom,
            vignette: atmosphere.vignette,
            aurora: atmosphere.auroraIntensity,
            sparkle: atmosphere.starSparkle,
            rain: atmosphere.rainIntensity
          });
          audioDebugOverlay.renderExtra('storm/camera', {
            buildup: natureDirector.stormBuildup,
            breatheX: renderer.breatheX
          });
          audioDebugOverlay.renderExtra('apocalypse', {
            sky: atmosphere.skyShift,
            clouds: atmosphere.cloudBoost,
            rain: atmosphere.rainIntensity,
            meteors: atmosphere.meteorStorm,
            ufos: atmosphere.ufoPresence,
            monsters: atmosphere.monsterPresence,
            age: natureDirector.apocalypse.age
          });
        }

        renderer.update(dt);
        renderer.render();
      } catch (error) {
        console.error(
          '[NatureEngine] tick() threw — nature effects are frozen this frame:',
          error
        );
      }

      requestAnimationFrame(tick);
    }

    renderer.resize(window.innerWidth, window.innerHeight);
    requestAnimationFrame(tick);

    return true;
  }
});
