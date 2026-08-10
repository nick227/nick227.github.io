// Central color palette for every element painted by the nature canvas.
// Edit this file to retheme the scene; geometry and animation live elsewhere.

// Central color palette for every element painted by the nature canvas.
// Bright alien-cartoon theme designed to sit beside white UI with black text.
// Skies stay light; terrain, flora, creatures, and phenomena provide the color punch.

export const canvasPaletteNEw = {
  sky: {
    hourly: [
      { name: 'midnight', hour: 0, colors: ['#fff', '#fff', '#fff'] },
      { name: 'pre-dawn', hour: 4, colors: ['#fff', '#fff', '#fff'] },
      { name: 'dawn', hour: 5.5, colors: ['#fff', '#fff', '#fff', '#fff'] },
      { name: 'sunrise', hour: 6.5, colors: ['#fff', '#e8d2ff', '#fff', '#fff'] },
      { name: 'morning', hour: 8.5, colors: ['#fff', '#cfeaff', '#fff'] },
      { name: 'noon', hour: 12, colors: ['#fff', '#fff', '#ffffff'] },
      { name: 'afternoon', hour: 16, colors: ['#fff', '#d8f3ef', '#fff9e8'] },
      { name: 'golden-hour', hour: 17.5, colors: ['#fff', '#f2d3ff', '#fff', '#ffbc78'] },
      { name: 'sunset', hour: 18.5, colors: ['#fff', '#edcfff', '#ffb8cf', '#fff', '#fff'] },
      { name: 'twilight', hour: 20, colors: ['#fff', '#d9d3ff', '#e7c9fffef', '#f6cee0'] },
      { name: 'night', hour: 21.5, colors: ['#fff', '#dde5ff', '#fff'] },
      { name: 'cycle-wrap', hour: 24, colors: ['#fff', '#fff', '#d7e8ff'] }
    ],

    apocalypse: ['#d9c4ff', '#ffb6da', '#ff9977', '#ffd35c'],
    fallback: '#f3f0ff'
  },

  celestial: {
    sun: '#ffd84d',
    moon: '#b8c9ff',

    stars: [
      '#ffffff',
      '#9fe7ff',
      '#ffd36e',
      '#ff9ed1',
      '#c2ff89'
    ],

    sunGlowTransparent: 'rgba(255, 216, 77, 0)',
    moonGlowTransparent: 'rgba(184, 201, 255, 0)',
    moonCutout: 'rgba(235, 237, 255, 1)',
    meteorTailTransparent: 'rgba(255, 255, 255, 0)',

    white: '#ffffff'
  },

  lighting: {
    night: {
      ambient: '#dedcff',
      skySpill: '#c6d7ff',
      rimLight: '#a9bfff'
    },

    dawn: {
      ambient: '#f2d8ef',
      skySpill: '#ffb88d',
      rimLight: '#ffd585'
    },

    day: {
      ambient: '#fffdf5',
      skySpill: '#b8e9ff',
      rimLight: '#ffffff'
    },

    dusk: {
      ambient: '#ecd7f3',
      skySpill: '#ff9f8c',
      rimLight: '#ffc76c'
    },

    moodGlow: '#ffe670'
  },

  terrain: {
    distantMountains: {
      base: '#a99bd8',
      shadow: '#8b7abd'
    },

    midMountains: {
      base: '#83b6c9',
      shadow: '#6495aa'
    },

    rollingHills: {
      base: '#77c7a0',
      shadow: '#52a47d'
    },

    foregroundPlains: {
      base: '#b6db65',
      shadow: '#8fbd47'
    },

    depthHazeTransparent: 'rgba(255, 255, 255, 0)'
  },

  vegetation: {
    grass: [
      '#9fd45a',
      '#70c98a',
      '#b7e267',
      '#55bfa8'
    ],

    flowers: [
      '#ff6b9d',
      '#ffb84f',
      '#63d9d2',
      '#a678ff',
      '#f6ff72',
      '#ff8d6b'
    ],

    pineTrees: [
      '#3fa687',
      '#5ab69c',
      '#357e7d'
    ],

    treeTrunk: '#9c6b7e',
    flowerCenter: '#ffe96b',

    fallbackTree: '#4aa28b',
    fallbackGrass: '#89cb62'
  },

  population: {
    cloud: '#ffffff',

    deer: '#b56f7c',
    fallbackAnimal: '#8a7aa1',

    bird: '#6b6fa8',

    rain: '#65c9ff',
    apocalypseRain: '#7ff4ea',

    firefly: '#d9ff4f'
  },

  phenomena: {
    aurora: [
      'rgba(76, 242, 174, 0.8)',
      'rgba(76, 193, 255, 0.78)',
      'rgba(195, 102, 255, 0.75)'
    ],

    transparent: 'rgba(0,0,0,0)',

    meteors: [
      '#ff4f88',
      '#ff9d3f',
      '#ffe45e',
      '#66e3a4',
      '#4fc3ff',
      '#ba7cff',
      '#ff73d0',
      '#ffffff'
    ],

    naturalMeteors: [
      '#ffffff',
      '#bcecff',
      '#ffe3a4'
    ],

    stormClouds: [
      '#b6a6d9',
      '#9faee0',
      '#d69ac0',
      '#a9c6ce',
      '#e7e1ff'
    ],

    ufos: [
      '#72e4c3',
      '#6fd8ef',
      '#b6ffdc',
      '#a5c9ff'
    ],

    ufoBeam: 'rgba(92, 255, 204, 0.38)',
    ufoBeamTransparent: 'rgba(92, 255, 204, 0)',

    ufoDome: '#d8fff4',
    dangerGlow: '#ff547f',

    monsters: [
      '#5e4b85',
      '#765268',
      '#3f7d72',
      '#845ca3'
    ]
  },

  postprocess: {
    vignetteCenter: 'rgba(255, 255, 255, 0)',
    vignetteRgb: '232, 228, 246'
  }
};

