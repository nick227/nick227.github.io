export const architecture = {
    backgroundColor: '#1746d1',
    color: '#ffffff',
    screens: [
      {
        timer: 3600,
        html: `<div class="stage-content">
            <h1 class="page-title stage-layer">Architecture</h1>
            <div class="stage-center">
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
            </div>
          </div>`
      }, 
      {
        html: `
          <div class="stage-content">
            <div>
              <h1>Performance that scales</h1>
              <p>
              My approach is declarative and model-first. I build streamlined systems that conserve resources and reduces operational costs. I believe in YAGNI, avoid boilerplate and treat the database as critical infrastructure.
              </p>

              <ul>
                <li><h3>Cisco — Single Pane of Glass</h3> 
                <p>Unified microservices, Elasticsearch, Neo4j, operational data</p>
                </li>

                <li><h3>AI orchestration</h3>
                <p>Built platform supporting 100+ LLM-powered agents and APIs</p>
                </li>

                <li><h3>Enterprise CMS</h3> 
                <p>Consolidated major publishers onto shared systems at scale</p>
                </li>
              </ul>

              <p>
              I am experienced sizing and delivering on requests for various scales and build up from zero cost to multi-million dollar systems. I have experience with both monolithic and microservice architectures, and I am comfortable working with back-end systems and technologies.
              </p>
            </div>
          </div>
        `,
      },
    ],
  }
