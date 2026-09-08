# Unpublished Research candidate

Canonical exporter revision: `2718e0cc61dfa969cb7d30ade1af1fd826652b22`.
The published Site remains version 2; no new version was saved or published.

The candidate contains the same reviewed 21 publications, seven implementation
studies and four PDFs as the previous snapshot. The independent application's
`research-completion-final-parity.json` records semantic research parity and exact
study/PDF bytes while keeping the historical publication revision separate.

## Verification

- Canonical source: 364 tests and a 104-page production build passed before the
  narrow legacy-tag follow-up; the final follow-up passed lint and six focused
  discovery/export tests.
- Packaging: 11 tests passed, including missing/extra files, corrupted bytes,
  dirty provenance and symlink rejection. Packaging verifies and copies bytes;
  it cannot repair hashes or reintroduce the retired filter controller.
- `browser.json` records nine passing Chromium/Firefox/WebKit runs at 390, 768,
  and 1440 pixels, bound to the exported manifest and browser harness hashes.
  Checks include multi-area discovery, URL history/reload, combined and invalid
  filters, visible legacy tags, keyboard recovery, contents links, long input,
  equation focus, reduced motion, JavaScript-disabled links and PDF integrity.
- Screenshots in this directory were inspected at mobile and desktop widths.
- Computed rendered solid-background text contrast passed on the collection and
  representative article, with minimum measured ratio 7.85:1. Gradient/opacity
  layers, placeholders, borders and pseudo-elements are not certified by that check.

Actual browser zoom at 200%/400% and VoiceOver remain unverified for this Site.
Narrow viewport and accessibility-tree checks are not substitutes. These manual
acceptance gaps block publication readiness, even though automated checks pass.

## Reproduction and rollback

Run `bun run check`, then provide an existing Playwright installation using
`MLAI_PLAYWRIGHT_ROOT=/absolute/project node scripts/verify-browser.mjs`.
The browser harness binds its own ephemeral loopback port and closes it afterward.
It requires installed Chromium, Firefox and WebKit binaries; missing engines fail.

The previous generated source is retained at local commit `842f3a5`; the active
published Site version 2 is unchanged. A separate operator-approved publication
must save and deploy the exact reviewed candidate through Sites, retaining version
2 for rollback. Do not push the canonical MLAI deployment branch as part of source
backup: that is a separate public-rollout action.
