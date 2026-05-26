# AIRUM QH-5 Public Demo Sync Report

Date: 2026-05-26
Status: PASS WITH CAVEATS

## Scope

This QH-5 pass checked whether the reduced public demo needed updates after the private AIRUM v3.2 quality-hardening tasks QH-1 through QH-4.

Checked public demo surfaces:

- `README.md`
- `PRODUCT.md`
- `index.html`
- `explore/index.html`
- `explore/control-info.html`
- `explore/sampling-methodology.html`
- `explore/data/demo-risk-universe.json`
- `explore/js/app.js`
- `explore/js/controlInfo.js`
- `explore/js/samplingMethodology.js`
- `tests/public-demo-boundary-check.mjs`

## Decision

No public demo data, product copy, or visible version label update is required for this pass.

Reason:

- The public demo is already aligned to the approved AIRUM v3.2 public baseline: 67 private AI Risks, 75 private consolidated controls, 212 private risk-control mappings, and a reduced public subset of 10 risks / 25 controls / 30 mappings.
- QH-1 through QH-3 hardening changed private provenance metadata, source-registry rationale, runtime control-catalog provenance quality, and private review reports. Those changes do not create a public-safe demo data change beyond the already published v3.2 counts.
- QH-4 introduced and re-reviewed the automated guardrail validator surface. The live private validator now catches both `source_url=` and `url:` source-reference summary syntax and passed its current guardrail suite. This report still avoids an uncaveated public release claim because QH-1 through QH-3 intentionally left broader source-extract/support-rationale caveats unresolved.
- The public demo intentionally does not mirror private workbook `URL Sources` verbatim. It redacts licensed/private source URLs and keeps reduced-demo public fallback wording. Raw equality to the private workbook would be a boundary failure, not a sync objective.

## Comparison evidence

Private baseline checked:

- Workbook risk rows: 67
- Runtime controls: 75
- Runtime risk-control mappings: 212

Public demo baseline checked:

- Reduced risks: 10
- Reduced applicable controls: 25
- Reduced risk-control mappings: 30

The reduced public risks still map to existing private workbook `Risk ID` values and their public applicable-control IDs still exist in the private runtime catalog and runtime mapping set.

Expected public/private differences were limited to `urlSourcesRaw` redactions for the 10 public risks:

- `risk-ai-ambition-feasibility-mismatch`
- `risk-lack-of-clear-accountability`
- `risk-missing-ai-inventory`
- `risk-sensitive-data-disclosure-and-inference`
- `risk-inadequate-verification-and-validation`
- `risk-prompt-injection-and-input-manipulation`
- `risk-inadequate-or-missing-ai-governance-framework`
- `risk-ai-supply-chain-and-third-party-risk`
- `risk-metadata-and-lineage-management-failure`
- `risk-hallucinations-confabulation`

These differences are intentional: public demo source text must not expose licensed source URLs, private locators, local source extracts, internal methodology chains, or private retrieval metadata.

## Files changed by QH-5

- Added `docs/airum-qh5-public-demo-sync-2026-05-26.md`.

No public runtime/demo data files were changed.

## Verification run

Completed in this QH-5 closeout:

- Private/public comparison script: PASS; 67 private workbook risks, 75 private runtime controls, 212 private risk-control mappings, 10 public risks, 25 public controls, 30 public mappings, and 10 expected URL-source redactions.
- Private QH-4 guardrail validation: `npm run validate:qh-guardrails --silent`: PASS; 688 source refs, 187 local/private-locator justifications, 73 caveated mappings, 67 risk reports, 0 private-marker hits.
- `node --check explore/js/app.js`: PASS
- `node --check explore/js/controlInfo.js`: PASS
- `node --check explore/js/samplingMethodology.js`: PASS
- `node --check tests/public-demo-boundary-check.mjs`: PASS
- `npm test`: PASS, 13/13 Node tests passed
- `git diff --check`: PASS
- private-marker leakage scan across public-demo text surfaces, excluding the boundary-test fixture itself: PASS, 0 hits

## Caveats

- PASS WITH CAVEATS remains the correct release language. QH-1 through QH-3 improved provenance and report quality, but they did not reread all remaining source-extract/support-rationale caveats.
- QH-4 guardrail validation is no longer treated as a blocker in this sync assessment: the live private validator catches both equals-style and colon-style source-reference URL summaries and passed the current private guardrail suite.
- This report does not publish private validation locators, licensed source links, local path details, temp path details, private source-location fields, or methodology-chain internals.
