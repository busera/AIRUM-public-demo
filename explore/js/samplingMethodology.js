const MATRIX_ROWS = [
  ['Daily or more frequent', '20 items', '30 items', '40 items'],
  ['Weekly', '5 items', '10 items', '15 items'],
  ['Monthly', '2 items', '2 items', '2 items'],
  ['Quarterly', '2 items', '2 items', '2 items'],
  ['Annual', 'Test annual execution plus interim changes, exceptions, approvals, and triggering events', 'Test annual execution plus interim changes, exceptions, approvals, and triggering events', 'Test annual execution plus interim changes, exceptions, approvals, and triggering events']
];

function matrixRowsHtml() {
  return MATRIX_ROWS.map(([frequency, low, medium, high]) => `
    <tr>
      <th scope="row">${frequency}</th>
      <td>${low}</td>
      <td>${medium}</td>
      <td>${high}</td>
    </tr>`).join('');
}

function renderSamplingMethodology() {
  document.querySelector('#sampling-methodology-root').innerHTML = `
    <nav class="demo-nav detail-nav" aria-label="AIRUM demo pages">
      <a href="./">Back to explore</a>
      <a aria-current="page" href="sampling-methodology.html">Sampling methodology</a>
      <a href="../">AIRUM overview</a>
    </nav>
    <section class="panel public-boundary-panel" aria-label="Reduced public demo boundary">
      <h2>Reduced public demo</h2>
      <p>No private audit material. This page shows public demo sampling guidance only and does not publish full AIRUM methodology, source mappings, internal scoring, or private audit material.</p>
    </section>
    <section class="panel detail-hero">
      <p class="section-kicker">Sampling Methodology</p>
      <h1>Frequency and Risk Matrix</h1>
      <p class="lede dark-text">Use this reference after population completeness, control frequency, and assessed control risk are confirmed. Applicable Control Details pages show a minimum starting suggestion so the full matrix is not repeated on every control page.</p>
    </section>
    <section class="detail-stack">
      <article class="panel">
        <h2>Sample Size Matrix</h2>
        <div class="table-wrap">
          <table class="sampling-table">
            <thead>
              <tr>
                <th scope="col">Control Frequency</th>
                <th scope="col">Low Risk</th>
                <th scope="col">Medium Risk</th>
                <th scope="col">High Risk</th>
              </tr>
            </thead>
            <tbody>${matrixRowsHtml()}</tbody>
          </table>
        </div>
      </article>
      <article class="panel">
        <h2>How to Apply</h2>
        <ul class="procedure-list">
          <li>First confirm that the population is complete and that the control frequency is accurate for the audit period.</li>
          <li>Use the low-risk column as the minimum starting point unless the assessed control risk supports a medium-risk or high-risk sample.</li>
          <li>For annual controls, test the annual execution and any interim changes, exceptions, approvals, or triggering events because the matrix does not define a standard yearly sample size.</li>
          <li>For low-volume populations below the suggested size, test the full population and document the rationale.</li>
          <li>Add judgmental selections for high-risk approvals, overrides, incidents, material model changes, late reviews, and unresolved exceptions.</li>
        </ul>
      </article>
    </section>`;
}

renderSamplingMethodology();
