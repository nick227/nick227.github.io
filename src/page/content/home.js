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

const practiceViews = [
  'architecture',
  'ai-automation',
  'web-platforms',
  'pipeline-systems',
  'creative-design',
  'leadership',
];

function jobMarkup(job) {
  return `
    <li class="career-job">
      <details open>
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

function practiceCopy(screens) {
  for (let i = screens.length - 1; i >= 0; i--) {
    if (screens[i].timer == null) return screens[i];
  }
}

function practiceSection(view, screens) {
  return `
    <section class="block" id="${view}">
      <div class="block-copy">${practiceCopy(screens).html}</div>
    </section>
  `;
}

const careerHtml = careerMarkup();

export function homeFlow(pageData) {
  const practice = practiceViews
    .map(view => practiceSection(view, pageData[view].screens))
    .join('');

  return `
    <section class="block" id="career" aria-label="Career">${careerHtml}</section>
    ${practice}
  `;
}

export const home = {
  backgroundColor: '#ffffff',
  color: '#050505',
  screens: [
    {
      html: `
        <div class="stage-content stage-start">
          ${careerHtml}
        </div>
      `,
    },
  ],
};
