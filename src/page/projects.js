import { articleHref } from './blog/blogRoutes.js';
import { projectKind } from './projectKinds.js';
import { projectsData } from './projectsData.js';

export class Projects {
  #projects;

  constructor() {
    this.#projects = projectsData;
  }

  getProjects() {
    return this.#projects.map(project => this.#card(project)).join('');
  }

  #card(project) {
    const kind = projectKind(project.kind);

    return `<article class="project-card" data-kind="${kind.id}">
      <div class="project-face">
        <div class="project-plate">${kind.plate}</div>
        <p class="project-kind">${kind.label}</p>
      </div>
      <div class="project-body">
        <h3>${project.title}</h3>
        <p class="project-sub">${project.subText}</p>
        <p class="project-copy">${project.paragraph}</p>
        <ul class="project-keywords">${project.keywords.map(keyword => `<li>${keyword}</li>`).join('')}</ul>
        ${this.#actions(project)}
      </div>
    </article>`;
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

    return `<ul class="project-actions">${links.map(link => {
      const attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<li><a href="${link.href}"${attrs}>${link.label}</a></li>`;
    }).join('')}</ul>`;
  }
}
