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
    external: true,
  },
  {
    kind: 'Blog',
    title: 'Why I think LangChain is overrated',
    description: 'What paid off on our agent platform, and where a thinner system wins.',
    href: '#article/why-i-think-langchain-is-overrated',
  },
  {
    kind: 'Blog',
    title: 'Experimenting with Pinecone',
    description: 'Chatting over hundreds of pages of messy scrum data with RAG.',
    href: '#article/experimenting-with-pinecone-database',
  },
  {
    kind: 'Blog',
    title: 'AI video is still a grueling process',
    description: 'What a one-minute AI video really costs across five models.',
    href: '#article/using-ai-to-generate-video-is-still-a-grueling-process',
  },
];

export const aiAutomation = {
    backgroundColor: '#dfff00',
    color: '#101010',
    screens: [
      {
        timer: 600,
        html: `
          <div class="stage-content">
            <h1 class="page-title stage-layer">Automation</h1>
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
          <div class="row row-stack">
            <div class="col-50">
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

              <h3 class="mt-6">Read it, try it</h3>
              <ul class="resource-cards">
                ${aiResources.map(resource => `
                  <li>
                    <a href="${resource.href}"${resource.external ? ' target="_blank" rel="noopener"' : ''}>
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
