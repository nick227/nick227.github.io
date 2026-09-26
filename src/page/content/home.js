const resumeSummary = 'Principal engineer building enterprise platforms and AI systems for 20 years.';

const resumeImpact = [
  { value: '20 yrs', label: 'Enterprise platforms' },
  { value: '100+', label: 'AI endpoints' },
  { value: '60+', label: 'TV stations' },
  { value: '10M+', label: 'Page views' },
];

const resumeJobList = [
  {
    company: 'Digital Harbor',
    logos: [{ name: 'Digital Harbor', mark: 'DH', color: '#0f4c81' }],
    title: 'Team Lead & AI Architect',
    dates: '2020 – 2025',
    summary:
      'Team lead on three product initiatives and architect of the company’s move to AI. Built the agent platform behind 100+ AI endpoints. Added AI review to every GitLab check-in, AI search over company data, and a shared Angular library.',
  },
  {
    company: 'Cisco Systems',
    logos: [{ name: 'Cisco', mark: 'C', color: '#049fd9' }],
    title: 'Senior Engineer',
    dates: '2012 – 2020',
    summary:
      'Took an enterprise alerting platform from internal launch to public release and a global innovation award. Owned its schema, APIs, and UI, fed by Splunk from thousands of devices. Led teams in Austin and offshore, and ran hiring and scrum.',
  },
  {
    company: 'Nexstar Broadcasting',
    logos: [{ name: 'Nexstar', mark: 'N', color: '#d71920' }],
    title: 'Web Platforms',
    dates: '2005 – 2009',
    summary:
      'Moved more than 60 local TV station websites onto one shared, multi-tenant platform, replacing dozens of separate sites. The network served over a million visitors a day and more than 10 million page views.',
  },
  {
    company: 'Impremedia · Microsoft · AT&T',
    logos: [
      { name: 'Impremedia', mark: 'I', color: '#5b2a86' },
      { name: 'Microsoft', mark: 'M', color: '#737373' },
      { name: 'AT&T', mark: 'A', color: '#00a8e0' },
    ],
    title: 'Earlier roles',
    dates: '2001 – 2012',
    summary:
      'Consolidated major newspaper publishers onto one digital content system at Impremedia, often as a team of two. Started in telecom operations at AT&T and tech support at Microsoft, earning CNA and Network+.',
  },
];

const resumeSkills = [
  'Solution architecture',
  'AI agents & RAG',
  'LLM automation',
  'Multi-tenant platforms',
  'Data pipelines',
  'Angular · React',
  'Node · APIs',
  'Team leadership',
];

export const home = {
  backgroundColor: '#ffffff',
  color: '#050505',
  screens: [
    {
      timer: 3000,
      html: `
        <div class="stage-content home-content">
          <h1 class="site-title">Nick Rios</h1>
          <svg class="home-countdown mt-6" viewBox="0 0 36 36" role="img" aria-label="Resume opens shortly">
            <circle cx="18" cy="18" r="16" pathLength="100"></circle>
          </svg>
        </div>
      `,
    },
    {
      html: `
        <div class="resume-content">
          <header class="resume-header">
            <div>
              <h2>Nick Rios</h2>
              <p>${resumeSummary}</p>
            </div>
            <p class="resume-contacts">
              <a class="link" href="mailto:nicholas.jay.rios@gmail.com">nicholas.jay.rios@gmail.com</a>
              <a class="link" href="https://www.linkedin.com/in/nick-rios" target="_blank" rel="noopener">LinkedIn</a>
              <a class="link" href="https://github.com/nick227" target="_blank" rel="noopener">GitHub</a>
            </p>
          </header>

          <div class="resume-layout">
            <section class="resume-roles" aria-label="Experience">
              ${resumeJobList.map(job => `
                <article class="resume-job">
                  <div class="resume-job__logos${job.logos.length > 1 ? ' is-group' : ''}">
                    ${job.logos.map(logo => `<span class="resume-logo" style="--logo: ${logo.color}" title="${logo.name}" aria-hidden="true">${logo.mark}</span>`).join('')}
                  </div>
                  <div class="resume-job__body">
                    <div class="resume-job__heading">
                      <h4>${job.company}</h4>
                      <p class="resume-job__meta">${job.title} · ${job.dates}</p>
                    </div>
                    <p>${job.summary}</p>
                  </div>
                </article>
              `).join('')}
            </section>

            <aside class="resume-aside">
              <ul class="resume-impact">
                ${resumeImpact.map(item => `<li><strong>${item.value}</strong><span>${item.label}</span></li>`).join('')}
              </ul>
              <p class="resume-skills">${resumeSkills.map(skill => skill.replaceAll(' ', '&nbsp;')).join(' · ')}</p>
              <a class="link resume-pdf" href="/nick-rios.pdf" target="_blank" download>Full resume (PDF)</a>
            </aside>
          </div>
        </div>
      `,
    },
  ],
};
