export const leadership = {
  backgroundColor: '#ff5b31',
  color: '#180702',
  screens: [
    {
      timer: 2800,
      html: `
        <div class="stage-content stage-opening leadership-opening">
          <div class="leadership-pace" aria-hidden="true">
            <span><i></i></span>
            <span><i></i></span>
            <span><i></i></span>
            <span><i></i></span>
          </div>
          <h1 class="page-title">Leadership</h1>
        </div>
      `,
    },
    {
      timer: 3900,
      html: `
        <div class="stage-content stage-start leadership-clarity">
          <p class="stage-label">From ambiguity to action</p>
          <h2>Make the work clear enough to move.</h2>
          <p class="stage-note">
            I break requirements into small, well-sized units, make the hard
            tradeoffs visible, and give people work they can own without being
            overwhelmed.
          </p>
          <ol class="leadership-workflow ruled-list meta-list">
            <li>Understand</li>
            <li>Size</li>
            <li>Delegate</li>
            <li>Execute</li>
          </ol>
        </div>
      `,
    },
    {
      timer: 4100,
      html: `
        <div class="stage-content stage-start leadership-example">
          <p class="stage-label">Lead by example</p>
          <div class="leadership-example__grid">
            <h2>I stay close to the work.</h2>
            <div>
              <p>
                I take on complex problems myself and work alongside developers
                when the path is unclear. That builds shared responsibility
                instead of silos.
              </p>
              <ul>
                <li>Keep ownership shared</li>
                <li>Make workloads visible</li>
                <li>Mentor through real decisions</li>
              </ul>
            </div>
          </div>
        </div>
      `,
    },
    {
      html: `
        <div class="stage-content stage-start leadership-finale">
          <div class="reading-column reading-column--wide leadership-finale__content">
            <p class="stage-label">Design · Engineering · Product</p>
            <h2>Trust comes from sound decisions and follow-through.</h2>
            <p>
              I have years of experience working across design, development,
              and product management. I listen for each discipline's concerns,
              keep the team optimistic, and stay focused on getting useful work
              finished.
            </p>
            <ul class="leadership-values ruled-list meta-list">
              <li>Clarity</li>
              <li>Judgment</li>
              <li>Delegation</li>
              <li>Mentorship</li>
              <li>Alignment</li>
              <li>Execution</li>
            </ul>
          </div>
        </div>
      `,
    },
  ],
}
