import { Stage } from './stage.js';
import { Navigation } from './navigation.js';
import { validatePageData } from './validatePageData.js';
import { Projects } from './projects.js';

export class Page {
  #pageData;
  #initialView;
  #stage;
  #navigation;
  #body;
  #activeView = null;
  #started = false;
  #projectsElement;

  constructor({
    pageData,
    navigationElement,
    stageElement,
    projectsElement,
    initialView = 'home',
    bodyElement = document.body,
  }) {
    validatePageData(pageData);

    this.#pageData = pageData;
    this.#initialView = initialView;
    this.#body = bodyElement;
    this.#projectsElement = projectsElement;

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

    this.setView(this.#initialView);
    this.setupProjects();
  }

  setupProjects() {
    const project = new Projects();
    const html = project.getProjects();
    this.#projectsElement.innerHTML = html;
  }

  stop() {
    if (!this.#started) return;

    this.#navigation.stop();
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
