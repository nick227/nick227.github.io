import { blogList } from '../blog/index.js';
import { ArticleReader } from '../article-reader.js';

const SHARE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
  <polyline points="16 6 12 2 8 6"/>
  <line x1="12" y1="2" x2="12" y2="15"/>
</svg>`;

function BlogListGenerator() {
  const blogListContainer = document.querySelector('.blog-list');
  if (!blogListContainer) return;

  blogList.forEach((blog) => {
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    const shareBtn = document.createElement('button');

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

    shareBtn.className = 'article-share-btn';
    shareBtn.type = 'button';
    shareBtn.setAttribute('aria-label', `Share "${blog.title}"`);
    shareBtn.innerHTML = SHARE_ICON_SVG;
    shareBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      ArticleReader.share(blog.slug);
    });

    const arrow = button.querySelector('.article-link-arrow');
    button.insertBefore(shareBtn, arrow);

    listItem.appendChild(button);
    blogListContainer.appendChild(listItem);
  });
}

export { BlogListGenerator };
