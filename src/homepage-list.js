import { blogList } from './blog/index.js';
import { projectList } from './projects/index.js';

const blogLookup = new Map(blogList.map((item) => [item.slug, item]));
const projectLookup = new Map(projectList.map((item) => [item.slug, item]));

/**
 * The single source of truth for the homepage Blog list order.
 *
 * Project pages keep their existing reader and #project/ routes. Their list
 * titles combine the former project title and description into one text block.
 */
const homepageItemOrder = [
  ['project', 'single-pane-of-glass'],
  ['project', 'set-forms-builder'],
  ['article', 'what-should-next-generation-forms-look-like'],
  ['project', 'screenplay-to-video'],
  ['project', 'poker-champ'],
  ['project', 'agentpress'],
  ['project', 'auto-image'],
  ['project', 'auto-dealer-sales-portal'],
  ['article', 'mass-image-harvesting-with-variety-and-studio-quality'],
  ['article', 'designing-a-high-performance-complex-pages-that-dont-crash-the-server'],
  ['project', 'drakomotors'],
  ['article', 'my-insane-testing-experience-creating-a-poker-app'],
  ['article', 'using-ai-to-generate-video-is-still-a-grueling-process'],
  ['article', 'every-website-is-only-two-pages'],
  ['article', 'creating-a-claude-skill-for-rapid-development'],
  ['article', 'could-flashcards-be-the-next-youtube'],
  ['project', 'playlisted'],
  ['project', 'prompt-stacker'],
  ['article', 'about-my-wp-advertising-server-project'],
  ['article', 'why-i-think-langchain-is-overrated'],
  ['article', 'why-the-world-seems-to-generally-hate-ai-music-and-ai-in-general'],
  ['article', 'actually-n8n-is-pretty-cool-and-why-i-hate-it'],
  ['article', 'about-my-leadership-and-management-style'],
  ['project', 'impremedia'],
  ['article', 'dont-make-me-type'],
  ['article', 'railway-vs-vercel-vs-heroku'],
  ['article', 'my-strong-opinions-for-system-design-and-architecture'],
  ['article', 'experimenting-with-pinecone-database'],
  ['article', 'structuring-development-teams-for-long-term-success'],
  ['project', 'shop-shop'],
  ['article', 'claude-vs-cursor-vs-antigravity-vs-codex'],
  ['article', 'ai-is-really-for-us-software-engineers'],
  ['article', 'my-definition-of-the-perfect-ux-ui'],
  ['article', 'my-adventures-trying-to-start-an-online-music-platform'],
  ['article', 'a-generic-ai-prompt-to-make-all-code-a-little-bit-better'],
  ['article', 'all-about-my-optimal-tech-stack'],
  ['article', 'what-does-the-future-of-technology-look-like'],
  ['article', 'how-to-solve-the-two-sum-coding-challenge'],
  ['article', 'trapping-rain-water'],
  ['project', 'crunkbox'],
  ['project', 'southshoresoldiers'],
  ['article', 'deep-dive-into-the-coin-change-problem'],
  ['article', 'benefits-and-trade-offs-of-database-technologies'],
  ['article', 'the-secrets-of-lightning-fast-pages'],
  ['article', 'the-five-common-parts-of-every-frontend-framework'],
  ['article', 'what-is-a-state-machine'],
  ['article', 'building-shop-shop-a-type-safe-delivery-marketplace'],
  ['article', 'optimizing-for-neo4j'],
  ['article', 'elasticsearch-full-text-search-without-locking-your-database'],
  ['article', 'ltx-local-video-generation'],
  ['project', 'weareaustin'],
  ['article', 'getting-out-of-bug-hell'],
  ['article', 'ngrx-angular-state-and-the-builder-that-made-it-livable'],
];

const homepageItems = homepageItemOrder.map(([type, slug]) => {
  const item = type === 'project' ? projectLookup.get(slug) : blogLookup.get(slug);

  if (!item) {
    throw new Error(`Unknown ${type} homepage item: ${slug}`);
  }

  return {
    ...item,
    type,
    listTitle: type === 'project'
      ? `${item.title} — ${item.description}`
      : item.title,
  };
});

export { homepageItemOrder, homepageItems };
