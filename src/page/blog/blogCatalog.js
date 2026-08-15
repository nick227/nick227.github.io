export class BlogCatalog {
  #articles;
  #articleLookup;

  constructor(articles) {
    if (!Array.isArray(articles)) {
      throw new TypeError('BlogCatalog requires an array of articles.');
    }

    validateArticles(articles);
    this.#articles = [...articles];
    this.#articleLookup = new Map(
      this.#articles.map(article => [article.slug, article]),
    );
  }

  all() {
    return [...this.#articles];
  }

  find(slug) {
    return this.#articleLookup.get(slug) ?? null;
  }

  nextAfter(slug) {
    if (!this.#articles.length) return null;

    const currentIndex = this.#articles.findIndex(
      article => article.slug === slug,
    );
    if (currentIndex < 0) return null;

    return this.#articles[(currentIndex + 1) % this.#articles.length];
  }
}

function validateArticles(articles) {
  const slugs = new Set();

  articles.forEach((article, index) => {
    if (!article || typeof article.slug !== 'string' || !article.slug.trim()) {
      throw new TypeError(`Blog article at index ${index} requires a slug.`);
    }
    if (typeof article.title !== 'string' || !article.title.trim()) {
      throw new TypeError(`Blog article "${article.slug}" requires a title.`);
    }
    if (slugs.has(article.slug)) {
      throw new Error(`Duplicate blog article slug: "${article.slug}".`);
    }

    slugs.add(article.slug);
  });
}
