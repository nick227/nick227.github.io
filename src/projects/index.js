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
    title: 'Set Forms Builder',
    description: 'Low-code drag-and-drop form builder with conditional logic, multi-step flows, and JSON schema export.',
    logoInitials: 'SF',
    logoColor: 'proj-color-violet',
  },
  {
    slug: 'drakomotors',
    title: 'drakomotors.com',
    description: 'Marketing and product website for a next-generation electric vehicle startup.',
    logoInitials: 'DM',
    logoColor: 'proj-color-red',
  },
  {
    slug: 'playlisted',
    title: 'playlisted.com',
    description: 'Social music platform where users curate, share, and discover playlists across streaming services.',
    logoInitials: 'PL',
    logoColor: 'proj-color-green',
  },
  {
    slug: 'crunkbox',
    title: 'crunkbox.com',
    description: 'Hip-hop and electronic music community hub with streaming, event listings, and artist profiles.',
    logoInitials: 'CB',
    logoColor: 'proj-color-orange',
  },
  {
    slug: 'southshoresoldiers',
    title: 'southshoresoldiers.com',
    description: 'Sports community site for a competitive team — rosters, schedules, stats, and multimedia coverage.',
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
    title: 'Agentpress',
    description: 'Publishing platform for AI agent workflows — author, test, and deploy autonomous agents as shareable pages.',
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
    slug: 'social-auto',
    title: 'Social Auto',
    description: 'Automated social media content engine — AI-generated posts, scheduling, multi-platform publishing, and analytics.',
    logoInitials: 'SA',
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
    description: 'LLM prompt chaining and orchestration tool — build, test, and share multi-step prompt pipelines visually.',
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
