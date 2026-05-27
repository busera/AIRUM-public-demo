# AIRUM Public Demo Boundary Hardening - 2026-05-26

Status: IMPLEMENTED

## Scope

This public-demo patch implements the post-QH disclaimer and interpretation improvements requested after the AIRUM v3.2.1 quality-hardening closeout.

No AIRUM data-core counts changed:

- Private AIRUM baseline remains 67 AI Risks, 75 consolidated controls, and 212 risk-control mappings.
- Public demo remains a reduced public showcase with 10 visible demo risks and one representative applicable control per AI Risk.
- No private workbook, scoring model, source registry, or internal control-catalog semantics changed.

## Implemented improvements

1. Added visible Assurance Boundary boxes to the public overview, Explore page, control detail loading/detail path, sampling methodology path, and example export.
2. Added a v3.2.1 public status line.
3. Added a public/private provenance decision table to `PUBLICATION_BOUNDARY.md`.
4. Added regression tests for disclaimer visibility, banned overclaim wording, private-marker leakage, and boundary coverage.
5. Standardized public-facing wording toward disclosure-safe source labels/source families rather than full source evidence.
6. Added user-facing guidance to explain how AIRUM output should and should not be used.
7. Clarified that source-backed means internal AIRUM provenance support, not source-perfect public validation.
8. Framed legal/regulatory references as risk prompts that require legal/compliance review.
9. Added user-facing Challenge this output guidance on the overview and Explore surfaces.
10. Updated product and roadmap documentation to keep the public boundary operational.

## Public release language

Use:

> Reduced AIRUM Public Demo: v3.2.1 is a public demo and pre-discovery preparation aid. It shows selected risks, representative controls, and summarized source references only. It does not include the full AIRUM data core, methodology, evidence base, scoring logic, or private audit material, and it does not provide legal advice, does not provide audit assurance, source-perfect validation, or final workpapers.

Do not use:

- Full end-to-end verification of every source and control rationale.
- Source-perfect.
- Legally validated.
- Final audit workpapers ready for use without engagement-specific tailoring.

## Verification

Required checks before publication:

- `node --check explore/js/app.js`
- `node --check explore/js/controlInfo.js`
- `node --check explore/js/samplingMethodology.js`
- `node --check tests/public-demo-boundary-check.mjs`
- `npm test`
- private-marker scan for local paths, vault markers, source-data fields, and licensed/private locator leakage
- `git diff --check`
