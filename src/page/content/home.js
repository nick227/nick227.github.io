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

const videoFrame = `
  <div class="media-frame">
    <iframe
      src="https://www.youtube.com/embed/fiF5p3SrKfs?si=OpmS970GRrYhSIZ0"
      title="Nick Rios on YouTube"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
`;

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
  const topics = practiceTopics.map(([view, name]) => `
    <li><button class="link" type="button" data-view="${view}">${name}</button></li>
  `).join('');

  return `
    <h2 class="label">Practice <a class="link" href="#blog">Writing</a> <a class="link" href="#contact">Contact</a></h2>
    <ul class="practice-list">${topics}</ul>
  `;
}

export const home = {
  backgroundColor: '#ffffff',
  color: '#050505',
  screens: [
    {
      html: `
        <div class="stage-content">
          ${videoFrame}
        </div>
      `,
    },
  ],
};
