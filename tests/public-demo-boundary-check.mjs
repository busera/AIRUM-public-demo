import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const repoRoot = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, repoRoot), 'utf8');

function walk(relativePath = '.') {
  const absolutePath = new URL(relativePath, repoRoot).pathname;
  return readdirSync(absolutePath).flatMap((entry) => {
    if (entry === '.git') return [];
    const childRelative = relativePath === '.' ? entry : join(relativePath, entry);
    const childAbsolute = new URL(childRelative, repoRoot).pathname;
    return statSync(childAbsolute).isDirectory() ? walk(childRelative) : [childRelative];
  });
}

const publicText = walk()
  .filter((file) => /\.(md|html|js|json|mjs|css|svg|txt)$/i.test(file))
  .map((file) => `${file}\n${read(file)}`)
  .join('\n');

const publicArtifactText = walk()
  .filter((file) => /\.(md|html|js|json|css|svg|txt)$/i.test(file))
  .filter((file) => !file.startsWith('tests/'))
  .map((file) => `${file}\n${read(file)}`)
  .join('\n');

const htmlText = [
  read('index.html'),
  read('explore/index.html'),
  read('explore/control-info.html'),
  read('explore/sampling-methodology.html'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

const approvedOverclaimCaveatPattern = /not source-perfect|not legally validated|not final audit workpaper|does not provide legal advice|does not provide audit assurance|does not publish internal source evidence/i;

const cssText = [
  read('index.html'),
  read('explore/index.html'),
  read('explore/control-info.html'),
  read('explore/sampling-methodology.html'),
  read('explore/css/styles.css'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');


test('public files disclose only the approved v3.2 public count, not internal file paths or unpublished row artifacts', () => {
  assert.match(publicText, /complete AIRUM v3\.2 risk universe contains 67 source-backed AI Risks/i);
  const stalePublicPatterns = [
    /AIRUM v3\.1/i,
    /\bv3\.1\b/i,
    /\b65[-\s]?risk\b/i,
    /\b65 AI Risks\b/i,
    /\b65 risks\b/i,
    /\b206\b[^\n]{0,80}\bmappings?\b/i,
    /\b206 risk-control mappings\b/i,
    /airum-v3\.1-isaca-aaia-2026-05-23/i
  ];
  for (const pattern of stalePublicPatterns) {
    assert.doesNotMatch(publicText, pattern, `stale public AIRUM wording matched ${pattern}`);
  }
  assert.doesNotMatch(publicText, /\b\d+[-\s]?row AIRUM Risk Universe/i);
  assert.doesNotMatch(publicText, /\b\d+ AI Risks across \d+ families/i);
  assert.doesNotMatch(publicArtifactText, /Gartner ID\s+G\d+/i);
  assert.doesNotMatch(publicArtifactText, /licensed Gartner source/i);
  assert.doesNotMatch(publicArtifactText, /internal locator retained/i);
  assert.doesNotMatch(publicArtifactText, /private catalog/i);
  assert.doesNotMatch(publicArtifactText, /gartner\.com\/document-reader/i);
  assert.doesNotMatch(publicArtifactText, /platform\.virdocs\.com/i);
  assert.doesNotMatch(publicArtifactText, /\(internal\)/i);

  const publicFileList = walk().join('\n');
  assert.doesNotMatch(publicFileList, /airum_\d+_row_risk_universe_summary/i);
  assert.doesNotMatch(publicFileList, /v3-1-\d+/i);
});

test('overview exposes the reduced-demo public boundary above the first explanatory card', () => {
  const index = read('index.html');
  const mainStart = index.indexOf('<main');
  const firstWhat = index.indexOf('<h2>What AIRUM is</h2>');
  assert.ok(mainStart > -1, 'overview has a main element');
  assert.ok(firstWhat > mainStart, 'overview has the What AIRUM is section');
  const intro = index.slice(mainStart, firstWhat);
  assert.match(intro, /Reduced AIRUM Public Demo: v3\.2\.1/i);
  assert.match(intro, /No private audit material/i);
  assert.match(intro, /does not publish the full AIRUM methodology/i);
});

test('reduced risk data includes structured audit procedure planning fields and applicable controls', () => {
  const data = JSON.parse(read('explore/data/demo-risk-universe.json'));
  assert.equal(data.riskUniverse.documentedCount, 10);
  assert.equal(data.riskUniverse.applicableControlCount, 10);
  assert.equal(data.riskUniverse.riskControlMappingCount, 10);
  assert.ok(Array.isArray(data.controls), 'controls collection missing');
  assert.ok(Array.isArray(data.riskControlMappings), 'risk-control mapping collection missing');
  const controlsById = new Map(data.controls.map((control) => [control.controlId, control]));
  const sourceFamilyPattern = /\b(Gartner|ISO\/IEC|NIST|ISACA|AAIA|OWASP|MITRE|EU AI Act|Hiroshima)\b/i;
  for (const risk of data.risks) {
    assert.match(risk.auditProcedureName, /^(Evaluate|Review|Validate|Test|Examine|Analyze)\b/);
    assert.doesNotMatch(risk.auditProcedureDescription, /Assess whether the organization has designed|Assess whether the organization has defined/i);
    assert.notEqual(risk.auditProcedureDescription.trim(), '');
    assert.match(risk.testOfDesign, /Overall test objective\/purpose:[\s\S]*Detailed Test Steps:[\s\S]*Recommended Artifacts:/);
    assert.match(risk.testOfEffectiveness, /Overall test objective\/purpose:[\s\S]*Recommended Sampling Strategy:[\s\S]*Recommended Sample Size:[\s\S]*Detailed Test Steps:[\s\S]*Recommended Artifacts:/);
    assert.equal(risk.applicableControlIds.length, 1, `${risk.id} should expose one representative applicable control`);
    for (const controlId of risk.applicableControlIds) {
      assert.ok(controlsById.has(controlId), `${risk.id} references missing control ${controlId}`);
    }
  }
  assert.equal(data.controls.length, 10);
  assert.equal(data.riskControlMappings.length, 10);
  const exposedControlIds = new Set(data.risks.map((risk) => risk.applicableControlIds[0]));
  assert.equal(exposedControlIds.size, 10);
  assert.deepEqual(new Set(data.controls.map((control) => control.controlId)), exposedControlIds);
  for (const mapping of data.riskControlMappings) {
    const risk = data.risks.find((candidate) => candidate.id === mapping.riskId || candidate.originalRiskId === mapping.riskId);
    assert.ok(risk, `mapping references missing risk ${mapping.riskId}`);
    assert.equal(mapping.controlId, risk.applicableControlIds[0], `${risk.id} has non-representative mapping exposed`);
  }

  for (const control of data.controls) {
    assert.match(control.auditProcedure.auditProcedureName, /^(Evaluate|Review|Validate|Test|Examine|Analyze|Trace)\b/);
    assert.ok(Array.isArray(control.auditProcedure.testOfDesign.detailedTestSteps));
    assert.ok(Array.isArray(control.auditProcedure.testOfEffectiveness.detailedTestSteps));
    assert.doesNotMatch(control.auditProcedure.testOfDesign.detailedTestSteps.join('\n'), sourceFamilyPattern);
    assert.doesNotMatch(control.auditProcedure.testOfEffectiveness.detailedTestSteps.join('\n'), sourceFamilyPattern);
  }
});

test('interactive navigation and disclosure controls meet minimum touch target sizing', () => {
  assert.match(cssText, /\.demo-nav\s+a\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /summary\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /\.button\s*\{[^}]*min-height\s*:\s*44px/is);
});

test('every page exposes a symbol-only dark-mode toggle', () => {
  const htmlFiles = [
    'index.html',
    'explore/index.html',
    'explore/control-info.html',
    'explore/sampling-methodology.html',
    'examples/reduced-discovery-working-paper.html',
  ];
  for (const file of htmlFiles) {
    const text = read(file);
    assert.match(text, /<button[^>]+class="theme-toggle"[^>]+aria-label="Toggle dark mode"[^>]*>[☾☀]<\/button>/, `${file} lacks a symbol-only theme toggle`);
    assert.match(text, /theme\.js\?v=20260527-svg-theme-toggle/, `${file} does not load the shared theme toggle script`);
    assert.doesNotMatch(text, /<button[^>]+class="theme-toggle"[^>]*>\s*Dark\s*<\/button>/i, `${file} exposes visible dark-mode text`);
  }

  const themeJs = read('explore/js/theme.js');
  assert.match(themeJs, /localStorage\.setItem\('airum-theme'/);
  assert.match(themeJs, /document\.documentElement\.dataset\.theme = theme/);
  assert.match(themeJs, /const SUN_ICON = '<span class="theme-toggle-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"/);
  assert.match(themeJs, /button\.innerHTML = theme === 'dark' \? SUN_ICON : MOON_ICON/);

  assert.match(cssText, /\.theme-toggle\s*\{[^}]*position\s*:\s*fixed[^}]*top\s*:\s*14px/is);
  assert.match(cssText, /\.theme-toggle\s*\{[^}]*display\s*:\s*inline-flex[^}]*align-items\s*:\s*center[^}]*justify-content\s*:\s*center/is);
  assert.match(cssText, /\.theme-toggle\s*\{[^}]*width\s*:\s*44px[^}]*height\s*:\s*44px[^}]*padding\s*:\s*0/is);
  assert.match(cssText, /\.theme-toggle-symbol\s*\{[^}]*display\s*:\s*inline-flex[^}]*align-items\s*:\s*center[^}]*justify-content\s*:\s*center/is);
  assert.match(cssText, /\.theme-toggle-symbol\s*\{[^}]*width\s*:\s*1\.18em[^}]*height\s*:\s*1\.18em[^}]*line-height\s*:\s*1/is);
  assert.match(cssText, /\.theme-toggle-symbol\s+svg\s*\{[^}]*width\s*:\s*100%[^}]*height\s*:\s*100%/is);
  assert.match(cssText, /\[data-theme="dark"\]/);
});

