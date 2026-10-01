const agentOutputs = [
  { kind: 'Text', endpoint: 'transform' },
  { kind: 'HTML', endpoint: 'generate' },
  { kind: 'Image', endpoint: 'render' },
];

const aiResources = [
  {
    kind: 'Live app',
    title: 'Storyboarder',
    description: 'Turns a written script into a storyboard and video.',
    href: 'https://storyboard-to-video.up.railway.app/',
  },
];

export const aiAutomation = {
    backgroundColor: '#ffffff',
    color: '#050505',
    screens: [
      {
        timer: 600,
        html: `
          <div class="stage-content">
            <h1 class="page-title">Automation</h1>
            <div class="chevron-flow" aria-hidden="true">
              <div class="chevron-flow__track">
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
              </div>
            </div>
          </div>
        `,
      },
      {
        html: `
          <h1>Automation</h1>
          <p class="page-lead">Every interface is a conversation</p>
          <p>
          I believe most software is heading toward AI oversight.
          At Digital Harbor I built the platform to get us there.
          Teams created an AI agent, tested it in a chat window, and published it as an API.
          Each agent took a prompt and returned text, HTML, or an image.
          We ran more than 100 of them, from form building to translation to code.
          An AI reviewer also summarized every GitLab check-in for the whole team.
          Not everything shipped. Our 2024 AI page editor wasn't accurate enough for production.
          </p>
          <div class="figure" aria-hidden="true">
            <div class="chevron-flow">
              <div class="chevron-flow__track">
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
              </div>
            </div>
          </div>
          <div class="row row-stack">
            <div class="col-50">
              <h3>Try it</h3>
              <ul class="resource-cards">
                ${aiResources.map(resource => `
                  <li>
                    <a class="is-external" href="${resource.href}" target="_blank" rel="noopener noreferrer">
                      <span class="resource-cards__kind">${resource.kind}</span>
                      <strong>${resource.title}</strong>
                      <span>${resource.description}</span>
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="col-50 center">
              <div class="ai-agent" aria-label="An agent takes a prompt and returns text, HTML, or an image" role="img">
                <p class="ai-agent__prompt"><span>prompt</span></p>
                <span class="ai-agent__rail"></span>
                <div class="ai-agent__core"><span>agent</span></div>
                <span class="ai-agent__rail"></span>
                <ul class="ai-agent__outputs">
                  ${agentOutputs.map((output, index) => `
                    <li style="--output: ${index}">
                      <strong>${output.kind}</strong>
                      <span>${output.endpoint}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ],
  }
