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
      <p class="status-badge">Reduced AIRUM Public Demo: v3.2.1</p>
      <h2>Assurance Boundary</h2>
      <p>No private audit material. AIRUM is a pre-discovery preparation aid. This page shows public demo sampling guidance only and does not publish full AIRUM methodology, internal source evidence, source mappings, internal scoring, or private audit material. It does not provide legal advice, does not provide audit assurance, source-perfect validation, or final workpapers.</p>
    </section>
    <section class="panel detail-hero">
      <p class="section-kicker">Sampling Methodology</p>
      <h1>Frequency and Risk Matrix</h1>
      <p class="lede dark-text">Use this reference after population completeness, control frequency, and assessed control risk are confirmed. Applicable Control Details pages show a minimum starting suggestion and point here for the public demo reference.</p>
    </section>
    <section class="detail-stack">
      <article class="panel">
        <h2>Methodology Boundary</h2>
        <p>Use the organization's internal audit sampling methodology where one exists. Where no internal standard applies, use accepted internal-audit sampling practice, tailor the sample to population completeness, control frequency, assessed risk, and evidence quality, and document the professional judgment used.</p>
        <p class="muted">Public IIA material explains audit sampling concepts, including how to think about sample size and methodology selection, but it does not prescribe a universal AIRUM sample-size table. This public demo matrix is an illustrative starting reference, not an authoritative standard.</p>
      </article>
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
