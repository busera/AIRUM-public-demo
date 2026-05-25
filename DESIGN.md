# AIRUM Public Demo Design Context

## Design intent

The visual system should feel like audit preparation: structured, calm, evidence-led, and reviewable. Avoid startup gloss, AI hype, and dense enterprise-dashboard sameness.

## Principles

1. Boundary first
   - State the reduced public-demo boundary before detailed methodology claims.
   - Do not bury public-limit language at the bottom of the page.

2. Practitioner artifact over marketing page
   - Prefer method sequences, working-paper metaphors, and reviewable evidence blocks.
   - Avoid too many identical cards in a row.
   - Use cards for actual records or focused decision blocks, not every paragraph.

3. Clarity over ornament
   - Keep the deep blue trust palette.
   - Use whitespace and type rhythm to separate concept, method, and output.
   - Use visual structure to show audit flow: context -> candidate risks -> challenge -> discovery pack.

4. Publication boundary specificity
   - The visible demo can show the reduced subset count and approved high-level v3.2 counts where needed.
   - It must not disclose local file paths, private source captures, unpublished row artifacts, or detailed internal methodology mechanics.
   - Images should be checked for embedded text before publication.

5. Accessible interaction
   - Links, buttons, selectors, and disclosure summaries need minimum 44px touch targets.
   - Narrow screens should stack controls and avoid horizontal dependence where possible.
   - Avoid adding extra top-level selectors unless they drive a clear user decision; keep sector/AU context inside the Risk Scoping workflow rather than the main explorer filter bar.
   - Keyboard focus must remain visible and logical.

## Current accepted exceptions

- Deep blue remains the trust anchor.
- System fonts remain acceptable for maintenance simplicity.
- Cards remain acceptable for risk records and working-paper details.
- Long export page is acceptable because it demonstrates output shape.

## Design QA checklist before publication

- No local file paths, private source captures, unpublished row artifacts, or unapproved detailed methodology mechanics in public page copy, image text, alt text, or public file names.
- Public boundary visible near the top of each public entry point.
- Mobile layout reviewed at 390px and 768px widths.
- Touch targets checked for nav links, buttons, selects, search inputs, and details summaries.
- Card density reviewed: repeated cards must represent records or a deliberately scannable sequence.
- Console has no runtime errors.
- All local tests pass with `node --test tests/public-demo-boundary-check.mjs`.
