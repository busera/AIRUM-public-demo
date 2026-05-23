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
  read('explore/data/demo-risk-universe.json'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

const htmlText = [
  read('index.html'),
  read('explore/index.html'),
  read('examples/reduced-discovery-working-paper.html'),
].join('\n');

const cssText = [
  read('index.html'),
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

test('public files do not disclose exact full internal AIRUM universe counts', () => {
  assert.doesNotMatch(publicText, /full AIRUM[^.]{0,160}\b\d+\s+source-backed AI Risks/i);
  assert.doesNotMatch(publicText, /complete AIRUM[^.]{0,160}\b\d+\s+source-backed AI Risks/i);
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

test('interactive navigation and disclosure controls meet minimum touch target sizing', () => {
  assert.match(cssText, /\.demo-nav\s+a\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /summary\s*\{[^}]*min-height\s*:\s*44px/is);
  assert.match(cssText, /\.button\s*\{[^}]*min-height\s*:\s*44px/is);
});

test('AIRUM design context files exist for future design passes', () => {
  assert.ok(existsSync(new URL('PRODUCT.md', repoRoot)), 'PRODUCT.md missing');
  assert.ok(existsSync(new URL('DESIGN.md', repoRoot)), 'DESIGN.md missing');
});
