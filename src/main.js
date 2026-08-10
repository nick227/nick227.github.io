import { Nature } from './nature/index.js';
import { BlogListGenerator } from './generators/blog-list-generator.js';
import { ArticleReader, ProjectReader } from './article-reader.js';
import { blogList } from './blog/index.js';
import { projectList } from './projects/index.js';

function setupVideoPreloader() {
  const embed = document.querySelector('[data-video-embed]');
  const iframe = embed?.querySelector('iframe[data-src]');
  if (!embed || !iframe) return;

  let isReady = false;
  let loadFallback;
  const markReady = () => {
    if (isReady) return;
    isReady = true;
    clearTimeout(loadFallback);
    embed.classList.add('video-embed-ready');
    embed.setAttribute('aria-busy', 'false');
    embed.querySelector('.video-loader')?.setAttribute('aria-hidden', 'true');
  };

  iframe.addEventListener('load', markReady, { once: true });
  loadFallback = setTimeout(markReady, 15000);
  iframe.src = iframe.dataset.src;
}

function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('success-toast');
  let toastHideTimer = null;

  if (!contactForm || !toast) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    toast.classList.add('toast-visible');
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 3000);

    contactForm.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Nature.start();
  setupVideoPreloader();
  setupContactForm();
  ArticleReader.mount(blogList);
  BlogListGenerator();
  ProjectReader.mount(projectList);
});
