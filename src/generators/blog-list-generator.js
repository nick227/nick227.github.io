import {
  blogListPrimary,
  blogListMore,
  moreArticleMetadata
} from '../blog/index.js';
import { ArticleReader } from '../article-reader.js';

function createArticleRow(blog) {
  const listItem = document.createElement('li');
  const button = document.createElement('button');

  button.className = 'article-link';
  button.type = 'button';
  button.innerHTML = `
    <span class="articles-title"></span>
    <span class="article-link-arrow" aria-hidden="true">↗</span>
  `;
  button.querySelector('.articles-title').textContent = blog.title;
  button.addEventListener('click', () => {
    ArticleReader.navigate(blog.slug, { trigger: button });
  });

  listItem.appendChild(button);
  return listItem;
}

function renderList(container, blogs) {
  if (!container) return;
  blogs.forEach((blog) => {
    container.appendChild(createArticleRow(blog));
  });
}

function wireShowMoreToggle(moreContainer, toggleButton) {
  const controlBar = toggleButton?.closest('.control-bar');

  if (!moreContainer || !toggleButton || moreArticleMetadata.length === 0) {
    controlBar?.classList.add('hidden');
    return;
  }

  moreContainer.id = 'blog-list-more';
  toggleButton.setAttribute('aria-controls', 'blog-list-more');
  toggleButton.setAttribute('aria-expanded', 'false');

  toggleButton.addEventListener('click', () => {
    const isExpanded = !moreContainer.classList.contains('hidden');
    moreContainer.classList.toggle('hidden', isExpanded);
    toggleButton.setAttribute('aria-expanded', String(!isExpanded));
    toggleButton.textContent = isExpanded ? 'Show more' : 'Show less';
  });
}

function BlogListGenerator() {
  const blogListContainer = document.querySelector('.blog-list');
  const moreContainer = document.querySelector('.blog-list-more');
  const toggleButton = document.querySelector('[data-control-bar-button]');

  renderList(blogListContainer, blogListPrimary);
  renderList(moreContainer, blogListMore);
  wireShowMoreToggle(moreContainer, toggleButton);
}

export { BlogListGenerator };
