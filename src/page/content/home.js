const careerJobs = [
  {
    company: 'Digital Harbor',
    title: 'Team Lead',
    dates: '2020 – 2025',
    summary:
      'Team lead on multiple product initiatives including ui-style-library and Set-Forms. Champion of the company’s move to AI. Built agent platform behind 100+ AI endpoints.',
  },
  {
    company: 'Cisco Systems',
    title: 'Senior Engineer',
    dates: '2012 – 2020',
    summary:
      'Launched enterprise network management platform from internal to public release, earned global innovation award. Owned schema, APIs, and UI. Running multiple teams.',
  },
  {
    company: 'Nexstar Broadcasting',
    title: 'System Engineer',
    dates: '2005 – 2009',
    summary:
      'Launched more than 60 local TV station websites onto a shared, multi-tenant platform. The network served over a million views a day at peak traffic.',
  },
  {
    company: 'Impremedia · Microsoft · AT&T',
    title: 'Earlier roles',
    dates: '2001 – 2012',
    summary:
      'Consolidated major newspaper publishers onto one dms at Impremedia. Started in telecom operations at AT&T and Sprint, earning CNA and Network+.',
  },
];

const practiceTopics = [
  ['architecture', 'Architecture', 'Systems that scale'],
  ['ai-automation', 'AI Automation', 'Powerful workflows'],
  ['web-platforms', 'Web Frameworks', 'Modern performance'],
  ['pipeline-systems', 'Pipeline Systems', 'High-quality systems'],
  ['creative-design', 'Creative Design', 'Visual clarity'],
  ['leadership', 'Leadership', 'Intentional execution'],
];

function jobMarkup(job) {
  return `
    <li class="career-job">
      <details>
        <summary>
          <span class="career-job__name">${job.company}</span>
          <span class="meta">${job.title} · ${job.dates}</span>
        </summary>
        <p>${job.summary}</p>
      </details>
    </li>
  `;
}

export function careerMarkup() {
  const jobs = careerJobs.map(jobMarkup).join('');

  return `
    <h2 class="label">Career <a class="link" href="/nick-rios.pdf" download>Résumé</a></h2>
    <ol class="career-list">${jobs}</ol>
  `;
}

export function practiceMarkup() {
  const topics = practiceTopics.map(([view, name, line]) => `
    <li><button class="link" type="button" data-view="${view}" data-line="${line}">${name}</button></li>
  `).join('');

  return `<ul class="practice-list">${topics}</ul>`;
}

export function bindPlayer(root) {
  const caption = root.querySelector('.player-caption');
  const list = root.querySelector('.practice-list');
  if (!caption || !list) return;

  const currentLine = () => {
    const current = list.querySelector('[aria-current="true"]');
    return current ? current.dataset.line : '';
  };

  const show = line => {
    caption.textContent = line;
  };

  list.addEventListener('pointerover', event => {
    const button = event.target.closest('[data-view]');
    if (!button || !list.contains(button)) return;
    show(button.dataset.line);
  });

  list.addEventListener('pointerleave', () => {
    show(currentLine());
  });

  list.addEventListener('focusin', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    show(button.dataset.line);
  });

  list.addEventListener('focusout', event => {
    if (list.contains(event.relatedTarget)) return;
    show(currentLine());
  });
}

export function syncPlayer(root, view) {
  const caption = root.querySelector('.player-caption');
  let line = '';

  root.querySelectorAll('#practice [data-view]').forEach(button => {
    const selected = button.dataset.view === view;
    if (selected) {
      button.setAttribute('aria-current', 'true');
      line = button.dataset.line;
    } else {
      button.removeAttribute('aria-current');
    }
  });

  if (caption) caption.textContent = line;
}

export const home = {
  backgroundColor: '#ffffff',
  color: '#050505',
  screens: [
    {
      html: `
        <div class="stage-content stage-start">
          ${careerMarkup()}
        </div>
      `,
    },
  ],
};
