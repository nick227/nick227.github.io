import { articleHref } from './blogRoutes.js';
import { attachShowMore } from '../showMore.js';

const SELECTORS = {
  index: '[data-blog-index]',
  indexTitle: '[data-blog-index-title]',
  reader: '[data-blog-reader]',
  readerTitle: '[data-blog-reader-title]',
  readerMeta: '[data-blog-reader-meta]',
  readerBody: '[data-blog-reader-body]',
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
    attachShowMore(this.#container.querySelector('.blog-list'));
  }

  showIndex({ scroll = false } = {}) {
    this.#requireMount();
    this.#elements.index.hidden = false;
    this.#elements.reader.hidden = true;

    if (scroll) {
      this.#scrollAndFocus(this.#elements.indexTitle);
    }
  }

  showArticle({ article, scroll = false }) {
    this.#requireMount();

    this.#elements.title.textContent = article.title;
    this.#elements.meta.textContent = articleMeta(article.document);
    // Article documents are trusted, local HTML imported at build time.
    this.#elements.body.innerHTML = article.document?.trim() || EMPTY_ARTICLE;

    this.#elements.index.hidden = true;
    this.#elements.reader.hidden = false;

    if (scroll) {
      this.#scrollAndFocus(this.#elements.title);
      return;
    }

    this.#elements.title.focus({ preventScroll: true });
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
    <section class="blog-index screen" data-blog-index>
      <div class="screen-lead">
        <h2 class="screen-title blog-heading" data-blog-index-title tabindex="-1">Blog</h2>
        <aside class="blog-author" aria-label="Author">
          <img class="blog-author-portrait" src="/avatar.png" alt="">
          <div class="blog-author-copy">
            <p class="blog-author-name">Nick Rios</p>
            <p class="blog-author-bio">Creative and experienced full-stack engineer with passion for building scalable and efficient systems.</p>
            <p class="blog-author-place">Austin, TX</p>
          </div>
        </aside>
      </div>
      <div class="blog-feed screen-body">
        <ol class="blog-list">
          ${articles.map(renderBlogRow).join('')}
        </ol>
      </div>
    </section>

    <article class="blog-reader" data-blog-reader aria-labelledby="blog-reader-title" hidden>
      <a class="blog-reader-back" href="#blog">← All writing</a>
      <header class="blog-reader-header">
        <p class="blog-reader-eyebrow">Nick Rios / Blog</p>
        <h1 id="blog-reader-title" data-blog-reader-title tabindex="-1"></h1>
        <p class="blog-reader-meta" data-blog-reader-meta></p>
      </header>
      <div class="blog-reader-body" data-blog-reader-body></div>
    </article>`;
}

function renderBlogRow(article) {
  const preview = articlePreview(article.document);
  const dek = preview.dek
    ? `<span class="blog-row-dek">${escapeHtml(preview.dek)}</span>`
    : '';

  return `
    <li>
      <a class="blog-row feed-row" href="${articleHref(article.slug)}">
        <span class="blog-row-title">${escapeHtml(article.title)}</span>
        <span class="blog-row-time">${preview.minutes} min</span>
        ${dek}
      </a>
    </li>`;
}

function articlePreview(documentHtml = '') {
  const template = document.createElement('template');
  template.innerHTML = documentHtml;
  const text = template.content.textContent || '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const paragraph = template.content.querySelector('p');

  return {
    minutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    dek: (paragraph?.textContent || '').replace(/\s+/g, ' ').trim(),
  };
}

function articleMeta(documentHtml = '') {
  const { minutes } = articlePreview(documentHtml);
  return `Nick Rios · ${minutes} min read`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