test('explore header remains readable in dark mode', () => {
  const exploreHtml = read('explore/index.html');
  const styles = read('explore/css/styles.css');
  assert.match(exploreHtml, /styles\.css\?v=20260527-dark-hero-readability/);
  assert.match(styles, /\[data-theme="dark"\]\s+\.hero\s*\{[^}]*color\s*:\s*#ffffff/is);
  assert.match(styles, /\[data-theme="dark"\]\s+\.hero\s+h1\s*\{[^}]*color\s*:\s*#ffffff/is);
  assert.match(styles, /\[data-theme="dark"\]\s+\.hero\s+\.demo-nav\s+a\s*\{[^}]*color\s*:\s*#ffffff/is);
  assert.match(styles, /\[data-theme="dark"\]\s+\.hero\s+\.demo-nav\s+a\[aria-current="page"\]\s*\{[^}]*background\s*:\s*#edf4ff[^}]*color\s*:\s*#102848/is);
});

test('browse risk examples renders one risk per row', () => {
  const exploreHtml = read('explore/index.html');
  const styles = read('explore/css/styles.css');
  assert.match(exploreHtml, /styles\.css\?v=20260527-dark-hero-readability/);
  assert.match(exploreHtml, /app\.js\?v=20260527-risk-detail-simplified/);
  assert.match(exploreHtml, /demo-risk-universe\.json\?v=20260527-representative-controls/);
  assert.match(read('explore/control-info.html'), /controlInfo\.js\?v=20260527-remove-sampling-box/);
  assert.match(read('explore/js/app.js'), /demo-risk-universe\.json\?v=20260527-representative-controls/);
  assert.match(read('explore/js/app.js'), /CONTROL_DETAILS_VERSION = '20260527-representative-controls'/);
  assert.match(read('explore/js/controlInfo.js'), /demo-risk-universe\.json\?v=20260527-representative-controls/);
  assert.match(styles, /\.universe-grid\s*\{[^}]*grid-template-columns\s*:\s*1fr\s*;/is);
  assert.doesNotMatch(styles, /\.universe-grid\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/is);
});

test('explorer AI risk details omit risk-level audit procedure, ToD, and ToE sections', () => {
  const exploreJs = read('explore/js/app.js');
  assert.doesNotMatch(exploreJs, /\$\{auditProcedureSectionsHtml\(risk\)\}/);
  assert.doesNotMatch(exploreJs, /<summary>Audit Procedure<\/summary>/);
  assert.doesNotMatch(exploreJs, /<summary>Test of Design \(ToD\)<\/summary>/);
  assert.doesNotMatch(exploreJs, /<summary>Test of Effectiveness \(ToE\)<\/summary>/);
  assert.doesNotMatch(exploreJs, /function auditProcedureSectionsHtml/);
});

test('applicable control details keep audit procedure, ToD, and ToE sections', () => {
  const controlJs = read('explore/js/controlInfo.js');
  assert.match(controlJs, /<h2>Audit Procedure<\/h2>/);
  assert.match(controlJs, /<h2>Test of Design \(ToD\)<\/h2>/);
  assert.match(controlJs, /<h2>Test of Effectiveness \(ToE\)<\/h2>/);
  assert.match(controlJs, /controlProcedureHtml\(control\.auditProcedure\)/);
});

test('main explorer avoids duplicate Scoping Sector and Scoping AU controls', () => {
  const exploreHtml = read('explore/index.html');
  const exploreJs = read('explore/js/app.js');
  assert.doesNotMatch(exploreHtml, /SCOPING SECTOR|SCOPING AU|Scoping sector|Scoping AU/i);
  assert.doesNotMatch(exploreJs, /scoping-(industry-)?sector|scoping-audit-universe|Scoping AU/i);
  assert.match(read('README.md'), /without separate Scoping Sector or Scoping AU controls/i);
});

test('reduced working paper includes applicable control summary and audit procedure previews', () => {
  const workingPaper = read('examples/reduced-discovery-working-paper.html');
  assert.match(workingPaper, /Reduced AIRUM Public Demo: v3\.2\.1/);
  assert.match(workingPaper, /Control summary/);
  assert.match(workingPaper, /Applicable control audit procedure/);
  assert.match(workingPaper, /Open full Applicable Control Details/);
  assert.match(workingPaper, /\.control-summary-box/);
  assert.match(workingPaper, /\.audit-procedure-preview/);
  assert.equal((workingPaper.match(/<div class="label">Control summary<\/div>/g) || []).length, 10);
  assert.equal((workingPaper.match(/<div class="label">Applicable control audit procedure<\/div>/g) || []).length, 10);
});

test('explore page links applicable controls and sampling methodology detail surfaces', () => {
  const exploreHtml = read('explore/index.html');
  const exploreJs = read('explore/js/app.js');
  const controlHtml = read('explore/control-info.html');
  const controlJs = read('explore/js/controlInfo.js');
  const samplingHtml = read('explore/sampling-methodology.html');
  const samplingJs = read('explore/js/samplingMethodology.js');

  assert.match(exploreHtml, /applicable-control audit procedure planning/i);
  assert.match(exploreHtml, /id="applicable-control-count"/);
  assert.match(exploreHtml, /sampling-methodology\.html/);
  assert.match(exploreJs, /Open Applicable Control Details/);
  assert.match(exploreJs, /control-info\.html\?/);
  assert.doesNotMatch(exploreJs, /Expected-control conversation/);

  assert.match(controlHtml, /Applicable Control Details/);
  assert.match(controlJs, /Test of Design \(ToD\)/);
  assert.match(controlJs, /Test of Effectiveness \(ToE\)/);
  assert.doesNotMatch(controlJs, /function samplingMethodologyNoteHtml/);
  assert.doesNotMatch(controlJs, /Open public demo sampling reference/);
  assert.doesNotMatch(controlJs, /<strong>Sampling Methodology<\/strong>/);
  assert.doesNotMatch(controlJs, /does not prescribe a universal AIRUM sample-size table/);
  assert.match(samplingHtml, /Sampling Methodology Matrix/);
  assert.match(samplingJs, /Frequency and Risk Matrix/);
  assert.match(samplingJs, /Methodology Boundary/);
  assert.match(samplingJs, /internal audit sampling methodology/);
});

test('public demo has npm test entry point', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.scripts.test, 'node --test tests/public-demo-boundary-check.mjs');
});

test('direct detail pages repeat the reduced public boundary', () => {
  const controlInfo = read('explore/js/controlInfo.js');
  const sampling = read('explore/js/samplingMethodology.js');
  assert.match(controlInfo, /Reduced AIRUM Public Demo: v3\.2\.1/);
  assert.match(controlInfo, /No private audit material/);
  assert.match(controlInfo, /does not publish full AIRUM methodology/);
  assert.match(sampling, /Reduced AIRUM Public Demo: v3\.2\.1/);
  assert.match(sampling, /No private audit material/);
  assert.match(sampling, /does not publish full AIRUM methodology/);
});


test('public disclaimer surfaces block overclaim interpretations at point of use', () => {
  assert.match(read('index.html'), /Reduced AIRUM Public Demo: v3\.2\.1/i);
  for (const [file, text] of [
    ['index.html', read('index.html')],
    ['explore/index.html', read('explore/index.html')],
    ['explore/control-info.html', read('explore/control-info.html')],
    ['explore/sampling-methodology.html', read('explore/sampling-methodology.html')],
    ['examples/reduced-discovery-working-paper.html', read('examples/reduced-discovery-working-paper.html')],
  ]) {
    assert.match(text, /Assurance Boundary|Reduced AIRUM Public Demo/i, `${file} lacks a visible boundary box`);
    assert.match(text, /pre-discovery preparation aid/i, `${file} lacks preparation-aid framing`);
    assert.match(text, /does not provide legal advice|legal\/compliance review/i, `${file} lacks legal caveat`);
    assert.match(text, /does not provide audit assurance|not audit assurance/i, `${file} lacks assurance caveat`);
  }

  const dangerousClaims = [
    /\bEvery source and control rationale is fully verified\b/i,
    /\bis source-perfect\b/i,
    /\bis legally validated\b/i,
    /\bReady as final audit workpapers without tailoring\b/i,
    /\bprovides audit assurance\b/i,
    /\bcomplete source mappings\b/i,
    /\bpublishes licensed-source locator\b/i,
  ];
  for (const pattern of dangerousClaims) {
    assert.doesNotMatch(publicArtifactText, pattern, `public artifact has unsafe overclaim wording: ${pattern}`);
  }
  assert.match(publicArtifactText, approvedOverclaimCaveatPattern);
});

test('publication boundary defines private versus public provenance decisions', () => {
  const boundary = read('PUBLICATION_BOUNDARY.md');
  assert.match(boundary, /Public\/private provenance decision table/i);
  assert.match(boundary, /Licensed-source locator[\s\S]*Yes[\s\S]*No/i);
  assert.match(boundary, /Local vault path[\s\S]*Yes[\s\S]*No/i);
  assert.match(boundary, /Source-to-control rationale[\s\S]*Yes[\s\S]*Summary only/i);
  assert.match(boundary, /Legal interpretation[\s\S]*Contextual only[\s\S]*No legal conclusion/i);
});

test('interpret output menu and standalone guide are removed', () => {
  assert.equal(existsSync(new URL('docs/how-to-interpret-airum-output.md', repoRoot)), false);
  assert.doesNotMatch(read('README.md'), /how-to-interpret-airum-output|How to interpret AIRUM output/i);
  assert.doesNotMatch(read('explore/index.html'), /how-to-interpret-airum-output|Interpret output/i);
  assert.match(read('explore/index.html'), /Challenge this output/i);
});

test('back-to-explore hash links are consumed by the explorer', () => {
  const controlInfo = read('explore/js/controlInfo.js');
  const exploreJs = read('explore/js/app.js');
  const styles = read('explore/css/styles.css');
  assert.match(controlInfo, /#\$\{encodeURIComponent\(riskId\)\}/);
  assert.match(exploreJs, /window\.location\.hash/);
  assert.match(exploreJs, /scrollIntoView/);
  assert.match(exploreJs, /hashchange/);
  assert.match(styles, /\.universe-card\.hash-highlight/);
});

test('AIRUM design context files exist for future design passes', () => {
  assert.ok(existsSync(new URL('PRODUCT.md', repoRoot)), 'PRODUCT.md missing');
  assert.ok(existsSync(new URL('DESIGN.md', repoRoot)), 'DESIGN.md missing');
});
