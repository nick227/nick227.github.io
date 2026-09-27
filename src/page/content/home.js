const resumeSummary = 'Principal engineer building enterprise platforms and AI systems for 20 years.';

const resumeImpact = [
  { value: '20 yrs', label: 'Enterprise platforms' },
  { value: '100+', label: 'AI endpoints' },
  { value: '30+', label: 'Online projects' },
  { value: '10M+', label: 'Page views' },
];

const resumeJobList = [
  {
    company: 'Digital Harbor',
    logos: [{ name: 'Digital Harbor', mark: 'DH', color: '#0f4c81' }],
    title: 'Team Lead',
    dates: '2020 – 2025',
    summary:
      'Team lead on multiple product initiatives including ui-style-library and Set-Forms. Champion of the company’s move to AI. Built agent platform behind 100+ AI endpoints.',
  },
  {
    company: 'Cisco Systems',
    logos: [{ name: 'Cisco', mark: 'C', color: '#049fd9' }],
    title: 'Senior Engineer',
    dates: '2012 – 2020',
    summary:
      'Launched enterprise network management platform from internal to public release, earned global innovation award. Owned schema, APIs, and UI. Running multiple teams.',
  },
  {
    company: 'Nexstar Broadcasting',
    logos: [{ name: 'Nexstar', mark: 'N', color: '#d71920' }],
    title: 'System Engineer',
    dates: '2005 – 2009',
    summary:
      'Launched more than 60 local TV station websites onto a shared, multi-tenant platform. The network served over a million views a day at peak traffic.',
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
      'Consolidated major newspaper publishers onto one dms at Impremedia. Started in telecom operations at AT&T and Sprint, earning CNA and Network+.',
  },
];

const resumeSkills = [
  'Solution architecture',
  'AI agents & RAG',
  'LLM automation',
  'Multi-tenant platforms',
];

export const home = {
  backgroundColor: '#ffffff',
  color: '#050505',
  screens: [
    {
      timer: 2300,
      html: `
        <div class="stage-content home-content">
          <h1 class="site-title home-title">
            <span class="home-title__ink">Nick Rios</span>
            <span class="home-title__eye home-title__eye--cyan" aria-hidden="true">Nick Rios</span>
            <span class="home-title__eye home-title__eye--red" aria-hidden="true">Nick Rios</span>
          </h1>
        </div>
      `,
    },
    {
      html: `
        <div class="resume-content">
          <header class="resume-header">
            <div>
              <h2>Nicholas J. Rios</h2>
            </div>
            <p class="resume-contacts">
              <a class="link" href="mailto:nicholas.jay.rios@gmail.com">email</a>
              <a class="link" href="https://www.linkedin.com/in/nick-rios" target="_blank" rel="noopener">linkedIn</a>
              <a class="link" href="https://github.com/nick227" target="_blank" rel="noopener">gitHub</a>
              <a class="link resume-pdf" href="/nick-rios.pdf" target="_blank" download>resume</a>
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
            
            <iframe width="460" height="260" src="https://www.youtube.com/embed/fiF5p3SrKfs?si=OpmS970GRrYhSIZ0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

              <ul class="resume-impact">
                ${resumeImpact.map(item => `<li><strong>${item.value}</strong><span>${item.label}</span></li>`).join('')}
              </ul>
              <p class="resume-skills">${resumeSkills.map(skill => skill.replaceAll(' ', '&nbsp;')).join(' · ')}</p>
            </aside>
          </div>
        </div>
      `,
    },
  ],
};
