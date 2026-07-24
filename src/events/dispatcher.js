// Event Dispatcher for periodic timed triggers (Wind Gusts, Bird Flocks, Night Fireflies)

import { randomRange, createRandom } from '../utils/math.js';

export class EventDispatcher {
  constructor(seed = 98765) {
    this.listeners = {};
    this.seed = seed;
    this.prng = createRandom(seed);
    
    // Seeded initial triggers
    this.gustTimer = randomRange(12.0, 24.0, this.prng);
    this.flockTimer = randomRange(6.0, 15.0, this.prng);
    this.fireflyTimer = randomRange(1.0, 3.0, this.prng);
  }

  // Bind a listener
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Trigger an event
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // Safely purge all active callbacks to prevent memory leaks on channel switch
  clearAllListeners() {
    this.listeners = {};
  }

  // Runs on the core loop tick
  update(dt, services, layers) {
    // 1. Wind Gust Manager
    this.gustTimer -= dt;
    if (this.gustTimer <= 0) {
      const intensity = randomRange(1.8, 3.2, this.prng);
      const duration = randomRange(4.0, 7.5, this.prng);
      
      services.motion.triggerGust(intensity, duration);
      this.gustTimer = randomRange(22.0, 45.0, this.prng);

      this.emit('event-toast', {
        type: 'gust',
        title: 'Wind Gust',
        message: `A strong wind gust (${intensity.toFixed(1)}x) sweeps through the landscape.`
      });
    }

    // 2. Bird Flock Manager
    this.flockTimer -= dt;
    if (this.flockTimer <= 0) {
      const birdCount = Math.floor(randomRange(4, 9, this.prng));
      const direction = this.prng() < 0.5 ? 1 : -1;
      const yRatio = randomRange(0.12, 0.38, this.prng);

      // Emit semantic event signal
      this.emit('spawn-birds', { count: birdCount, direction, yRatio });

      this.emit('event-toast', {
        type: 'flock',
        title: 'Bird Flock',
        message: `A flock of ${birdCount} mountain birds takes wing across the horizon.`
      });

      this.flockTimer = randomRange(45.0, 80.0, this.prng);
    }

    // 3. Firefly Manager (Only spawns during night phase)
    const nightWeight = services.time.getDayPhases().night;

    if (nightWeight > 0.6) {
      this.fireflyTimer -= dt;
      if (this.fireflyTimer <= 0) {
        const fireflyCount = Math.floor(randomRange(2, 5, this.prng));
        
        // Emit semantic event signal
        this.emit('spawn-fireflies', { count: fireflyCount });

        this.fireflyTimer = randomRange(1.5, 4.0, this.prng);
      }
    }
  }
}
export default EventDispatcher;
