const DATA_URL = 'data/demo-risk-universe.json';
const MAX_RESULTS = 9;
const HEX_WIDTH = 146;
const HEX_HEIGHT = 126;
const HEX_X_STEP = 112;
const HEX_Y_STEP = 96;
const HONEYCOMB_COLUMNS = 5;
const MAX_LABEL_LINES = 4;
const MAX_LABEL_CHARS = 16;
const FAMILY_COLORS = Object.freeze([
  '#2E8B57',
  '#4682B4',
  '#DAA520',
  '#CD853F',
  '#9370DB',
  '#DC143C',
  '#FF6347'
]);

function arrayIncludes(values, expected) {
  return Array.isArray(values) && values.includes(expected);
}

export function fullDocumentedRisks(risks) {
  return risks.filter((risk) => risk.detailLevel === 'full');
}

export function scoreRisk(risk, answers) {
  let score = 0;
  const reasons = [];

  if (risk.detailLevel !== 'full') {
    return { risk, score, reasons };
  }
  if (arrayIncludes(risk.contexts, answers.auditContext)) {
    score += 2;
    reasons.push('matches the selected audit context');
  }
  if (arrayIncludes(risk.contexts, answers.mainConcern)) {
    score += 3;
    reasons.push('matches the main concern');
  }
  if (arrayIncludes(risk.lifecycle, answers.lifecycleStage)) {
    score += 2;
    reasons.push('matches the lifecycle stage');
  }
  if (risk.posture === 'Baseline governance') {
    score += 1;
    reasons.push('baseline governance topic');
  }

  return { risk, score, reasons };
}

export function selectCandidateRisks(risks, answers, limit = MAX_RESULTS) {
  return fullDocumentedRisks(risks)
    .map((risk) => scoreRisk(risk, answers))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.risk.id.localeCompare(right.risk.id))
    .slice(0, limit);
}

export function createHoneycombNodes(risks, columns = HONEYCOMB_COLUMNS) {
  const families = [...new Set(risks.map((risk) => risk.family))].sort((left, right) => left.localeCompare(right));
  return risks.map((risk, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const familyIndex = families.indexOf(risk.family);
    return {
      risk,
      index,
      familyIndex,
      x: 16 + (column * HEX_X_STEP),
      y: 16 + (row * HEX_Y_STEP) + ((column % 2) * (HEX_Y_STEP / 2))
    };
  });
}

function familyColorClass(familyIndex) {
  return `family-${familyIndex % FAMILY_COLORS.length}`;
}

function wrapRiskLabel(name) {
  const words = String(name).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= MAX_LABEL_CHARS || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  if (lines.length <= MAX_LABEL_LINES) {
    return lines;
  }
  const kept = lines.slice(0, MAX_LABEL_LINES);
  kept[MAX_LABEL_LINES - 1] = `${kept[MAX_LABEL_LINES - 1].replace(/\.+$/, '')}...`;
  return kept;
}

function riskUniverseCardHtml(risk) {
  return `
    <article class="universe-card full-detail" data-family="${escapeHtml(risk.family)}" data-detail="full">
      <h3>${escapeHtml(risk.name)}</h3>
      <p class="family-label">${escapeHtml(risk.processName)} / ${escapeHtml(risk.subProcessName)}</p>
      <p>${escapeHtml(risk.description)}</p>
      <details>
        <summary>Show original control text and sources</summary>
        ${sourceBackedRiskSectionsHtml(risk)}
      </details>
    </article>`;
}

function matchStrengthLabel(score) {
  if (score >= 6) return 'High match';
  if (score >= 4) return 'Medium match';
  return 'Contextual match';
}

function discoveryFocusText(risk, reasonText) {
  return `Confirm whether this risk is relevant to the scoped activity, who owns the related decisions or controls, and what evidence would support the current position. Selection basis: ${reasonText}.`;
}

