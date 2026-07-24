// Color utilities for conversion, interpolation, and lighting calculations

// Parse hex string (e.g., "#FF0000", "#F00", "FF0000") to { r, g, b } object
export function hexToRgb(hex) {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Convert { r, g, b } to HSL
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert RGB to Hex
export function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HSL to Hex
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const y = k(n);
    const val = l - a * Math.max(-1, Math.min(y - 3, 9 - y, 1));
    return Math.round(255 * val);
  };
  return rgbToHex(f(0), f(8), f(4));
}

// Convert HSL to RGB
export function hslToRgb(h, s, l) {
  const hex = hslToHex(h, s, l);
  return hexToRgb(hex);
}

// Lerp between two RGB objects
export function lerpRgb(rgb1, rgb2, t) {
  return {
    r: rgb1.r + (rgb2.r - rgb1.r) * t,
    g: rgb1.g + (rgb2.g - rgb1.g) * t,
    b: rgb1.b + (rgb2.b - rgb1.b) * t
  };
}

// Lerp between two Hex strings, returning a Hex string
export function lerpHex(hex1, hex2, t) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const rgbInterp = lerpRgb(rgb1, rgb2, t);
  return rgbToHex(rgbInterp.r, rgbInterp.g, rgbInterp.b);
}

// Lerp multiple gradient stops. Colors is an array of Hex strings.
// t ranges from 0 to 1.
export function lerpGradient(colors, t) {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];
  if (t <= 0) return colors[0];
  if (t >= 1) return colors[colors.length - 1];

  const count = colors.length - 1;
  const rawIdx = t * count;
  const idx = Math.floor(rawIdx);
  const localT = rawIdx - idx;

  return lerpHex(colors[idx], colors[idx + 1], localT);
}

// Apply color spill (tint base color with light color)
// baseHex: object color
// spillHex: light source color
// amount: mix percentage (0 to 1)
export function applyColorSpill(baseHex, spillHex, amount) {
  return lerpHex(baseHex, spillHex, amount);
}

// Calculate edge highlight/rim lighting
// baseHex: object color
// rimHex: highlight light color
// factor: lighting strength (0 to 1)
export function calculateEdgeLight(baseHex, rimHex, factor) {
  return lerpHex(baseHex, rimHex, factor * 0.7); // capped to preserve base color structure
}
