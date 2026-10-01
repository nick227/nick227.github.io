import { careerMarkup, practiceMarkup } from './content/home.js';

const VIEW_TITLES = {
  home: 'Nick Rios',
  architecture: 'Architecture',
  'ai-automation': 'Automation',
  'web-platforms': 'Frameworks',
  'pipeline-systems': 'Pipelines',
  'creative-design': 'Design',
  leadership: 'Leadership',
};
import { Stage } from './stage.js';
import { Navigation } from './navigation.js';
import { validatePageData } from './validatePageData.js';
import { Projects } from './projects.js';
import { Blog } from './blog.js';
import { Contact } from './contact.js';
import { attachShowMore } from './showMore.js';

/**
 * Application composition root for the portfolio page.
 *
 * Page owns the lifetime of navigation, the animated stage, projects, contact,
 * the blog router, and body-level visual state. Feature-specific rendering stays
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
  #contactElement;

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
    contactElement,
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
    this.#contactElement = contactElement;
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
    this.#setupHomeWidgets();
    this.setView(this.#initialView);
    this.#setupProjects();
    this.#setupContact();
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

    this.#setViewTheme(view);

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

  #setupHomeWidgets() {
    const career = this.#homeElement.querySelector('#career');
    const practice = this.#homeElement.querySelector('#practice');
    career.innerHTML = careerMarkup();
    practice.innerHTML = practiceMarkup();
  }

  #setupProjects() {
    const project = new Projects();

    // Project data is locally authored and Projects returns trusted markup.
    this.#projectsElement.innerHTML = `
      <section class="screen">
        <h2 class="screen-title">Projects</h2>
        <div class="screen-body featured-list">${project.getFeatured()}</div>
      </section>
      <section class="screen">
        <h2 class="screen-title">Archive</h2>
        <div class="screen-body">
          <ol class="archive-list">${project.getArchive()}</ol>
        </div>
      </section>
    `;
    attachShowMore(this.#projectsElement.querySelector('.archive-list'));
  }

  #setupContact() {
    const contact = new Contact(this.#contactElement);
    contact.mount();
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

  #setViewTheme(view) {
    this.#removeViewTheme();

    this.#body.classList.add(`view-${view}`);
    this.#activeView = view;

    const title = this.#homeElement.querySelector('#screen-title');
    if (title) title.textContent = VIEW_TITLES[view] ?? view;
  }

  #removeViewTheme() {
    if (!this.#activeView) return;

    this.#body.classList.remove(`view-${this.#activeView}`);
    this.#activeView = null;
  }
}
