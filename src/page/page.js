import { Stage } from './stage.js';
import { Navigation } from './navigation.js';
import { validatePageData } from './validatePageData.js';
import { Projects } from './projects.js';
import { Blog } from './blog.js';

export class Page {
  #pageData;
  #initialView;
  #homeElement;
  #stage;
  #navigation;
  #body;
  #blog;
  #blogElement;
  #activeView = null;
  #started = false;
  #projectsElement;
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

  start() {
    if (this.#started) return;

    if (!this.#pageData[this.#initialView]) {
      throw new Error(
        `Page could not start: initial view "${this.#initialView}" does not exist.`,
      );
    }

    this.#navigation.start();
    this.#started = true;

    this.#observePagePosition();
    this.setView(this.#initialView);
    this.setupProjects();
    this.setupBlog();
  }

  setupBlog() {
    this.#blog = new Blog();
    this.#blog.mount(this.#blogElement);
  }

  setupProjects() {
    const project = new Projects();
    const html = project.getProjects();
    this.#projectsElement.innerHTML = html;
  }

  #observePagePosition() {
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

  setView = view => {
    if (!this.#started) return;

    const data = this.#pageData[view];

    if (!data) {
      console.warn(`Unknown page view: "${view}".`);
      return;
    }

    this.#setViewTheme(view, data);

    this.#stage.play(data.screens).catch(error => {
      console.error(
        `Unable to play page view "${view}".`,
        error,
      );
    });
  };

  #setViewTheme(view, data) {
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
