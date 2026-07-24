// Reusable sky presets and celestial coordinates by time of day

export const skyGradients = {
  // Zenith-to-horizon gradients keyed by decimal hours (0 to 24)
  hourly: [
    { hour: 0, colors: ["#02040c", "#050a18", "#0c152b"] },        // Midnight: Deep dark space
    { hour: 4, colors: ["#030512", "#0b122e", "#1b254a"] },        // Deep pre-dawn
    { hour: 5.5, colors: ["#081232", "#1d2757", "#523c68", "#8e4a5d"] }, // Dawn: Warm crimson glow
    { hour: 6.5, colors: ["#11255e", "#593d6d", "#c55252", "#fcae6c"] }, // Sunrise: Multi-tiered orange/gold
    { hour: 8.5, colors: ["#2c5da6", "#5a93e2", "#b5dbfc"] },        // Morning: Crisp clean blue
    { hour: 12.0, colors: ["#1d77d7", "#50a9eb", "#c5e6fc"] },       // Noon: Radiant daylight
    { hour: 16.0, colors: ["#2a69b7", "#6ea6df", "#cbe5fa"] },       // Late afternoon
    { hour: 17.5, colors: ["#163270", "#454488", "#9e436d", "#eb5d3c"] }, // Golden hour
    { hour: 18.5, colors: ["#0b1a45", "#3a255d", "#8c2a52", "#f05a30", "#feb652"] }, // Sunset
    { hour: 20.0, colors: ["#040a2b", "#1c1742", "#472147", "#762e43"] }, // Twilight dusk: Violet hues
    { hour: 21.5, colors: ["#020516", "#070c26", "#142045"] },       // Night onset
    { hour: 24.0, colors: ["#02040c", "#050a18", "#0c152b"] }        // Cycle wrap
  ]
};

export const celestialConfig = {
  sunSize: 32,
  sunGlow: 80,
  sunColor: "#fffbe6",
  moonSize: 24,
  moonGlow: 40,
  moonColor: "#e6eefa",
  
  // Star generation parameters for the backdrop
  starCount: 150,
  starColors: ["#ffffff", "#e0f0ff", "#fff0e0", "#fffaaa"]
};