function candidateCardHtml(item, index) {
  const reasonText = item.reasons.length ? item.reasons.join('; ') : 'general demo relevance';
  return `
    <article class="card candidate-card">
      <div class="candidate-topline">
        <span class="rank-badge">${String(index + 1).padStart(2, '0')}</span>
        <span class="posture">${escapeHtml(item.risk.posture)}</span>
        <span class="match-pill">${escapeHtml(matchStrengthLabel(item.score))}</span>
      </div>
      <h3>${escapeHtml(item.risk.name)}</h3>
      <p class="family-label">${escapeHtml(item.risk.processName)} / ${escapeHtml(item.risk.subProcessName)}</p>
      <p>${escapeHtml(item.risk.description)}</p>
      <div class="candidate-grid">
        <div>
          <h4>Discovery focus</h4>
          <p>${escapeHtml(discoveryFocusText(item.risk, reasonText))}</p>
        </div>
        <div>
          <h4>Expected-control conversation</h4>
          <p><strong>${escapeHtml(item.risk.expectedControlName)}:</strong> ${escapeHtml(item.risk.expectedControlObjective)}</p>
        </div>
      </div>
      <dl class="candidate-facts">
        <dt>Lifecycle stage</dt><dd>${escapeHtml(item.risk.nistLifecycleStage)}</dd>
        <dt>Why shown</dt><dd>${escapeHtml(reasonText)}.</dd>
        <dt>Source basis</dt><dd>${escapeHtml(item.risk.sourcesAndReferences)}</dd>
      </dl>
      <details>
        <summary>Show control description and source links</summary>
        <p><strong>Control description:</strong> ${escapeHtml(item.risk.expectedControlDescription)}</p>
        <p><strong>Control source basis:</strong> ${escapeHtml(item.risk.controlSourceBasis)}</p>
        ${sourceLinksHtml(item.risk.sourceLinks)}
      </details>
    </article>`;
}

function sourceBackedRiskSectionsHtml(risk) {
  return `
    <dl class="source-backed-fields">
      <dt>Risk ID</dt><dd>${escapeHtml(risk.originalRiskId)}</dd>
      <dt>Expected Control Name</dt><dd>${escapeHtml(risk.expectedControlName)}</dd>
      <dt>Expected Control Description</dt><dd>${escapeHtml(risk.expectedControlDescription)}</dd>
      <dt>Expected Control Objective</dt><dd>${escapeHtml(risk.expectedControlObjective)}</dd>
      <dt>Control Source Basis</dt><dd>${escapeHtml(risk.controlSourceBasis)}</dd>
      <dt>Sources and References</dt><dd>${escapeHtml(risk.sourcesAndReferences)}</dd>
      <dt>NIST AI Lifecycle Stage</dt><dd>${escapeHtml(risk.nistLifecycleStage)}</dd>
    </dl>
    ${sourceLinksHtml(risk.sourceLinks)}`;
}

function sourceLinksHtml(sourceLinks = []) {
  if (!Array.isArray(sourceLinks) || !sourceLinks.length) {
    return '';
  }
  return `
    <div class="source-links">
      <p><strong>Source links</strong></p>
      <ul>
        ${sourceLinks.map((source) => source.url
          ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a></li>`
          : `<li>${escapeHtml(source.label)}</li>`).join('')}
      </ul>
    </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAnswers() {
  return {
    auditContext: document.querySelector('#audit-context').value,
    mainConcern: document.querySelector('#main-concern').value,
    lifecycleStage: document.querySelector('#lifecycle-stage').value
  };
}

function getUniverseFilters() {
  return {
    query: document.querySelector('#risk-search').value.trim().toLowerCase(),
    family: document.querySelector('#family-filter').value
  };
}

function matchesUniverseFilters(risk, filters) {
  const searchable = `${risk.name} ${risk.family}`.toLowerCase();
  return (!filters.query || searchable.includes(filters.query))
    && (!filters.family || risk.family === filters.family);
}

