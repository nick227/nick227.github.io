const agentOutputs = [
  { kind: 'Text', endpoint: 'transform' },
  { kind: 'HTML', endpoint: 'generate' },
  { kind: 'Image', endpoint: 'render' },
];

export const aiAutomation = {
    backgroundColor: '#ffffff',
    color: '#050505',
    screens: [
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
          <div class="stack">
            <div class="center">
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
