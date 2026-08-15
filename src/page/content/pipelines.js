export const pipelines = {
  backgroundColor: '#b9ddff',
  color: '#071a2c',
  screens: [
    {
      timer: 2220,
      html: `
        <div class="pipe-border stage-content pipeline-opening">
          <span class="pipe pipe-top"></span>
          <span class="pipe pipe-right"></span>
          <span class="pipe pipe-bottom"></span>
          <span class="pipe pipe-left"></span>
          <div class="pipe-border__content">
            <h1 class="page-title">Pipelines</h1>
          </div>
        </div>
      `,
    },
    {
      timer: 3200,
      html: `
        <div class="stage-content stage-start">
          <p class="stage-label">One architectural idea</p>
          <div class="pipeline-scope__grid">
            <span>UI state</span>
            <span>API requests</span>
            <span>AI + tools</span>
            <span>search indexes</span>
            <span>queues + streams</span>
            <span>data infrastructure</span>
          </div>
          <div class="pipeline-route" aria-label="Input moves through four stages to become output">
            <span>input</span><i aria-hidden="true"></i>
            <span>transform</span><i aria-hidden="true"></i>
            <span>validate</span><i aria-hidden="true"></i>
            <span>route</span><i aria-hidden="true"></i>
            <span>output</span>
          </div>
        </div>
      `,
    },
    {
      timer: 3800,
      html: `
        <div class="stage-content stage-stretch">
          <p class="stage-label">Same pattern. Different work.</p>
          <div class="pipeline-flow-list">
            <div class="pipeline-flow">
              <strong>Streaming</strong>
              <span>ingest</span><span>transcode</span><span>moderate</span><span>deliver</span>
            </div>
            <div class="pipeline-flow">
              <strong>Commerce</strong>
              <span>checkout</span><span>authorize</span><span>fulfill</span><span>notify</span>
            </div>
            <div class="pipeline-flow">
              <strong>Finance</strong>
              <span>receive</span><span>validate</span><span>reconcile</span><span>report</span>
            </div>
            <div class="pipeline-flow">
                <strong>Tools</strong>
                <span>Kafka / </span><span>RabbitMQ / </span><span>Redis / </span><span>Splunk / </span>
            </div>
          </div>
        </div>
      `,
    },
    {
      html: `
        <div class="stage-content pipeline-controls">
          <p class="stage-label">Built for real conditions</p>
          <h2>Flow control is beautiful.</h2>
          <ul class="pipeline-control-list ruled-list">
            <li><span>01</span> Buffer the traffic</li>
            <li><span>02</span> Catch the failures</li>
            <li><span>03</span> Record every handoff</li>
            <li><span>04</span> Make pipelines safe</li>
            <li><span>05</span> Predictable results</li>
          </ul>
        </div>
      `,
    },
  ],
}
