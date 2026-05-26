const DATA_URL = 'data/demo-risk-universe.json?v=20260526-v32-final-validation-closeout';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function valueText(value, fallback = 'Not specified.') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function procedureListHtml(items = [], ordered = true) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) return '<p class="muted">Not specified.</p>';
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="procedure-list">${values.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

function sourceListHtml(labels = []) {
  const values = Array.isArray(labels) ? labels.filter(Boolean) : [];
  if (!values.length) return '<p class="muted">No public source labels included.</p>';
  return `<ul class="control-source-list">${values.map((label) => `<li>${escapeHtml(label)}</li>`).join('')}</ul>`;
}

function backHref(riskId) {
  const suffix = riskId ? `#${encodeURIComponent(riskId)}` : '';
  return `./${suffix}`;
}

function publicBoundaryHtml() {
  return `
    <section class="panel public-boundary-panel" aria-label="Reduced public demo boundary">
      <h2>Reduced public demo</h2>
      <p>No private audit material. This page shows public demo control guidance only and does not publish full AIRUM methodology, source mappings, internal scoring, source captures, licensed-source locators, local vault paths, or private extraction trails. It is not source-perfect, legally validated, or final audit workpaper material without engagement-specific tailoring.</p>
    </section>`;
}

function topbarHtml(riskId) {
  return `
    <nav class="demo-nav detail-nav" aria-label="AIRUM demo pages">
      <a href="${escapeHtml(backHref(riskId))}">Back to explore</a>
      <a href="sampling-methodology.html">Sampling methodology</a>
      <a href="../">AIRUM overview</a>
    </nav>`;
}

function controlProcedureHtml(procedure = {}) {
  const tod = procedure.testOfDesign || {};
  const toe = procedure.testOfEffectiveness || {};
  return `
    <section class="detail-stack" aria-label="Audit procedure guidance">
      <article class="panel procedure-card audit-procedure-card">
        <h2>Audit Procedure</h2>
        <div class="procedure-box">
          <h3>${escapeHtml(valueText(procedure.auditProcedureName, 'Audit procedure'))}</h3>
          <p>${escapeHtml(valueText(procedure.auditProcedureDescription))}</p>
        </div>
      </article>
      <article class="panel procedure-card tod-card">
        <h2>Test of Design (ToD)</h2>
        <div class="procedure-box">
          <p class="procedure-objective">${escapeHtml(valueText(tod.overallTestObjectivePurpose))}</p>
          <h3>Detailed Test Steps</h3>
          ${procedureListHtml(tod.detailedTestSteps, true)}
          <h3>Recommended Artifacts</h3>
          ${procedureListHtml(tod.recommendedArtifacts, false)}
        </div>
      </article>
      <article class="panel procedure-card toe-card">
        <h2>Test of Effectiveness (ToE)</h2>
        <div class="procedure-box">
          <p class="procedure-objective">${escapeHtml(valueText(toe.overallTestObjectivePurpose))}</p>
          <div class="sampling-guidance">
            <strong>Recommended Sampling Strategy</strong>
            <p>${escapeHtml(valueText(toe.recommendedSamplingStrategy))}</p>
          </div>
          <div class="sampling-guidance">
            <strong>Recommended Sample Size</strong>
            <p>${escapeHtml(valueText(toe.recommendedSampleSize))}</p>
            <p><a class="control-details-link" href="sampling-methodology.html">Open sampling methodology matrix</a></p>
          </div>
          <h3>Detailed Test Steps</h3>
          ${procedureListHtml(toe.detailedTestSteps, true)}
          <h3>Recommended Artifacts</h3>
          ${procedureListHtml(toe.recommendedArtifacts, false)}
        </div>
      </article>
    </section>`;
}

function riskContextHtml(risk) {
  if (!risk) return '';
  return `
    <article class="panel detail-context-card">
      <h2>Related AI Risk</h2>
      <p><strong>${escapeHtml(risk.name)}</strong></p>
      <p>${escapeHtml(risk.description)}</p>
      <p><a class="control-details-link" href="${escapeHtml(backHref(risk.id))}">Return to this risk in the explorer</a></p>
    </article>`;
}

function renderControlInfo({ control, risk }) {
  document.querySelector('#control-info-root').innerHTML = `
    ${topbarHtml(risk?.id)}
    ${publicBoundaryHtml()}
    <section class="panel detail-hero">
      <p class="section-kicker">Applicable Control Details</p>
      <h1>${escapeHtml(valueText(control.title, 'Applicable Control'))}</h1>
      <div class="detail-meta-grid">
        <div><span>Control ID</span><strong>${escapeHtml(valueText(control.controlId))}</strong></div>
        <div><span>Control Family</span><strong>${escapeHtml(valueText(control.controlFamily))}</strong></div>
      </div>
    </section>
    <section class="detail-grid">
      <article class="panel">
        <h2>Control Summary</h2>
        <div class="field-block">
          <strong>Objective</strong>
          <p>${escapeHtml(valueText(control.objective))}</p>
        </div>
        <div class="field-block">
          <strong>Description</strong>
          <p>${escapeHtml(valueText(control.description))}</p>
        </div>
      </article>
      <article class="panel">
        <h2>Control Sources</h2>
        ${sourceListHtml(control.sourceLabels)}
      </article>
    </section>
    ${controlProcedureHtml(control.auditProcedure)}
    ${riskContextHtml(risk)}
  `;
}

function renderNotFound(controlId) {
  document.querySelector('#control-info-root').innerHTML = `
    ${topbarHtml('')}
    <section class="panel detail-hero">
      <p class="section-kicker">Applicable Control Details</p>
      <h1>Control not found</h1>
      <p>No reduced-demo control matched <code>${escapeHtml(controlId || 'missing controlId')}</code>.</p>
    </section>`;
}

async function initControlInfoPage() {
  const params = new URLSearchParams(window.location.search);
  const controlId = params.get('controlId') || '';
  const riskId = params.get('riskId') || '';
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`data request returned ${response.status}`);
  const data = await response.json();
  const control = (data.controls || []).find((candidate) => candidate.controlId === controlId);
  const risk = (data.risks || []).find((candidate) => candidate.id === riskId || candidate.originalRiskId === riskId);
  if (!control) {
    renderNotFound(controlId);
    return;
  }
  renderControlInfo({ control, risk });
}

initControlInfoPage().catch((error) => {
  console.error('AIRUM public demo control details page failed', error);
  document.querySelector('#control-info-root').innerHTML = `
    <section class="panel detail-hero">
      <p class="section-kicker">Applicable Control Details</p>
      <h1>Applicable Control Details could not load</h1>
      <p>Check that the site is served over HTTP and that the reduced demo data file is available.</p>
    </section>`;
});
