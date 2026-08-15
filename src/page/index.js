import { pageData } from './pageData.js';
import { Page } from './page.js';

const navigationElement = document.body;
const stageElement = document.querySelector('.stage');
const projectsElement = document.querySelector('#projects');

if (!stageElement) {
  throw new Error('Required DOM element (.stage) was not found.');
}

// Change this during development/testing to load a specific page first.
const INITIAL_VIEW = 'home';

const page = new Page({
  pageData,
  navigationElement,
  stageElement,
  projectsElement,
  initialView: INITIAL_VIEW,
});

page.start();

export { page };