function renderUniverse(risks) {
  const filters = getUniverseFilters();
  const visibleRisks = risks.filter((risk) => matchesUniverseFilters(risk, filters));
  document.querySelector('#universe-results').innerHTML = visibleRisks.map(riskUniverseCardHtml).join('');
  document.querySelector('#universe-visible-count').textContent = String(visibleRisks.length);
  renderHoneycomb(risks, visibleRisks);
}

function renderFamilyOptions(risks) {
  const familyFilter = document.querySelector('#family-filter');
  const families = [...new Set(risks.map((risk) => risk.family))].sort((left, right) => left.localeCompare(right));
  familyFilter.innerHTML = '<option value="">All families</option>'
    + families.map((family) => `<option value="${escapeHtml(family)}">${escapeHtml(family)}</option>`).join('');
}

function contextLabel(answers) {
  const lookup = {
    'governance': 'Governance and oversight',
    'business-audit': 'Business process audit',
    'dedicated-ai': 'Dedicated AI audit',
    'strategy': 'Strategy and value',
    'security': 'Security and misuse',
    'data': 'Data and privacy',
    'operate': 'Operate or monitor',
    'build': 'Build or customize',
    'plan': 'Plan or design'
  };
  return lookup[answers.auditContext] ?? answers.auditContext;
}

function concernLabel(answers) {
  const lookup = {
    'governance': 'Governance',
    'strategy': 'Strategy and value',
    'security': 'Security',
    'data': 'Data',
    'operate': 'Operational monitoring',
    'build': 'Build lifecycle',
    'plan': 'Planning'
  };
  return lookup[answers.mainConcern] ?? answers.mainConcern;
}

function lifecycleLabel(answers) {
  const lookup = {
    'plan': 'Plan and design',
    'build': 'Build and validate',
    'operate': 'Operate or monitor'
  };
  return lookup[answers.lifecycleStage] ?? answers.lifecycleStage;
}

function resultSummaryHtml(selected, answers) {
  const postureCounts = selected.reduce((counts, item) => {
    counts[item.risk.posture] = (counts[item.risk.posture] ?? 0) + 1;
    return counts;
  }, {});
  const postureText = Object.entries(postureCounts)
    .map(([posture, count]) => `${count} ${posture.toLowerCase()}`)
    .join(', ');
  return `
    <div class="summary-card">
      <strong>${selected.length}</strong>
      <span>candidate topics</span>
    </div>
    <div class="summary-card wide">
      <strong>Demo context</strong>
      <span>${escapeHtml(contextLabel(answers))} / ${escapeHtml(concernLabel(answers))} / ${escapeHtml(lifecycleLabel(answers))}</span>
    </div>
    <div class="summary-card wide">
      <strong>Topic mix</strong>
      <span>${escapeHtml(postureText || 'No candidate topics selected')}</span>
    </div>`;
}

function renderResults(risks) {
  const resultsEl = document.querySelector('#results');
  const summaryEl = document.querySelector('#results-summary');
  const answers = getAnswers();
  const selected = selectCandidateRisks(risks, answers);
  summaryEl.innerHTML = resultSummaryHtml(selected, answers);
  resultsEl.innerHTML = selected.map(candidateCardHtml).join('');
}

