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
      <div class="career-job__heading">
        <h3>${job.company}</h3>
        <p class="meta">${job.title} · ${job.dates}</p>
      </div>
      <p>${job.summary}</p>
    </li>
  `;
}

export function careerMarkup() {
  const jobs = careerJobs.map(jobMarkup).join('');

  return `
    <h2 class="widget-title">Career</h2>
    <a class="link" href="/nick-rios.pdf" download>Résumé</a>
    <ol class="career-list">${jobs}</ol>
  `;
}

export function practiceMarkup() {
  const topics = practiceTopics.map(([view, name, line]) => `
    <li>
      <button class="link" type="button" data-view="${view}">${name}</button>
      <p>${line}</p>
    </li>
  `).join('');

  return `
    <h2 class="widget-title">Practice</h2>
    <p class="widget-note">Senior software engineer. Proven record of quality technology delivery. I deliver intelligent systems for enterprise. World-class collaborator and team builder.</p>
    <ul class="practice-list">${topics}</ul>
    <div class="text-links">
      <a class="link" href="#blog">Writing</a>
      <a class="link" href="#contact">Contact</a>
    </div>
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
