// Dev-only readout for verifying the audio -> nature pipeline against
// real audio: MusicInterpreter/AudioDirector signals, plus whatever
// state any registered nature subsystem wants to expose via renderExtra
// (e.g. NatureDirector's wind targets). Enabled with ?debugAudio in the
// URL — not part of the shipped page chrome.

const SIGNALS = ['intensity', 'pulse', 'density', 'brightness', 'tension', 'momentum', 'stillness'];
const MAX_LOG_LINES = 7;

export class AudioDebugOverlay {
  constructor() {
    this._injectStyles();

    this.el = document.createElement('div');
    this.el.id = 'audio-debug-overlay';
    this.el.innerHTML = `
      <div class="audio-debug-bars"></div>
      <div class="audio-debug-log"></div>
    `;
    document.body.appendChild(this.el);

    this.barsEl = this.el.querySelector('.audio-debug-bars');
    this.logEl = this.el.querySelector('.audio-debug-log');
    this.logLines = [];
  }

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #audio-debug-overlay {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 50;
        background: rgba(2, 4, 10, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 6px;
        padding: 10px 12px;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.5;
        color: #f3f4f6;
        pointer-events: none;
        min-width: 210px;
      }
      #audio-debug-overlay .row { display: flex; align-items: center; gap: 8px; }
      #audio-debug-overlay .row span:first-child { width: 66px; color: #9ca3af; }
      #audio-debug-overlay .row span:last-child { width: 44px; text-align: right; }
      #audio-debug-overlay .track { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
      #audio-debug-overlay .fill { height: 100%; background: #daff00; }
      #audio-debug-overlay .audio-debug-label {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(255,255,255,0.14);
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 9px;
        margin-bottom: 2px;
      }
      #audio-debug-overlay .audio-debug-log {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(255,255,255,0.14);
        color: #daff00;
        white-space: pre;
      }
    `;
    document.head.appendChild(style);
  }

  render(state) {
    this.barsEl.innerHTML = SIGNALS.map((key) => {
      const raw = state[key] ?? 0;
      const normalized = key === 'momentum' ? (raw + 1) / 2 : raw;
      const pct = Math.round(Math.max(0, Math.min(1, normalized)) * 100);
      const label = key === 'momentum' ? `${raw >= 0 ? '+' : ''}${raw.toFixed(2)}` : raw.toFixed(2);
      return `<div class="row"><span>${key}</span><div class="track"><div class="fill" style="width:${pct}%"></div></div><span>${label}</span></div>`;
    }).join('');
  }

  // Generic extra section for any registered subsystem's live values —
  // reusable as-is for Phase 2+ (atmosphere, sky, ...) debug readouts.
  // Each distinct `label` gets its own persistent section, so calling
  // this once per subsystem per frame doesn't clobber the others.
  renderExtra(label, values) {
    if (!this.extraSections) this.extraSections = {};

    let sectionEl = this.extraSections[label];
    if (!sectionEl) {
      sectionEl = document.createElement('div');
      this.el.insertBefore(sectionEl, this.logEl);
      this.extraSections[label] = sectionEl;
    }

    const rows = Object.entries(values)
      .map(([key, value]) => {
        const text = typeof value === 'number' ? value.toFixed(2) : value;
        return `<div class="row"><span>${key}</span><span style="flex:1"></span><span>${text}</span></div>`;
      })
      .join('');

    sectionEl.innerHTML = `<div class="audio-debug-label">${label}</div>${rows}`;
  }

  logEvent(name, payload) {
    const stamp = this._clockLabel();
    const detail = Object.entries(payload || {})
      .filter(([key]) => key !== 't')
      .map(([key, value]) => `${key}=${typeof value === 'number' ? value.toFixed(2) : value}`)
      .join(' ');

    this.logLines.push(`${stamp} ${name} ${detail}`);
    if (this.logLines.length > MAX_LOG_LINES) this.logLines.shift();
    this.logEl.textContent = this.logLines.join('\n');
  }

  _clockLabel() {
    const now = performance.now() / 1000;
    return `${now.toFixed(1)}s`.padStart(7, ' ');
  }
}