function renderHoneycomb(risks, visibleRisks = risks) {
  const honeycombEl = document.querySelector('#honeycomb');
  const detailEl = document.querySelector('#honeycomb-detail');
  const visibleIds = new Set(visibleRisks.map((risk) => risk.id));
  const nodes = createHoneycombNodes(risks);
  const rows = Math.ceil(risks.length / HONEYCOMB_COLUMNS);
  const width = 16 + (HONEYCOMB_COLUMNS * HEX_X_STEP) + 40;
  const height = 32 + (rows * HEX_Y_STEP) + HEX_HEIGHT;

  honeycombEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Reduced AIRUM honeycomb with ${risks.length} demo AI risks">
      ${nodes.map((node) => hexagonHtml(node, visibleIds.has(node.risk.id))).join('')}
    </svg>`;

  for (const button of honeycombEl.querySelectorAll('.hexagon')) {
    const activate = () => {
      const risk = risks.find((candidate) => candidate.id === button.dataset.riskId);
      if (risk) {
        detailEl.innerHTML = honeycombDetailHtml(risk);
      }
    };
    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  }
}

function hexagonHtml(node, isVisible) {
  const classNames = [
    'hexagon',
    'full',
    familyColorClass(node.familyIndex),
    isVisible ? 'visible' : 'muted'
  ].join(' ');
  const points = hexagonPoints(node.x, node.y);
  const lines = wrapRiskLabel(node.risk.name);
  const centerX = node.x + (HEX_WIDTH / 2);
  const centerY = node.y + (HEX_HEIGHT / 2);
  const lineHeight = 13;
  const firstY = centerY - (((lines.length - 1) * lineHeight) / 2);
  return `
    <g class="${classNames}" data-risk-id="${escapeHtml(node.risk.id)}" tabindex="0" role="button" aria-label="${escapeHtml(node.risk.name)}">
      <polygon points="${points}"></polygon>
      <text class="hex-label" x="${centerX}" y="${firstY}" text-anchor="middle">
        ${lines.map((line, index) => `<tspan x="${centerX}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`).join('')}
      </text>
      <title>${escapeHtml(node.risk.name)} - ${escapeHtml(node.risk.family)}</title>
    </g>`;
}

function hexagonPoints(x, y) {
  const halfHeight = HEX_HEIGHT / 2;
  const quarterWidth = HEX_WIDTH / 4;
  const fullWidth = HEX_WIDTH;
  const threeQuarterWidth = quarterWidth * 3;
  return [
    [x + quarterWidth, y],
    [x + threeQuarterWidth, y],
    [x + fullWidth, y + halfHeight],
    [x + threeQuarterWidth, y + HEX_HEIGHT],
    [x + quarterWidth, y + HEX_HEIGHT],
    [x, y + halfHeight]
  ].map((point) => point.join(',')).join(' ');
}

function honeycombDetailHtml(risk) {
  return `
    <p class="detail-pill full">Source-backed AIRUM risk</p>
    <h3>${escapeHtml(risk.name)}</h3>
    <p class="family-label">${escapeHtml(risk.processName)} / ${escapeHtml(risk.subProcessName)}</p>
    <p>${escapeHtml(risk.description)}</p>
    <p><strong>Expected control name:</strong> ${escapeHtml(risk.expectedControlName)}</p>
    <p><strong>Sources:</strong> ${escapeHtml(risk.sourcesAndReferences)}</p>`;
}

function renderLoadError(error) {
  const message = `Could not load demo data: ${error.message}. Start the demo with npm start and open http://127.0.0.1:8080/ instead of opening index.html directly.`;
  const html = `<p class="boundary">${escapeHtml(message)}</p>`;
  for (const selector of ['#results', '#universe-results', '#honeycomb']) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    }
  }
}

async function loadDemo() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`data request returned ${response.status}`);
  }
  const data = await response.json();
  document.querySelector('#risk-count').textContent = String(data.risks.length);
  document.querySelector('#universe-visible-count').textContent = String(data.risks.length);
  renderFamilyOptions(data.risks);
  renderUniverse(data.risks);
  renderResults(data.risks);

  for (const selector of ['#risk-search', '#family-filter']) {
    document.querySelector(selector).addEventListener('input', () => renderUniverse(data.risks));
  }
  for (const selector of ['#audit-context', '#main-concern', '#lifecycle-stage']) {
    document.querySelector(selector).addEventListener('input', () => renderResults(data.risks));
  }
  document.querySelector('#demo-form').addEventListener('submit', (event) => {
    event.preventDefault();
    renderResults(data.risks);
  });
}

if (typeof document !== 'undefined') {
  loadDemo().catch(renderLoadError);
}
