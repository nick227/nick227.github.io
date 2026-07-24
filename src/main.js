// Nature Background Engine Bootstrap + Contact Form Handling

import { ACTIVE_CHANNEL } from './models/channels.js';
import { Clock } from './utils/time.js';
import { MotionService } from './services/motion.js';
import { LightingService } from './services/lighting.js';
import { AtmosphereService } from './services/atmosphere.js';
import { EventDispatcher } from './events/dispatcher.js';
import { Renderer } from './runtime/renderer.js';
import { SpectrumPlayer } from './audio/spectrum-player.js';
import { AudioAnalyzer } from './audio/analyzer.js';
import { MusicInterpreter } from './audio/interpreter.js';
import { AudioDirector } from './audio/director.js';
import { AudioDebugOverlay } from './audio/debug-overlay.js';
import { NatureDirector } from './nature/nature-director.js';

// Discrete events AudioDirector can emit — used to wire up debug logging
const AUDIO_DIRECTOR_EVENTS = [
  'beat', 'strongBeat', 'impact', 'riseStart', 'risePeak',
  'drop', 'sectionChange', 'silenceEntered', 'silenceExited', 'climax'
];

// Nature-domain events NatureDirector fans back out to generators
const NATURE_EVENTS = ['wildlife-startle', 'spawn-meteors'];