// Central color palette for every element painted by the nature canvas.
// Light-theme palette designed for black UI/text and white-adjacent surfaces.
// Keep atmospheric variation without letting the scene become dark or heavy.

export const canvasPaletteWhite = {
  sky: {
    hourly: [
      {
        name: 'midnight',
        hour: 0,
        colors: ['#f7f8fc', '#eef1f8', '#e3e8f3']
      },
      {
        name: 'pre-dawn',
        hour: 4,
        colors: ['#f6f5fb', '#eceaf5', '#e1e2f0']
      },
      {
        name: 'dawn',
        hour: 5.5,
        colors: ['#f1f2fa', '#e8e6f4', '#f0dfe9', '#f8ddd5']
      },
      {
        name: 'sunrise',
        hour: 6.5,
        colors: ['#edf2fb', '#eee5f5', '#f7dede', '#ffe7cf']
      },
      {
        name: 'morning',
        hour: 8.5,
        colors: ['#e7f2fc', '#eef7fd', '#fbfdff']
      },
      {
        name: 'noon',
        hour: 12,
        colors: ['#e6f4fd', '#f0f9fe', '#ffffff']
      },
      {
        name: 'afternoon',
        hour: 16,
        colors: ['#e8f2fb', '#f0f7fc', '#fcfdff']
      },
      {
        name: 'golden-hour',
        hour: 17.5,
        colors: ['#edf0f9', '#f0e8f5', '#f7e1e5', '#ffe6cf']
      },
      {
        name: 'sunset',
        hour: 18.5,
        colors: ['#eef0f8', '#eee7f4', '#f7dfe8', '#ffe1d6', '#fff0cf']
      },
      {
        name: 'twilight',
        hour: 20,
        colors: ['#f2f2f8', '#eeeaf5', '#f2e6ef', '#f7e8e8']
      },
      {
        name: 'night',
        hour: 21.5,
        colors: ['#f6f7fb', '#eef0f7', '#e5e9f2']
      },
      {
        name: 'cycle-wrap',
        hour: 24,
        colors: ['#f7f8fc', '#eef1f8', '#e3e8f3']
      }
    ],

    apocalypse: ['#f2e8f8', '#f5dce7', '#ffd9d1', '#ffe5c2'],
    fallback: '#f5f7fb'
  },

  celestial: {
    sun: '#fff3b8',
    moon: '#dfe8f5',

    stars: [
      '#ffffff',
      '#d9e9f7',
      '#f8dfc8',
      '#f4e7a8'
    ],

    sunGlowTransparent: 'rgba(255, 230, 150, 0)',
    moonGlowTransparent: 'rgba(205, 220, 240, 0)',

    // Keep this light so crescent moons do not punch a black hole
    // into an otherwise bright composition.
    moonCutout: 'rgba(239, 242, 248, 1)',

    meteorTailTransparent: 'rgba(255, 255, 255, 0)',
    white: '#ffffff'
  },

  lighting: {
    night: {
      ambient: '#e8ebf3',
      skySpill: '#d9e1ef',
      rimLight: '#c8d6eb'
    },

    dawn: {
      ambient: '#f4e7ec',
      skySpill: '#ffd9bd',
      rimLight: '#fff0d8'
    },

    day: {
      ambient: '#ffffff',
      skySpill: '#dceefa',
      rimLight: '#ffffff'
    },

    dusk: {
      ambient: '#f1e5ed',
      skySpill: '#ffd7c5',
      rimLight: '#ffe8ca'
    },

    moodGlow: '#fff1c9'
  },

  terrain: {
    distantMountains: {
      base: '#ccd7dd',
      shadow: '#b8c5ce'
    },

    midMountains: {
      base: '#b9ccd0',
      shadow: '#a6bbc0'
    },

    rollingHills: {
      base: '#b9d5bd',
      shadow: '#9fc3a6'
    },

    foregroundPlains: {
      base: '#c7dda9',
      shadow: '#aecb8d'
    },

    depthHazeTransparent: 'rgba(255, 255, 255, 0)'
  },

  vegetation: {
    grass: [
      '#9fc77b',
      '#afd48a',
      '#bedf9a',
      '#8db86d'
    ],

    flowers: [
      '#ed8f9a',
      '#f8c9a8',
      '#9ed8c1',
      '#f5a0aa',
      '#fff8e8'
    ],

    pineTrees: [
      '#6f9d82',
      '#80aa91',
      '#608d75'
    ],

    treeTrunk: '#9b765f',
    flowerCenter: '#fff7cf',

    fallbackTree: '#7da087',
    fallbackGrass: '#a5c987'
  },

  population: {
    cloud: '#ffffff',

    deer: '#8d7966',
    fallbackAnimal: '#7d756d',

    bird: '#657485',

    rain: '#9bccea',
    apocalypseRain: '#a7dfe8',

    firefly: '#d8ee75'
  },

  phenomena: {
    aurora: [
      'rgba(137, 226, 180, 0.72)',
      'rgba(133, 198, 236, 0.68)',
      'rgba(202, 164, 232, 0.65)'
    ],

    transparent: 'rgba(0,0,0,0)',

    meteors: [
      '#ef7186',
      '#f5a55c',
      '#efd66d',
      '#7fd0a3',
      '#72bee3',
      '#bc94df',
      '#e87ca8',
      '#ffffff'
    ],

    naturalMeteors: [
      '#ffffff',
      '#d3eafb',
      '#f8e5c5'
    ],

    stormClouds: [
      '#d8cde3',
      '#cec3dc',
      '#e7d6d8',
      '#ddd9e6',
      '#f6f5f8'
    ],

    ufos: [
      '#b8eadf',
      '#a9dfdf',
      '#d9efeb',
      '#c9e7f4'
    ],

    ufoBeam: 'rgba(165, 235, 205, 0.28)',
    ufoBeamTransparent: 'rgba(165, 235, 205, 0)',

    ufoDome: '#eafff8',

    dangerGlow: '#ef7484',

    monsters: [
      '#756d67',
      '#826f66',
      '#826776',
      '#65796d'
    ]
  },

  postprocess: {
    // No dark edge treatment in the light theme.
    vignetteCenter: 'rgba(255, 255, 255, 0)',

    // Used wherever the renderer needs the vignette RGB tuple.
    // Warm/cool off-white instead of near-black.
    vignetteRgb: '238, 241, 246'
  }
};


