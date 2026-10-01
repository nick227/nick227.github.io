export class BlogCatalog {
  #articles;
  #articleLookup;

  constructor(articles) {
    if (!Array.isArray(articles)) {
      throw new TypeError('BlogCatalog requires an array of articles.');
    }

    this.#articles = articles;
    this.#articleLookup = indexArticles(articles);
  }

  all() {
    return this.#articles;
  }

  find(slug) {
    return this.#articleLookup.get(slug) ?? null;
  }
}

function indexArticles(articles) {
  const lookup = new Map();

  for (let index = 0; index < articles.length; index++) {
    const article = articles[index];
    const slug = article && article.slug;

    if (typeof slug !== 'string' || !slug.trim()) {
      throw new TypeError(`Blog article at index ${index} requires a slug.`);
    }
    if (typeof article.title !== 'string' || !article.title.trim()) {
      throw new TypeError(`Blog article "${slug}" requires a title.`);
    }
    if (lookup.has(slug)) {
      throw new Error(`Duplicate blog article slug: "${slug}".`);
    }

    lookup.set(slug, article);
  }

  return lookup;
}
