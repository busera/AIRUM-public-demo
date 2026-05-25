import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const repoRoot = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, repoRoot), 'utf8');

const publicText = [
  read('README.md'),
  read('index.html'),
  read('explore/index.html'),
  read('explore/control-info.html'),
  read('explore/sampling-methodology.html'),
  read('explore/data/demo-risk-universe.json'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

const htmlText = [
  read('index.html'),
  read('explore/index.html'),
  read('explore/control-info.html'),
  read('explore/sampling-methodology.html'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

const cssText = [
  read('index.html'),
  read('explore/index.html'),
  read('explore/control-info.html'),
  read('explore/sampling-methodology.html'),
  read('explore/css/styles.css'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

function walk(relativePath = '.') {
  const absolutePath = new URL(relativePath, repoRoot).pathname;
  return readdirSync(absolutePath).flatMap((entry) => {
    if (entry === '.git') return [];
    const childRelative = relativePath === '.' ? entry : join(relativePath, entry);
    const childAbsolute = new URL(childRelative, repoRoot).pathname;
    return statSync(childAbsolute).isDirectory() ? walk(childRelative) : [childRelative];
  });
}

test('public files disclose only the approved v3.2 public count, not internal file paths or unpublished row artifacts', () => {
  assert.match(publicText, /complete AIRUM v3\.2 risk universe contains 67 source-backed AI Risks/i);
  assert.doesNotMatch(publicText, /\b\d+[-\s]?row AIRUM Risk Universe/i);
  assert.doesNotMatch(publicText, /\b\d+ AI Risks across \d+ families/i);

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
  assert.match(intro, /Reduced public demo/i);
  assert.match(intro, /No private audit material/i);
  assert.match(intro, /does not publish the full AIRUM methodology/i);
});

test('reduced risk data includes structured audit procedure planning fields and applicable controls', () => {
  const data = JSON.parse(read('explore/data/demo-risk-universe.json'));
  assert.equal(data.riskUniverse.documentedCount, 10);
  assert.equal(data.riskUniverse.applicableControlCount, 25);
  assert.equal(data.riskUniverse.riskControlMappingCount, 30);
  assert.ok(Array.isArray(data.controls), 'controls collection missing');
  assert.ok(Array.isArray(data.riskControlMappings), 'risk-control mapping collection missing');
  const controlsById = new Map(data.controls.map((control) => [control.controlId, control]));
  const sourceLocatorPattern = /\b(Gartner|ISO\/IEC|NIST|ISACA|AAIA|OWASP|MITRE|EU AI Act|Hiroshima)\b/i;
  for (const risk of data.risks) {
    assert.match(risk.auditProcedureName, /^(Evaluate|Review|Validate|Test|Examine|Analyze)\b/);
    assert.doesNotMatch(risk.auditProcedureDescription, /Assess whether the organization has designed|Assess whether the organization has defined/i);
    assert.notEqual(risk.auditProcedureDescription.trim(), '');
    assert.match(risk.testOfDesign, /Overall test objective\/purpose:[\s\S]*Detailed Test Steps:[\s\S]*Recommended Artifacts:/);
    assert.match(risk.testOfEffectiveness, /Overall test objective\/purpose:[\s\S]*Recommended Sampling Strategy:[\s\S]*Recommended Sample Size:[\s\S]*Detailed Test Steps:[\s\S]*Recommended Artifacts:/);
    assert.ok(risk.applicableControlIds.length >= 1, `${risk.id} has no applicable controls`);
    for (const controlId of risk.applicableControlIds) {
      assert.ok(controlsById.has(controlId), `${risk.id} references missing control ${controlId}`);
    }
  }
  for (const control of data.controls) {
    assert.match(control.auditProcedure.auditProcedureName, /^(Evaluate|Review|Validate|Test|Examine|Analyze|Trace)\b/);
    assert.ok(Array.isArray(control.auditProcedure.testOfDesign.detailedTestSteps));
    assert.ok(Array.isArray(control.auditProcedure.testOfEffectiveness.detailedTestSteps));
    assert.doesNotMatch(control.auditProcedure.testOfDesign.detailedTestSteps.join('\n'), sourceLocatorPattern);
    assert.doesNotMatch(control.auditProcedure.testOfEffectiveness.detailedTestSteps.join('\n'), sourceLocatorPattern);
  }
});

test('interactive navigation and disclosure controls meet minimum touch target sizing', () => {
  assert.match(cssText, /\.demo-nav\s+a\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /summary\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /\.button\s*\{[^}]*min-height\s*:\s*44px/is);
});

test('browse risk examples renders one risk per row', () => {
  const exploreHtml = read('explore/index.html');
  const styles = read('explore/css/styles.css');
  assert.match(exploreHtml, /styles\.css\?v=20260525-numbered-test-steps/);
  assert.match(exploreHtml, /app\.js\?v=20260525-numbered-test-steps/);
  assert.match(styles, /\.universe-grid\s*\{[^}]*grid-template-columns\s*:\s*1fr\s*;/is);
  assert.doesNotMatch(styles, /\.universe-grid\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/is);
});

test('browse risk examples keeps risk audit guidance collapsed with spaced procedure subsections', () => {
  const exploreJs = read('explore/js/app.js');
  const styles = read('explore/css/styles.css');
  assert.match(exploreJs, /<details class="audit-procedure-box audit-procedure-summary">[\s\S]*<summary>Audit Procedure<\/summary>/);
  assert.match(exploreJs, /<details class="audit-procedure-box audit-procedure-tod">[\s\S]*<summary>Test of Design \(ToD\)<\/summary>/);
  assert.match(exploreJs, /<details class="audit-procedure-box audit-procedure-toe">[\s\S]*<summary>Test of Effectiveness \(ToE\)<\/summary>/);
  assert.doesNotMatch(exploreJs, /<details class="audit-procedure-box audit-procedure-(summary|tod|toe)"\s+open/);
  assert.match(exploreJs, /audit-procedure-section-break/);
  assert.match(exploreJs, /<ol class=\"audit-procedure-numbered-list\">/);
  assert.ok(exploreJs.includes("trimmed.replace(/^\\d+\\.\\s*/, '')"));
  assert.match(styles, /\.audit-procedure-section-break\s*\{[^}]*margin-top\s*:\s*0\.9rem\s*;/is);
  assert.match(styles, /\.audit-procedure-numbered-list\s*\{[^}]*list-style-position|\.audit-procedure-numbered-list\s*\{/is);
  assert.match(styles, /\.audit-procedure-box\s+summary\s*\{[^}]*font-weight\s*:\s*850\s*;/is);
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
  assert.match(controlJs, /Open sampling methodology matrix/);
  assert.match(samplingHtml, /Sampling Methodology Matrix/);
  assert.match(samplingJs, /Frequency and Risk Matrix/);
});

test('AIRUM design context files exist for future design passes', () => {
  assert.ok(existsSync(new URL('PRODUCT.md', repoRoot)), 'PRODUCT.md missing');
  assert.ok(existsSync(new URL('DESIGN.md', repoRoot)), 'DESIGN.md missing');
});
