const pipelineStages = [
  { label: 'Splunk agents', note: 'Thousands of devices' },
  { label: 'Kafka', note: 'Event stream' },
  { label: 'Akka / Scala', note: 'Analysis' },
  { label: 'Elasticsearch', note: 'My layer: schema, APIs, search', owned: true },
  { label: 'Support UI', note: '30 engineers acting on tickets' },
];

export const pipelines = {
  backgroundColor: '#ffffff',
  color: '#050505',
    screens: [
    {
      timer: 600,
      html: `
        <div class="stage-content">
          <div class="pipe-border pipeline-opening">
            <span class="pipe pipe-top"></span>
            <span class="pipe pipe-right"></span>
            <span class="pipe pipe-bottom"></span>
            <span class="pipe pipe-left"></span>
            <div class="pipe-border__content">
              <h1 class="page-title">Pipelines</h1>
            </div>
          </div>
        </div>
      `,
    },
    {
      html: `
        <h1>Pipelines</h1>
        <p class="page-lead">I build pipelines that solve problems at scale</p>
        <p>
        Data arrives from many places, in many shapes.
        A good pipeline can be taken apart and put together again.
        At Cisco, Splunk agents on thousands of devices streamed through Kafka, but every system, no matter how small, is a pipeline. I make the parts we need to change quickly ephemeral, and the foundation robust and reliable.
        </p>
        <div class="figure">
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
      `,
    },
  ],
}
