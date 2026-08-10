import { homepageItems } from '../homepage-list.js';
import { ArticleReader, ProjectReader } from '../article-reader.js';

function createArticleRow(item) {
  const listItem = document.createElement('li');
  const button = document.createElement('button');

  button.className = 'article-link';
  button.type = 'button';
  button.innerHTML = `
    <span class="articles-title"></span>
    <span class="article-link-arrow" aria-hidden="true">↗</span>
  `;
  button.querySelector('.articles-title').textContent = item.listTitle;
  button.addEventListener('click', () => {
    const reader = item.type === 'project' ? ProjectReader : ArticleReader;
    reader.navigate(item.slug, { trigger: button });
  });

  listItem.appendChild(button);
  return listItem;
}

function renderList(container, items) {
  if (!container) return;
  items.forEach((item) => {
    container.appendChild(createArticleRow(item));
  });
}

function wireShowMoreToggle(moreContainer, toggleButton) {
  const controlBar = toggleButton?.closest('.control-bar');

  if (!moreContainer || !toggleButton || moreContainer.childElementCount === 0) {
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

  renderList(blogListContainer, homepageItems);
  wireShowMoreToggle(moreContainer, toggleButton);
}

export { BlogListGenerator };
