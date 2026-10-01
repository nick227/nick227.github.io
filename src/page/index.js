import { pageData } from './pageData.js';
import { Page } from './page.js';

const navigationElement = document.body;
const homeElement = document.querySelector('#home');
const projectsElement = document.querySelector('#projects');
const contactElement = document.querySelector('#contact');
const blogElement = document.querySelector('#blog');

if (!homeElement || !projectsElement || !contactElement || !blogElement) {
  throw new Error('One or more required page elements were not found.');
}

// Change this during development/testing to load a specific page first.
const INITIAL_VIEW = 'home';

const page = new Page({
  pageData,
  navigationElement,
  homeElement,
  projectsElement,
  contactElement,
  blogElement,
  initialView: INITIAL_VIEW,
});

export { page };