export const canvasPalette = {
  sky: {
    hourly: [
      { name: 'midnight', hour: 0, colors: ['#02040c', '#050a18', '#0c152b'] },
      { name: 'pre-dawn', hour: 4, colors: ['#030512', '#0b122e', '#1b254a'] },
      { name: 'dawn', hour: 5.5, colors: ['#081232', '#1d2757', '#523c68', '#8e4a5d'] },
      { name: 'sunrise', hour: 6.5, colors: ['#11255e', '#593d6d', '#c55252', '#fcae6c'] },
      { name: 'morning', hour: 8.5, colors: ['#2c5da6', '#5a93e2', '#b5dbfc'] },
      { name: 'noon', hour: 12, colors: ['#1d77d7', '#50a9eb', '#c5e6fc'] },
      { name: 'afternoon', hour: 16, colors: ['#2a69b7', '#6ea6df', '#cbe5fa'] },
      { name: 'golden-hour', hour: 17.5, colors: ['#163270', '#454488', '#9e436d', '#eb5d3c'] },
      { name: 'sunset', hour: 18.5, colors: ['#0b1a45', '#3a255d', '#8c2a52', '#f05a30', '#feb652'] },
      { name: 'twilight', hour: 20, colors: ['#040a2b', '#1c1742', '#472147', '#762e43'] },
      { name: 'night', hour: 21.5, colors: ['#020516', '#070c26', '#142045'] },
      { name: 'cycle-wrap', hour: 24, colors: ['#02040c', '#050a18', '#0c152b'] }
    ],
    apocalypse: ['#12002a', '#3b0650', '#8b0a2a', '#ff5a1f'],
    fallback: '#000000'
  },

  celestial: {
    sun: '#fffbe6',
    moon: '#e6eefa',
    stars: ['#ffffff', '#e0f0ff', '#fff0e0', '#fffaaa'],
    sunGlowTransparent: 'rgba(255, 251, 230, 0)',
    moonGlowTransparent: 'rgba(230, 238, 250, 0)',
    moonCutout: 'rgba(0, 0, 0, 1)',
    meteorTailTransparent: 'rgba(255, 255, 255, 0)',
    white: '#ffffff'
  },

  lighting: {
    night: { ambient: '#090d1f', skySpill: '#11183c', rimLight: '#4e5989' },
    dawn: { ambient: '#403147', skySpill: '#ff9955', rimLight: '#ffddaa' },
    day: { ambient: '#ffffff', skySpill: '#b1dbf3', rimLight: '#ffffff' },
    dusk: { ambient: '#2d2440', skySpill: '#f04422', rimLight: '#ffaa55' },
    moodGlow: '#fff2c0'
  },

  terrain: {
    distantMountains: { base: '#36454f', shadow: '#1a242f' },
    midMountains: { base: '#283b48', shadow: '#141e26' },
    rollingHills: { base: '#182d24', shadow: '#0b1510' },
    foregroundPlains: { base: '#1e3314', shadow: '#0b1407' },
    depthHazeTransparent: 'rgba(255, 255, 255, 0)'
  },

  vegetation: {
    grass: ['#2e521c', '#3d6b27', '#528a38', '#223e14'],
    flowers: ['#e84a5f', '#ffd3b6', '#a8e6cf', '#ff8b94', '#ffffff'],
    pineTrees: ['#0f2017', '#172d21', '#08140e'],
    treeTrunk: '#1e130c',
    flowerCenter: '#ffffff',
    fallbackTree: '#112211',
    fallbackGrass: '#224422'
  },

  population: {
    cloud: '#ffffff',
    deer: '#1c2214',
    fallbackAnimal: '#222222',
    bird: '#1c2432',
    rain: '#7ec8ff',
    apocalypseRain: '#a8f0ff',
    firefly: '#aaff33'
  },

  phenomena: {
    aurora: [
      'rgba(120,255,180,0.9)',
      'rgba(90,190,255,0.85)',
      'rgba(200,130,255,0.8)'
    ],
    transparent: 'rgba(0,0,0,0)',
    meteors: ['#ff4d6d', '#ff9f1c', '#ffe66d', '#7bf1a8', '#4cc9f0', '#c77dff', '#ff006e', '#ffffff'],
    naturalMeteors: ['#ffffff', '#cdeaff', '#ffe9c2'],
    stormClouds: ['#c4a8d8', '#b898c8', '#e0b8b8', '#d0c0e0', '#ffffff'],
    ufos: ['#b8f2e6', '#a0e7e5', '#daf0ee', '#c9f0ff'],
    ufoBeam: 'rgba(180,255,220,0.35)',
    ufoBeamTransparent: 'rgba(180,255,220,0)',
    ufoDome: '#e8fff8',
    dangerGlow: '#ff4d6d',
    monsters: ['#0a0804', '#140c06', '#1a0510', '#05140a']
  },

  postprocess: {
    vignetteCenter: 'rgba(0, 0, 0, 0)',
    vignetteRgb: '4, 6, 15'
  }
};
