import { articleHref } from './blogRoutes.js';

const SELECTORS = {
  index: '[data-blog-index]',
  indexTitle: '[data-blog-index-title]',
  reader: '[data-blog-reader]',
  readerTitle: '[data-blog-reader-title]',
  readerMeta: '[data-blog-reader-meta]',
  readerBody: '[data-blog-reader-body]',
  nextLink: '[data-blog-reader-next]',
  nextTitle: '[data-blog-reader-next-title]',
};

const EMPTY_ARTICLE = '<p>This essay is currently being prepared.</p>';
const WORDS_PER_MINUTE = 220;

export class BlogView {
  #container;
  #elements = null;

  constructor(container) {
    this.#container = container;
  }

  mount(articles) {
    this.#container.innerHTML = renderBlog(articles);
    this.#elements = this.#collectElements();
  }

  showIndex({ scroll = false } = {}) {
    this.#requireMount();
    this.#elements.index.hidden = false;
    this.#elements.reader.hidden = true;

    if (scroll) {
      this.#scrollAndFocus(this.#elements.indexTitle);
    }
  }

  showArticle({ article, nextArticle, scroll = false }) {
    this.#requireMount();

    this.#elements.title.textContent = article.title;
    this.#elements.meta.textContent = articleMeta(article.document);
    // Article documents are trusted, local HTML imported at build time.
    this.#elements.body.innerHTML = article.document?.trim() || EMPTY_ARTICLE;

    this.#renderNextArticle(nextArticle);
    this.#elements.index.hidden = true;
    this.#elements.reader.hidden = false;

    if (scroll) {
      this.#scrollAndFocus(this.#elements.title);
      return;
    }

    this.#elements.title.focus({ preventScroll: true });
  }

  #renderNextArticle(article) {
    this.#elements.nextLink.hidden = !article;
    if (!article) return;

    this.#elements.nextLink.href = articleHref(article.slug);
    this.#elements.nextTitle.textContent = article.title;
  }

  #scrollAndFocus(element) {
    requestAnimationFrame(() => {
      // Wait through a second frame so browser scroll anchoring observes the
      // reading-mode layout before we establish the final route position.
      requestAnimationFrame(() => {
        this.#container.scrollIntoView({ block: 'start' });
        element.focus({ preventScroll: true });
      });
    });
  }

  #collectElements() {
    const elements = {
      index: this.#container.querySelector(SELECTORS.index),
      indexTitle: this.#container.querySelector(SELECTORS.indexTitle),
      reader: this.#container.querySelector(SELECTORS.reader),
      title: this.#container.querySelector(SELECTORS.readerTitle),
      meta: this.#container.querySelector(SELECTORS.readerMeta),
      body: this.#container.querySelector(SELECTORS.readerBody),
      nextLink: this.#container.querySelector(SELECTORS.nextLink),
      nextTitle: this.#container.querySelector(SELECTORS.nextTitle),
    };

    if (Object.values(elements).some(element => !element)) {
      throw new Error('Blog view template is missing a required element.');
    }

    return elements;
  }

  #requireMount() {
    if (!this.#elements) {
      throw new Error('BlogView must be mounted before it can render.');
    }
  }
}

function renderBlog(articles) {
  return `
    <section class="blog-index" data-blog-index>
      <h2 class="blog-heading" data-blog-index-title tabindex="-1">Blog</h2>
      <ol class="blog-list">
        ${articles.map(renderBlogRow).join('')}
      </ol>
    </section>

    <article class="blog-reader" data-blog-reader aria-labelledby="blog-reader-title" hidden>
      <a class="blog-reader-back" href="#blog">← All writing</a>
      <header class="blog-reader-header">
        <p class="blog-reader-eyebrow">Nick Rios / Blog</p>
        <h1 id="blog-reader-title" data-blog-reader-title tabindex="-1"></h1>
        <p class="blog-reader-meta" data-blog-reader-meta></p>
      </header>
      <div class="blog-reader-body" data-blog-reader-body></div>
      <a class="blog-reader-next" data-blog-reader-next href="#blog">
        <span>Next article <span aria-hidden="true">→</span></span>
        <strong data-blog-reader-next-title></strong>
      </a>
    </article>`;
}

function renderBlogRow(article) {
  return `
    <li>
      <a class="blog-row" href="${articleHref(article.slug)}">
        <span>${escapeHtml(article.title)}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </li>`;
}

function articleMeta(documentHtml = '') {
  const template = document.createElement('template');
  template.innerHTML = documentHtml;
  const text = template.content.textContent || '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(
    1,
    Math.ceil(wordCount / WORDS_PER_MINUTE),
  );

  return `Nick Rios · ${readingTime} min read`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
