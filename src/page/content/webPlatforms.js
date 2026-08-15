export const webPlatforms = {
  backgroundColor: '#111111',
  color: '#ffffff',
  screens: [
    {
      timer: 2800,
      html: `
        <div class="stage-content stage-opening framework-opening">
          <div class="framework-scaffold" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h1 class="page-title">Frameworks</h1>
        </div>
      `,
    },
    {
      timer: 4200,
      html: `
        <div class="stage-content stage-stretch framework-spectrum">
          <p class="stage-label">Across the web stack</p>
          <div class="framework-spectrum__grid">
            <section>
              <p class="stage-label framework-side">Front end</p>
              <h2>Angular<br>React<br>Vite</h2>
              <p>Components, state, rendering, composition.</p>
            </section>
            <section>
              <p class="stage-label framework-side">Back end + full stack</p>
              <div class="framework-names">
                <span>NestJS</span>
                <span>LoopBack</span>
                <span>Feathers</span>
                <span>Django</span>
                <span>Next.js</span>
                <span>Smarty / PHP</span>
              </div>
              <p>Routes, services, data, validation, delivery.</p>
            </section>
          </div>
        </div>
      `,
    },
    {
      timer: 3800,
      html: `
        <div class="stage-content stage-stretch framework-common">
          <p class="stage-label">Different syntax. Shared foundations.</p>
          <div class="framework-common__map">
            <span>routing</span>
            <span>state</span>
            <span>components</span>
            <strong>Common<br>concepts</strong>
            <span>services</span>
            <span>data flow</span>
            <span>validation</span>
            <span>rendering</span>
            <span>testing</span>
          </div>
        </div>
      `,
    },
    {
      html: `
        <div class="stage-content stage-start framework-finale">
          <p class="stage-label">Wide experience. Durable understanding.</p>
          <h2>
            Frameworks change.
            <strong>The concepts transfer.</strong>
          </h2>
          <p>
            I work comfortably across the stack because I understand the
            patterns beneath the tools.
          </p>
        </div>
      `,
    },
  ],
}
