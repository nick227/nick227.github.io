const pipelineStages = [
  { label: 'Splunk agents', note: 'Thousands of devices' },
  { label: 'Kafka', note: 'Event stream' },
  { label: 'Akka / Scala', note: 'Analysis' },
  { label: 'Elasticsearch', note: 'My layer: schema, APIs, search', owned: true },
  { label: 'Support UI', note: '30 engineers acting on tickets' },
];

const pipelineResources = [
  {
    kind: 'Blog',
    title: 'Elasticsearch without locking your database',
    description: 'How ES answers queries and what a good index schema looks like.',
    href: '#article/elasticsearch-full-text-search-without-locking-your-database',
  },
  {
    kind: 'Blog',
    title: 'Optimizing for Neo4j',
    description: 'Model for the questions you ask, not for table purity.',
    href: '#article/optimizing-for-neo4j',
  },
  {
    kind: 'Blog',
    title: 'Mass image harvesting',
    description: 'Batch image generation with prompt variety and fail-fast queues.',
    href: '#article/mass-image-harvesting-with-variety-and-studio-quality',
  },
  {
    kind: 'Blog',
    title: 'n8n is cool and why I hate it',
    description: 'Visual automation for solo projects, and why backups matter.',
    href: '#article/actually-n8n-is-pretty-cool-and-why-i-hate-it',
  },
];

export const pipelines = {
  backgroundColor: '#ffffff',
  color: '#050505',
    screens: [
    {
      html: `
        <h1>Pipelines</h1>
        <div class="row row-stack">
          <div class="col-50">
            <p class="page-lead">I build pipelines that solve problems at scale</p>
            <p>
            Data arrives from many places, in many shapes.
            A good pipeline can be taken apart and put together again.
            At Cisco, Splunk agents on thousands of devices streamed through Kafka but every system no matter how small is a pipeline. My goal is make the parts we need to change quickly ephemeral and the foundation robust and reliable.
            </p>

            <h3 class="mt-6">Read it</h3>
            <ul class="resource-cards">
              ${pipelineResources.map(resource => `
                <li>
                  <a href="${resource.href}">
                    <span class="resource-cards__kind">${resource.kind}</span>
                    <strong>${resource.title}</strong>
                    <span>${resource.description}</span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="col-50 center">
            <div class="pipe-flow" role="img" aria-label="Cisco event pipeline: Splunk agents, Kafka, Akka and Scala, Elasticsearch, support UI">
              <div class="pipe-flow__tube">
                ${[0, 1, 2, 3, 4, 5].map(packet => `<span style="--packet: ${packet}"></span>`).join('')}
              </div>
              <ol class="pipe-flow__stages">
                ${pipelineStages.map(stage => `
                  <li${stage.owned ? ' class="is-owned"' : ''}>
                    <strong>${stage.label}</strong>
                    <span>${stage.note}</span>
                  </li>
                `).join('')}
              </ol>
            </div>
          </div>
        </div>
      `,
    },
  ],
}
