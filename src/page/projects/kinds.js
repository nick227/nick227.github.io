const stroke = 'stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';

function plate(markup) {
  return `<svg class="plate-svg" viewBox="0 0 320 180" fill="none" aria-hidden="true">${markup}</svg>`;
}

const mark = '<circle class="plate-ring" r="8" stroke-width="1.5"/><circle class="plate-mark" r="3"/>';

const PROJECT_KINDS = {
  agents: {
    id: 'agents',
    label: 'Agents',
    plate: plate(`
      <path ${stroke} d="M52 128 L116 52 L188 104 L262 44"/>
      <path ${stroke} d="M116 52 L150 140 L262 44"/>
      <path ${stroke} d="M52 128 L150 140"/>
      <circle cx="52" cy="128" r="4" fill="currentColor"/>
      <circle cx="116" cy="52" r="4" fill="currentColor"/>
      <circle cx="188" cy="104" r="4" fill="currentColor"/>
      <circle cx="150" cy="140" r="4" fill="currentColor"/>
      <g transform="translate(262 44)">${mark}</g>
    `),
  },
  platforms: {
    id: 'platforms',
    label: 'Platforms',
    plate: plate(`
      <rect x="42" y="30" width="236" height="120" ${stroke}/>
      <path ${stroke} d="M42 60 H278 M132 60 V150 M206 60 V150"/>
      <path ${stroke} d="M56 45 H84 M92 45 H112"/>
      <rect class="plate-mark" x="156" y="92" width="22" height="22"/>
    `),
  },
  media: {
    id: 'media',
    label: 'Media',
    plate: plate(`
      <rect x="34" y="34" width="74" height="112" ${stroke}/>
      <rect x="123" y="34" width="74" height="112" ${stroke}/>
      <rect x="212" y="34" width="74" height="112" ${stroke}/>
      <path class="plate-mark" d="M152 78 L174 92 L152 106 Z"/>
    `),
  },
  products: {
    id: 'products',
    label: 'Products',
    plate: plate(`
      <rect x="70" y="58" width="156" height="96" rx="8" ${stroke} opacity="0.4"/>
      <rect x="86" y="42" width="156" height="96" rx="8" ${stroke} opacity="0.7"/>
      <rect x="102" y="26" width="156" height="96" rx="8" ${stroke}/>
      <circle class="plate-mark" cx="122" cy="46" r="4"/>
      <path ${stroke} d="M136 46 H196 M120 68 H236 M120 86 H206"/>
    `),
  },
  tools: {
    id: 'tools',
    label: 'Tools',
    plate: plate(`
      <path ${stroke} d="M96 36 C72 36 72 70 72 90 C72 110 72 144 96 144"/>
      <path ${stroke} d="M224 36 C248 36 248 70 248 90 C248 110 248 144 224 144"/>
      <path ${stroke} d="M112 72 H196 M112 96 H168 M112 120 H150"/>
      <rect class="plate-mark" x="174" y="86" width="12" height="18"/>
    `),
  },
  commerce: {
    id: 'commerce',
    label: 'Commerce',
    plate: plate(`
      <rect x="98" y="22" width="124" height="136" ${stroke}/>
      <path ${stroke} d="M114 50 H206 M114 70 H206 M114 90 H206 M114 110 H164"/>
      <g transform="translate(188 126)">${mark}</g>
    `),
  },
};

export function projectKind(id) {
  const kind = PROJECT_KINDS[id];
  if (!kind) {
    throw new Error(`Unknown project kind: "${id}".`);
  }
  return kind;
}
