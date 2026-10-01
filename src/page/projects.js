import { articleHref } from './blog/blogRoutes.js';
import { projectKind } from './projectKinds.js';
import { projectsData } from './projectsData.js';

export class Projects {
  #projects;

  constructor() {
    this.#projects = projectsData;
  }

  getFeatured() {
    return this.#projects
      .filter(project => project.featured)
      .map(project => this.#featured(project))
      .join('');
  }

  getArchive() {
    return this.#projects
      .filter(project => !project.featured)
      .map(project => this.#archive(project))
      .join('');
  }

  #featured(project) {
    const kind = projectKind(project.kind);

    return `<article class="featured">
      <p class="meta">${kind.label}</p>
      <h3>${project.title}</h3>
      <p class="featured-lead">${project.subText}</p>
      <p class="featured-copy">${project.paragraph}</p>
      ${this.#actions(project)}
    </article>`;
  }

  #archive(project) {
    const kind = projectKind(project.kind);

    return `<li class="archive-row">
      <span class="archive-name">${project.title}</span>
      <span class="meta">${kind.label}</span>
      <span class="archive-desc">${project.subText}</span>
      ${this.#actions(project)}
    </li>`;
  }

  #actions(project) {
    const links = [];

    if (project.link) {
      const sameAsCode = project.github && project.link === project.github;
      links.push({
        label: sameAsCode ? 'Code' : 'Open',
        href: project.link,
        external: true,
      });
    }

    if (project.github && project.github !== project.link) {
      links.push({ label: 'Code', href: project.github, external: true });
    }

    if (project.blog) {
      links.push({
        label: 'Notes',
        href: articleHref(project.blog.replace(/\.html$/, '')),
        external: false,
      });
    }

    if (!links.length) return '';

    return `<ul class="text-links">${links.map(link => {
      const attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<li><a class="link" href="${link.href}"${attrs}>${link.label}</a></li>`;
    }).join('')}</ul>`;
  }
}
