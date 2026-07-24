// Time utility for simulation clock and astronomical positioning

export class Clock {
  constructor(useSystemTime = true, initialTime = 12.0, timeScale = 60.0) {
    this.useSystemTime = useSystemTime;
    // Time represents decimal hours (0.0 to 24.0)
    this.time = initialTime;
    // Speed multiplier (e.g. 60.0 = 1 minute per second, so 24 hours pass in 24 minutes)
    this.timeScale = timeScale; 
    
    if (this.useSystemTime) {
      this.syncToSystemTime();
    }
  }

  syncToSystemTime() {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const secs = now.getSeconds();
    this.time = hrs + mins / 60 + secs / 3600;
  }

  update(dtSeconds) {
    if (this.useSystemTime) {
      this.syncToSystemTime();
    } else {
      // dtSeconds is real delta time. Convert to simulation hours.
      // (dtSeconds * timeScale) is simulation seconds.
      // 1 hour = 3600 seconds.
      this.time = (this.time + (dtSeconds * this.timeScale) / 3600) % 24.0;
    }
  }

  setTime(hours) {
    this.useSystemTime = false;
    this.time = ((hours % 24.0) + 24.0) % 24.0;
  }

  setSystemTimeMode(enabled) {
    this.useSystemTime = enabled;
    if (enabled) {
      this.syncToSystemTime();
    }
  }

  getTimeString() {
    const hrs = Math.floor(this.time);
    const mins = Math.floor((this.time - hrs) * 60);
    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  // Returns normalized float 0.0 to 1.0 representing day progress
  getNormalizedTime() {
    return this.time / 24.0;
  }

  // Returns sun altitude: -1.0 (midnight) to 1.0 (noon). 0.0 at sunrise/sunset.
  // Sunrise assumed at 6.0 (6 AM) and sunset at 18.0 (6 PM)
  getSunAltitude() {
    // Offset by 6 hours so it peaks at 12 (sin is 1.0) and bottoms at 24 (sin is -1.0)
    const angle = ((this.time - 6.0) / 24.0) * Math.PI * 2;
    return Math.sin(angle);
  }

  // Returns moon altitude: -1.0 (noon) to 1.0 (midnight).
  getMoonAltitude() {
    return -this.getSunAltitude();
  }

  // Calculates interpolation weights between four major periods:
  // Night, Dawn, Day, Dusk. Weights sum up to 1.0.
  getDayPhases() {
    const t = this.time;
    const DAWN_START = 4.5;
    const DAWN_END = 7.0;
    const DUSK_START = 17.0;
    const DUSK_END = 19.5;

    let night = 0, dawn = 0, day = 0, dusk = 0;

    if (t >= DAWN_START && t < DAWN_END) {
      // Transition from Night to Dawn
      const factor = (t - DAWN_START) / (DAWN_END - DAWN_START);
      dawn = factor;
      night = 1 - factor;
    } else if (t >= DAWN_END && t < DUSK_START) {
      // Pure Day
      day = 1.0;
    } else if (t >= DUSK_START && t < DUSK_END) {
      // Transition from Day to Dusk
      const factor = (t - DUSK_START) / (DUSK_END - DUSK_START);
      dusk = factor;
      day = 1 - factor;
    } else {
      // Night Time (19.5 to 24.0, and 0.0 to 4.5)
      night = 1.0;
    }

    return { night, dawn, day, dusk };
  }
}
