export const creative = {
  backgroundColor: '#ff8fc7',
  color: '#25101b',
  screens: [
    {
      timer: 2600,
      html: `
        <div class="stage-content stage-opening creative-opening">
          <div class="creative-title-wrap">
            <h1 class="page-title">Design<span>.</span></h1>
            <i class="creative-focus" aria-hidden="true"></i>
          </div>
        </div>
      `,
    },
    {
      timer: 4200,
      html: `
        <div class="stage-content stage-start creative-principle">
          <p class="stage-label">UI · UX · Information architecture</p>
          <h2>
            Design shortens the distance between
            <strong>intent and result.</strong>
          </h2>
          <p class="stage-note creative-principle__note">
            Hierarchy creates focus. Patterns build familiarity.
          </p>
        </div>
      `,
    },
    {
      html: `
        <div class="stage-content stage-start">
          <div class="reading-column creative-finale__content">
            <p class="stage-label">How I approach interface design</p>
            <h2>Interfaces that get things done</h2>
            <p>
              I start by understanding what someone is trying to do. Then I
              organize the information, make important choices easy to spot,
              and remove steps that do not help.
            </p>
            <ul>
              <li>Clear hierarchy and navigation</li>
              <li>Familiar patterns and predictable behavior</li>
              <li>Fewer steps and less to remember</li>
              <li>Visual choices that fit the product and its brand</li>
            </ul>
          </div>
        </div>
      `,
    },
  ],
}
