const documents = import.meta.glob('./*.html', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const primaryArticleMetadata = [
  {
    slug: 'mass-image-harvesting-with-variety-and-studio-quality',
    title: 'Mass image harvesting with variety and studio quality'
  },
  {
    slug: 'designing-a-high-performance-complex-pages-that-dont-crash-the-server',
    title: 'Designing high-performance complex pages that don\'t crash the server'
  },
  {
    slug: 'my-insane-testing-experience-creating-a-poker-app',
    title: 'My insane testing experience creating a poker app'
  },
  {
    slug: 'using-ai-to-generate-video-is-still-a-grueling-process',
    title: 'Using AI to generate video is still a grueling process'
  },
  {
    slug: 'every-website-is-only-two-pages',
    title: 'Every website is only two pages'
  },
  {
    slug: 'creating-a-claude-skill-for-rapid-development',
    title: 'Creating a claude skill for rapid development'
  },
  {
    slug: 'could-flashcards-be-the-next-youtube',
    title: 'Could flashcards be the next youtube?'
  },
  {
    slug: 'about-my-wp-advertising-server-project',
    title: 'About my wp-advertising-server project'
  },
  {
    slug: 'why-i-think-langchain-is-overrated',
    title: 'Why I think LangChain is overrated'
  },
  {
    slug: 'why-the-world-seems-to-generally-hate-ai-music-and-ai-in-general',
    title: 'Why the world seems to generally hate AI music and AI in general'
  },
  {
    slug: 'actually-n8n-is-pretty-cool-and-why-i-hate-it',
    title: 'Actually n8n is pretty cool and why I hate it'
  },
  {
    slug: 'about-my-leadership-and-management-style',
    title: 'About my leadership and management style'
  },
  {
    slug: 'dont-make-me-type',
    title: 'Don\'t make me type...'
  },
  {
    slug: 'railway-vs-vercel-vs-heroku',
    title: 'Railway vs Vercel vs Heroku'
  },
  {
    slug: 'my-strong-opinions-for-system-design-and-architecture',
    title: 'My strong opinions on system design and architecture'
  },
  {
    slug: 'experimenting-with-pinecone-database',
    title: 'Experimenting with Pinecone database'
  },
  {
    slug: 'structuring-development-teams-for-long-term-success',
    title: 'Structuring development teams for long term success'
  },
  {
    slug: 'claude-vs-cursor-vs-antigravity-vs-codex',
    title: 'Claude vs Cursor vs Antigravity vs Codex'
  },
  {
    slug: 'ai-is-really-for-us-software-engineers',
    title: 'AI is really for us software engineers'
  },
  {
    slug: 'my-definition-of-the-perfect-ux-ui',
    title: 'My definition of perfect UX/UI'
  },
  {
    slug: 'my-adventures-trying-to-start-an-online-music-platform',
    title: 'My adventures trying to start an online music platform'
  },
  {
    slug: 'a-generic-ai-prompt-to-make-all-code-a-little-bit-better',
    title: 'A generic AI prompt to make all code a little bit better'
  },
  {
    slug: 'all-about-my-optimal-tech-stack',
    title: 'All about my optimal tech stack'
  },
  {
    slug: 'what-does-the-future-of-technology-look-like',
    title: 'What does the future of technology look like?'
  },
  {
    slug: 'how-to-solve-the-two-sum-coding-challenge',
    title: 'How to solve the two-sum coding challenge'
  },
  {
    slug: 'trapping-rain-water',
    title: 'Trapping rain water'
  }
];

const moreArticleMetadata = [
];

const articleMetadata = [...primaryArticleMetadata, ...moreArticleMetadata];

function toBlogEntry(article) {
  return {
    ...article,
    document: documents[`./${article.slug}.html`] || ''
  };
}

const blogList = articleMetadata.map(toBlogEntry);
const blogListPrimary = primaryArticleMetadata.map(toBlogEntry);
const blogListMore = moreArticleMetadata.map(toBlogEntry);

export {
  articleMetadata,
  moreArticleMetadata,
  blogList,
  blogListPrimary,
  blogListMore
};
