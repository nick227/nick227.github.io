import { blogList } from '../../blog/index.js';
import { BlogCatalog } from './catalog.js';
import { articleSlugFromHash } from './routes.js';
import { BlogView } from './view.js';

const READING_MODE_CLASS = 'is-blog-reading';

function indexShouldScroll(scroll, slug) {
  if (!scroll) return false;
  return window.location.hash === '#blog' || Boolean(slug);
}

/** Coordinates article data, URL state, and the blog view. */
export class Blog {
  #catalog;
  #view = null;
  #originalDocumentTitle = '';
  #mounted = false;

  constructor(articles = blogList) {
    const catalog = new BlogCatalog(articles);
    this.#catalog = catalog;
  }

  mount(container) {
    if (this.#mounted) return;
    if (!container) {
      throw new Error('Blog requires a container element.');
    }

    const view = new BlogView(container);
    const catalog = this.#catalog;
    view.mount(catalog.all());
    this.#view = view;
    this.#originalDocumentTitle = document.title;

    window.addEventListener('hashchange', this.#handleRouteChange);
    this.#mounted = true;
    this.#renderCurrentRoute({
      scroll: Boolean(articleSlugFromHash(window.location.hash)),
    });
  }

  #handleRouteChange = () => {
    this.#renderCurrentRoute({ scroll: true });
  };

  #renderCurrentRoute({ scroll }) {
    const view = this.#view;
    const catalog = this.#catalog;
    const slug = articleSlugFromHash(window.location.hash);
    const article = slug ? catalog.find(slug) : null;

    if (!article) {
      document.body.classList.remove(READING_MODE_CLASS);
      view.showIndex({ scroll: indexShouldScroll(scroll, slug) });
      document.title = this.#originalDocumentTitle;
      return;
    }

    document.body.classList.add(READING_MODE_CLASS);
    view.showArticle({
      article,
      scroll,
    });
    document.title = `${article.title} | Nick Rios`;
  }
}
