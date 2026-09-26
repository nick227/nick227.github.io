const architectureLayers = [
  { label: 'schema.prisma', note: 'Model defined once' },
  { label: 'DMMF', note: 'Normalized metadata' },
  { label: 'OpenAPI', note: 'The contract' },
  { label: 'Server + SDK', note: 'Generated, never retyped' },
  { label: 'Hooks → Pages', note: 'Typed all the way up' },
];

const architectureResources = [
  {
    kind: 'GitHub',
    title: 'ssot-codegen',
    description: 'Turns a Prisma schema into SDKs, API scaffolding, and a complete UI.',
    href: 'https://github.com/nick227/ssot-codegen',
  },
  {
    kind: 'Medium',
    title: 'SSOT codegen pipeline with Prisma DMMF templates',
    description: 'How the generator reads the schema and writes every routine layer.',
    href: 'https://medium.com/@nick.rios/ssot-codegen-pipeline-with-prisma-backed-dmmf-templates-e0fc152d469f',
  },
  {
    kind: 'GitHub',
    title: 'nick-webapp-factory',
    description: 'A Claude skill that builds full-stack apps on an OpenAPI-first spine.',
    href: 'https://github.com/nick227/nick-webapp-factory-skill',
  },
  {
    kind: 'Medium',
    title: 'A Claude skill for consistent system designs',
    description: 'Why I packaged my architecture as a skill, and how a build runs.',
    href: 'https://medium.com/javascript-in-plain-english/i-wrote-a-claude-skill-to-produce-consistent-high-quality-system-designs-every-time-that-saves-187ac0e4e13e',
  },
];

export const architecture = {
    backgroundColor: '#1746d1',
    color: '#ffffff',
    screens: [
      {
        timer: 600,
        html: `<div class="stage-content">
            <h1 class="page-title stage-layer">Architecture</h1>
              <div class="cube-wrap">
                <div class="cube">
                  <div class="cube__face cube__face--front"></div>
                  <div class="cube__face cube__face--back"></div>
                  <div class="cube__face cube__face--left"></div>
                  <div class="cube__face cube__face--right"></div>
                  <div class="cube__face cube__face--top"></div>
                  <div class="cube__face cube__face--bottom"></div>
                </div>
              </div>
          </div>`
      },
      {
        html: `
          <h1>Architecture</h1>
          <div class="row row-stack">
            <div class="col-50">
              <p>
              I build systems from the data model up.
              The model is defined once, in Prisma schema.
              Everything routine is generated from it: validators, routes, the OpenAPI contract, a typed client SDK, and query hooks.
              When the model changes, every layer changes with it.
              Most teams overbuild, and hand-maintained glue code is where the bugs live.
              Removing that code removes a whole class of errors.
              </p>

              <h3 class="mt-6">Read it, run it</h3>
              <ul class="resource-cards">
                ${architectureResources.map(resource => `
                  <li>
                    <a href="${resource.href}" target="_blank" rel="noopener">
                      <span class="resource-cards__kind">${resource.kind}</span>
                      <strong>${resource.title}</strong>
                      <span>${resource.description}</span>
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="col-50 center">
              <ol class="arch-spine" aria-label="Generation pipeline, from schema to pages">
                ${architectureLayers.map((layer, index) => `
                  <li style="--layer: ${index}">
                    <strong>${layer.label}</strong>
                    <span>${layer.note}</span>
                  </li>
                `).join('')}
              </ol>
            </div>
          </div>
        `,
      },
    ],
  }
