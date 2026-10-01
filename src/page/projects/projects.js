import { articleHref } from '../blog/routes.js';
import { projectKind } from './kinds.js';
import { projectsData } from './data.js';

export class Projects {
  #projects;

  constructor() {
    this.#projects = projectsData;
  }

  markup() {
    const featured = [];
    const archive = [];

    for (const project of this.#projects) {
      const row = this.#row(project, project.featured ? 'featured' : 'archive-row');
      if (project.featured) featured.push(row);
      else archive.push(row);
    }

    return featured.join('') + archive.join('');
  }

  #row(project, role) {
    const kind = projectKind(project.kind);

    return `<li class="${role} feed-row">
      <span class="blog-row-title">${project.title}</span>
      <span class="blog-row-time">${kind.label}</span>
      <span class="blog-row-dek">${project.subText}</span>
      ${this.#actions(project)}
    </li>`;
  }

  #actions(project) {
    const links = projectLinks(project);
    if (!links.length) return '';

    return `<ul class="text-links">${links.map(linkMarkup).join('')}</ul>`;
  }
}

function projectLinks(project) {
  const links = [];
  pushOpen(links, project);
  pushCode(links, project);
  pushNotes(links, project);
  return links;
}

function pushOpen(links, project) {
  if (!project.link) return;

  const sameAsCode = project.github && project.link === project.github;
  links.push({
    label: sameAsCode ? 'Code' : 'Open',
    href: project.link,
    external: true,
  });
}

function pushCode(links, project) {
  if (project.github && project.github !== project.link) {
    links.push({ label: 'Code', href: project.github, external: true });
  }
}

function pushNotes(links, project) {
  if (!project.blog) return;

  links.push({
    label: 'Notes',
    href: articleHref(project.blog.replace(/\.html$/, '')),
    external: false,
  });
}

function linkMarkup(link) {
  const attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<li><a class="link" href="${link.href}"${attrs}>${link.label}</a></li>`;
}
