const documents = import.meta.glob('./*.html', {
  eager: true,
  query: '?raw',
  import: 'default'
});

/**
 * Project metadata.
 * Each entry: { slug, title, description, logoInitials, logoColor }
 *   - logoInitials: 1–2 chars rendered in the CSS monogram badge
 *   - logoColor:    one of the 15 curated project palette classes (proj-color-*)
 */
const projectMetadata = [
  {
    slug: 'single-pane-of-glass',
    title: 'Single Pane of Glass',
    description: 'Enterprise operations dashboard unifying multi-source data streams into a single real-time monitoring surface.',
    logoInitials: 'SG',
    logoColor: 'proj-color-cyan',
  },
  {
    slug: 'set-forms-builder',
    title: 'Forms Builder',
    description: 'Collaborative builder and renderer for next-gen forms — widget library, themable layouts, and an early AI setup assistant.',
    logoInitials: 'FB',
    logoColor: 'proj-color-violet',
  },
  {
    slug: 'drakomotors',
    title: 'drakomotors.com',
    description: 'Image-rich marketing site for EV hypercar manufacturer Drako Motors — full-bleed automotive photography, cinematic video, and fullpage.js scroll transitions built on Webflow.',
    logoInitials: 'DM',
    logoColor: 'proj-color-red',
  },
  {
    slug: 'playlisted',
    title: 'playlisted.com',
    description: 'Contract-first music discovery and creator platform — Studio uploads, canonical playlist URLs, and a persistent player.',
    logoInitials: 'PL',
    logoColor: 'proj-color-green',
  },
  {
    slug: 'crunkbox',
    title: 'crunkbox.com',
    description: 'Solo-built hip-hop and electronic music community on PHP/Jamroom — signed 80 quality artists and promoted them online and at Austin venues.',
    logoInitials: 'CB',
    logoColor: 'proj-color-orange',
  },
  {
    slug: 'southshoresoldiers',
    title: 'southshoresoldiers.com',
    description: 'Freelance website for a Lake Tahoe snowboard camp — camp identity, programs, and seasonal signup pages.',
    logoInitials: 'SS',
    logoColor: 'proj-color-teal',
  },
  {
    slug: 'screenplay-to-video',
    title: 'Screenplay to Video',
    description: 'AI pipeline that transforms screenplay documents into scene-by-scene video sequences using local LTX generation.',
    logoInitials: 'SV',
    logoColor: 'proj-color-pink',
  },
  {
    slug: 'poker-champ',
    title: 'Poker Champ',
    description: 'Full-featured online Texas Hold\'em poker app with real-time multiplayer, hand history, and bankroll tracking.',
    logoInitials: 'PC',
    logoColor: 'proj-color-gold',
  },
  {
    slug: 'agentpress',
    title: 'AgentPress',
    description: 'Account-based AI pipeline builder that turns research feeds — YouTube, Reddit, RSS — into generated content and publishes to WordPress.',
    logoInitials: 'AP',
    logoColor: 'proj-color-indigo',
  },
  {
    slug: 'auto-image',
    title: 'Auto Image',
    description: 'Mass image generation pipeline with style diversity controls, batch queuing, and studio-quality output curation.',
    logoInitials: 'AI',
    logoColor: 'proj-color-lime',
  },
  {
    slug: 'shop-shop',
    title: 'Shop-Shop',
    description: 'Type-safe same-day delivery marketplace connecting local shoppers with couriers — built with strict TypeScript.',
    logoInitials: 'SH',
    logoColor: 'proj-color-amber',
  },
  {
    slug: 'auto-dealer-sales-portal',
    title: 'Auto Dealer Sales Portal',
    description: 'Operator platform that onboards auto dealers onto 18 ad and marketplace platforms — feed generation, readiness validation, and proof export.',
    logoInitials: 'AD',
    logoColor: 'proj-color-rose',
  },
  {
    slug: 'impremedia',
    title: 'impremedia.com',
    description: 'Digital media company platform serving Hispanic audiences with news, entertainment, and advertising solutions.',
    logoInitials: 'IM',
    logoColor: 'proj-color-blue',
  },
  {
    slug: 'weareaustin',
    title: 'weareaustin.com',
    description: 'Local TV news site on a shared PHP CMS platform built for dozens of Nexstar Broadcasting affiliates — news, video, weather, and classifieds.',
    logoInitials: 'WA',
    logoColor: 'proj-color-emerald',
  },
  {
    slug: 'prompt-stacker',
    title: 'Prompt Stacker',
    description: 'Desktop automation tool that times clicks and clipboard pastes against any app\'s window — built to drive prompt stacks into an AI IDE.',
    logoInitials: 'PS',
    logoColor: 'proj-color-purple',
  },
];

function toProjectEntry(project) {
  return {
    ...project,
    document: documents[`./${project.slug}.html`] || '',
  };
}

const projectList = projectMetadata.map(toProjectEntry);

export {
  projectMetadata,
  projectList,
};
