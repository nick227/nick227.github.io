export const leadership = {
  backgroundColor: '#ff5b31',
  color: '#180702',
  screens: [
    {
      timer: 800,
      html: `
          <div class="stage-content">
          <h1 class="page-title">Leadership</h1>
        </div>
      `,
    },
    {
      html: `
      <h1>Leadership</h1>
        <div class="row">
          <div class="col-50">
          <h3>Track record</h3>

            <ul>
              <li><h3>Digital Harbor — Team lead</h3>
              <p>Led three product initiatives and was chosen for the company-wide leadership retreat.</p>
              </li>

              <li><h3>Cisco — Local and offshore teams</h3>
              <p>Led teams in Austin and overseas, and ran hiring, interviews, and the team’s scrum.</p>
              </li>

              <li><h3>Digital Harbor — AI innovation calls</h3>
              <p>Hosted weekly calls where we shared AI stories, watched demos, and talked through what mattered for our products.</p>
              </li>
            </ul>
            <p>
            I lead by example and take on the hardest or most cross-cutting work myself.
            Sometimes a team isn’t stuck on skill; it is waiting for someone to go first.
            At Digital Harbor, two Angular products had to match, and nobody owned the shared library that would make that possible.
            I started it, and the team built on it.
            I break big goals into small pieces and make hard tradeoffs visible.
            Ask the people who have worked with me, and they will tell you I have lots of opinions.
            I share them openly, so the team always knows where I stand and can push back.
            </p>
          </div>
          <div class="col-50 center">
            <div class="leadership-pace" aria-hidden="true">
              <span><i></i></span>
              <span><i></i></span>
              <span><i></i></span>
              <span><i></i></span>
              <span><i></i></span>
            </div>
          </div>
        </div>
      `,
    },
  ],
}
