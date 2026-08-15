import { Stage } from './stage.js';
import { Navigation } from './navigation.js';
import { validatePageData } from './validatePageData.js';
import { Projects } from './projects.js';
import { Blog } from './blog.js';

/**
 * Application composition root for the portfolio page.
 *
 * Page owns the lifetime of navigation, the animated stage, projects, the
 * blog router, and body-level visual state. Feature-specific rendering stays
 * in those collaborators so this class remains focused on coordination.
 */
export class Page {
  // Immutable configuration and DOM boundaries supplied by the entry point.
  #pageData;
  #initialView;
  #homeElement;
  #body;
  #blogElement;
  #projectsElement;

  // Long-lived collaborators created or mounted by this page instance.
  #stage;
  #navigation;
  #blog;

  // Runtime state used to make start/stop safe to call more than once.
  #activeView = null;
  #started = false;
  #pagePositionObserver = null;

  constructor({
    pageData,
    navigationElement,
    homeElement,
    stageElement,
    projectsElement,
    blogElement,
    initialView = 'home',
    bodyElement = document.body,
  }) {
    // Validate content at the composition boundary so feature classes can
    // assume every view has a valid theme and at least one screen.
    validatePageData(pageData);

    this.#pageData = pageData;
    this.#initialView = initialView;
    this.#body = bodyElement;
    this.#homeElement = homeElement;
    this.#projectsElement = projectsElement;
    this.#blogElement = blogElement;

    this.#stage = new Stage(stageElement);
    this.#navigation = new Navigation(
      navigationElement,
      this.setView,
    );
  }

  /** Starts every page-owned feature. This method is intentionally idempotent. */
  start() {
    if (this.#started) return;

    if (!this.#pageData[this.#initialView]) {
      throw new Error(
        `Page could not start: initial view "${this.#initialView}" does not exist.`,
      );
    }

    // setView ignores calls before startup. Mark the page active before
    // selecting the initial view, while enabling navigation first so the
    // lifecycle can be mirrored predictably in stop().
    this.#navigation.start();
    this.#started = true;

    this.#observePagePosition();
    this.setView(this.#initialView);
    this.#setupProjects();
    this.#setupBlog();
  }

  /** Releases listeners, observers, animations, and body-level state. */
  stop() {
    if (!this.#started) return;

    this.#navigation.stop();
    this.#pagePositionObserver?.disconnect();
    this.#pagePositionObserver = null;
    this.#body.classList.remove('is-below-home');
    this.#blog?.unmount();
    this.#stage.clear();
    this.#removeViewTheme();

    this.#started = false;
  }

  // Arrow syntax preserves Page as `this` when Navigation invokes the method.
  setView = view => {
    if (!this.#started) return;

    const data = this.#pageData[view];

    if (!data) {
      console.warn(`Unknown page view: "${view}".`);
      return;
    }

    this.#setViewTheme(view, data);

    // Stage.play cancels any sequence already in progress. Keeping the error
    // boundary here prevents rendering failures from becoming unhandled
    // promise rejections at the navigation event boundary.
    this.#stage.play(data.screens).catch(error => {
      console.error(
        `Unable to play page view "${view}".`,
        error,
      );
    });
  };

  #setupProjects() {
    const project = new Projects();
    const html = project.getProjects();

    // Project data is locally authored and Projects returns trusted markup.
    // Keep the section heading here because Page owns the section container.
    this.#projectsElement.innerHTML = `
      <h2 class="projects-heading">Projects</h2>
      ${html}
    `;
  }

  #setupBlog() {
    // Blog mounts a hashchange listener, so its lifetime must remain paired
    // with the unmount call in stop().
    this.#blog = new Blog();
    this.#blog.mount(this.#blogElement);
  }

  #observePagePosition() {
    // This class is the CSS contract that gives the fixed header and footer an
    // opaque light shell after the home section leaves the viewport.
    this.#pagePositionObserver = new IntersectionObserver(
      ([entry]) => {
        const isBelowHome = (
          !entry.isIntersecting &&
          entry.boundingClientRect.top < 0
        );

        this.#body.classList.toggle('is-below-home', isBelowHome);
      },
      { threshold: 0 },
    );

    this.#pagePositionObserver.observe(this.#homeElement);
  }

  #setViewTheme(view, data) {
    // A view class supports view-specific selectors; custom properties carry
    // the colors shared by the body, fixed shell, and stage content.
    this.#removeViewTheme();

    this.#body.classList.add(`view-${view}`);
    this.#body.style.setProperty(
      '--view-background',
      data.backgroundColor,
    );
    this.#body.style.setProperty(
      '--view-color',
      data.color,
    );

    this.#activeView = view;
  }

  #removeViewTheme() {
    if (!this.#activeView) return;

    // Remove both halves of the theme contract so a stopped Page cannot leak
    // its last selected view into a later mount.
    this.#body.classList.remove(
      `view-${this.#activeView}`,
    );
    this.#body.style.removeProperty(
      '--view-background',
    );
    this.#body.style.removeProperty(
      '--view-color',
    );

    this.#activeView = null;
  }
}