// Import primitives to trigger self-registration
import './generators/backdrop.js';
import './generators/heightmap.js';
import './generators/oscillator.js';
import './generators/emitter.js';
import './generators/agent.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('nature-canvas');
  if (!canvas) return;

  // 1. Instantiate Core Clock, Shared Services, and Events
  const clock = new Clock(true);
  const motion = new MotionService();
  const lighting = new LightingService();
  const atmosphere = new AtmosphereService();
  const events = new EventDispatcher();

  const services = {
    time: clock,
    motion: motion,
    lighting: lighting,
    atmosphere: atmosphere,
    layers: {} // Filled dynamically by the renderer on channel load
  };

  // 2. Instantiate Renderer
  const renderer = new Renderer(canvas, services, events);

  // Load the page's single background channel
  motion.setBaseSpeed(ACTIVE_CHANNEL.baseWind);
  renderer.loadChannel(ACTIVE_CHANNEL);

  // 3. Horizontal Mouse Wind Gestures & Tap Spawns
  let lastMouseRawX = null;

  window.addEventListener('mousemove', (e) => {
    if (lastMouseRawX !== null) {
      const dx = e.clientX - lastMouseRawX;
      motion.triggerMouseGust(dx);
    }
    lastMouseRawX = e.clientX;
  });

  // Click on background triggers dynamic particle bursts
  window.addEventListener('click', (e) => {
    if (e.target === canvas) {
      events.emit('spawn-click-particles', { x: e.clientX, y: e.clientY });
    }
  });

  // 4. Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('success-toast');
  let toastHideTimer = null;

  if (contactForm && toast) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      toast.classList.add('toast-visible');
      clearTimeout(toastHideTimer);
      toastHideTimer = setTimeout(() => {
        toast.classList.remove('toast-visible');
      }, 3000);

      contactForm.reset();
    });
  }

  // 5. Ambient Audio Player (play/pause + live spectrum visualizer)
  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioCanvas = document.getElementById('audio-visualizer');

  let spectrumPlayer = null;

  if (audioToggleBtn && audioCanvas) {
    spectrumPlayer = new SpectrumPlayer(audioCanvas);

    audioToggleBtn.addEventListener('click', async () => {
      const isPlaying = await spectrumPlayer.toggle();
      console.log('[Audio] toggle() ->', isPlaying, '| audioCtx state:', spectrumPlayer.audioCtx?.state);
      if (isPlaying === null) {
        console.warn('[Audio] Web Audio unsupported in this browser — nothing downstream can react.');
        return;
      }

      audioToggleBtn.classList.toggle('is-playing', isPlaying);
      audioToggleBtn.setAttribute('aria-pressed', String(isPlaying));
      audioToggleBtn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
    });
  }

  // 5b. Audio Analysis Layer: sense (AudioAnalyzer) -> interpret
  // (MusicInterpreter) -> direct (AudioDirector) -> respond (NatureDirector)
  const audioAnalyzer = new AudioAnalyzer();
  const musicInterpreter = new MusicInterpreter();
  const audioDirector = new AudioDirector(events);
  let audioAnalysisAttached = false;

  // Nature subsystems under music control. Future subsystems (sky,
  // wildlife, ...) register the same way.
  const natureDirector = new NatureDirector(events);
  natureDirector.registerSystem('wind', motion);
  natureDirector.registerSystem('lighting', lighting);
  natureDirector.registerSystem('atmosphere', atmosphere);
  natureDirector.registerSystem('camera', renderer);
  natureDirector.setNeutralWind({ baseSpeed: ACTIVE_CHANNEL.baseWind, turbulence: 1.0, direction: 1.0 });

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
    window.__debug = { clock, atmosphere, motion, lighting, events, natureDirector, services };
  }

  // 6. Core Animation Frame Loop
  let lastTime = performance.now();
  let lastHeartbeatLog = 0;

  function tick(now) {
    const dt = Math.min(0.08, (now - lastTime) / 1000.0);
    lastTime = now;

    // The whole nature/audio pipeline runs inside this try block. The
    // spectrum bar visualizer has its OWN independent requestAnimationFrame
    // loop inside SpectrumPlayer — if anything below throws uncaught, this
    // loop would otherwise die silently forever (frozen wind/sky/rain)
    // while the visualizer keeps animating fine, since it's unaffected.
    // That mismatch is exactly "visualizer works, nothing else does" — so
    // catch and log instead of dying, and keep retrying every frame.
    try {
      // Update clock
      clock.update(dt);

      // Update physics sways
      motion.update(dt);
      lighting.update(dt);
      atmosphere.update(dt);
      renderer.compositor.hazeIntensity = atmosphere.haze;
      renderer.bloomIntensity = atmosphere.bloom;
      renderer.vignetteIntensity = atmosphere.vignette;

      events.update(dt, services, renderer.activeLayers);

      // Audio analysis layer: sense -> interpret -> direct. Inert (and
      // decaying toward silence) whenever the player isn't actively playing.
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

      // Heartbeat: once a second, print exactly what's flowing through the
      // pipeline. If these numbers move while playing, the pipeline is
      // alive and the break is in rendering; if they stay flat, the break
      // is upstream of here.
      if (isAudioActive && now - lastHeartbeatLog > 1000) {
        lastHeartbeatLog = now;
        console.log('[Heartbeat]', {
          audioFeatures: { bass: +audioFeatures.bass.toFixed(2), mid: +audioFeatures.mid.toFixed(2), volume: +audioFeatures.volume.toFixed(2) },
          musicState: { intensity: +musicState.intensity.toFixed(2), tension: +musicState.tension.toFixed(2) },
          wind: { speed: +motion.baseSpeed.toFixed(2), turbulence: +motion.turbulenceAmount.toFixed(2), gust: +motion.gustIntensity.toFixed(2) },
          lighting: { moodBoost: +lighting.moodBoost.toFixed(2) },
          atmosphere: { haze: +atmosphere.haze.toFixed(2), bloom: +atmosphere.bloom.toFixed(2), rain: +atmosphere.rainIntensity.toFixed(2) }
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
      }

      // Tick layout layers
      renderer.update(dt);
      renderer.render();
    } catch (err) {
      console.error('[NatureEngine] tick() threw — nature effects are frozen this frame:', err);
    }

    requestAnimationFrame(tick);
  }

  // Adjust canvas layout sizes and kick-start loop
  // (render() already self-heals on size mismatch every frame, so no
  // separate window "resize" listener is needed.)
  renderer.resize(window.innerWidth, window.innerHeight);
  requestAnimationFrame(tick);
});
