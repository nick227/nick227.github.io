import { Nature } from './nature/index.js';
import { BlogListGenerator } from './generators/blog-list-generator.js';
import { ArticleReader } from './article-reader.js';
import { blogList } from './blog/index.js';

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
  setupContactForm();
  ArticleReader.mount(blogList);
  BlogListGenerator();
});
