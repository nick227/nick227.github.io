import { pageData } from './pageData.js';
import { Page } from './page.js';

const navigationElement = document.body;
const homeElement = document.querySelector('#home');
const stageElement = document.querySelector('.stage');
const projectsElement = document.querySelector('#projects');
const blogElement = document.querySelector('#blog');

if (!homeElement || !stageElement || !projectsElement || !blogElement) {
  throw new Error('One or more required page elements were not found.');
}

// Change this during development/testing to load a specific page first.
const INITIAL_VIEW = 'home';

const page = new Page({
  pageData,
  navigationElement,
  homeElement,
  stageElement,
  projectsElement,
  blogElement,
  initialView: INITIAL_VIEW,
});

page.start();

export { page };
