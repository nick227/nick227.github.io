import { blogList } from '../../blog/index.js';
import { BlogCatalog } from './catalog.js';
import { articleSlugFromHash } from './routes.js';
import { BlogView } from './view.js';

const READING_MODE_CLASS = 'is-blog-reading';

/** Coordinates article data, URL state, and the blog view. */
export class Blog {
  #catalog;
  #view = null;
  #originalDocumentTitle = '';
  #mounted = false;

  constructor(articles = blogList) {
    this.#catalog = new BlogCatalog(articles);
  }

  mount(container) {
    if (this.#mounted) return;
    if (!container) {
      throw new Error('Blog requires a container element.');
    }

    this.#view = new BlogView(container);
    this.#view.mount(this.#catalog.all());
    this.#originalDocumentTitle = document.title;

    window.addEventListener('hashchange', this.#handleRouteChange);
    this.#mounted = true;
    this.#renderCurrentRoute({
      scroll: Boolean(articleSlugFromHash(window.location.hash)),
    });
  }

  unmount() {
    if (!this.#mounted) return;

    window.removeEventListener('hashchange', this.#handleRouteChange);
    document.body.classList.remove(READING_MODE_CLASS);
    document.title = this.#originalDocumentTitle;
    this.#view = null;
    this.#mounted = false;
  }

  #handleRouteChange = () => {
    this.#renderCurrentRoute({ scroll: true });
  };

  #renderCurrentRoute({ scroll }) {
    const slug = articleSlugFromHash(window.location.hash);
    const article = slug ? this.#catalog.find(slug) : null;

    if (!article) {
      const shouldScrollToIndex = (
        scroll && (window.location.hash === '#blog' || Boolean(slug))
      );
      document.body.classList.remove(READING_MODE_CLASS);
      this.#view.showIndex({ scroll: shouldScrollToIndex });
      document.title = this.#originalDocumentTitle;
      return;
    }

    document.body.classList.add(READING_MODE_CLASS);
    this.#view.showArticle({
      article,
      scroll,
    });
    document.title = `${article.title} | Nick Rios`;
  }
}
