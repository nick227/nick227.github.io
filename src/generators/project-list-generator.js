import { projectList } from '../projects/index.js';
import { ProjectReader } from '../article-reader.js';

/**
 * Creates a single Apple-style 20/80 project card row.
 * @param {{ slug: string, title: string, description: string, logoInitials: string, logoColor: string }} project
 * @returns {HTMLLIElement}
 */
function createProjectCard(project) {
  const listItem = document.createElement('li');
  const button = document.createElement('button');

  button.className = 'project-card';
  button.type = 'button';

  // Logo badge (20% col)
  const badge = document.createElement('span');
  badge.className = `proj-logo-badge`;
  badge.setAttribute('aria-hidden', 'true');

  // Content col (80%)
  const content = document.createElement('span');
  content.className = 'project-card-content';

  const header = document.createElement('span');
  header.className = 'project-card-header';

  const title = document.createElement('span');
  title.className = 'project-card-title';
  title.textContent = project.title;

  header.appendChild(title);

  const desc = document.createElement('span');
  desc.className = 'project-card-desc';
  desc.textContent = project.description;

  content.appendChild(header);
  content.appendChild(desc);

  button.appendChild(badge);
  button.appendChild(content);

  button.addEventListener('click', () => {
    ProjectReader.navigate(project.slug, { trigger: button });
  });

  listItem.appendChild(button);
  return listItem;
}

/**
 * Renders all projects into the `.project-list` ol element.
 */
function ProjectListGenerator() {
  const container = document.querySelector('.project-list');
  if (!container) return;

  projectList.forEach((project) => {
    container.appendChild(createProjectCard(project));
  });
}

export { ProjectListGenerator };
