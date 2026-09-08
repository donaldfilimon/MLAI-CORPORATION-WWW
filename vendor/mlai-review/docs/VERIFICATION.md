# MLAI v2 — improvements and verification

Verified September 7, 2026. This is a focused update to the last delivered `MLAI-website-source.zip`, not a new design or a production rollout.

## Exact starting point

- Baseline archive: `MLAI-website-source.zip`.
- Baseline SHA-256: `961ec1d2559132d5fed72f5a8e13508aecc753c06ab9488a1d6951bc2fb3db96`.
- Source directory: `mlai-review/`.
- Retained scope: 17 content routes and one 404 view; four projects; eight documentation pages including the overview.
- Retained identity: original white/graphite/violet styling and “Intelligence, with integrity.” homepage. Project descriptions and their historical source-review dates were not re-audited.

## User-visible improvements

1. **Search that explains its matches.** Search now normalizes indexed text and queries together, supports unordered multi-word project queries, displays contextual excerpts with safe highlighted matches, and links body/code/heading matches directly to their section. Visible result limits and total results are distinct. Keyboard selection is exposed through combobox/listbox and active-descendant semantics.
2. **A useful article toolbar.** Documentation now has estimated reading time (220 words per minute), scroll-based reading progress, active-section indication, a mobile table of contents, whole-article Markdown copy/download including code and sources, permission-denied manual copying, and a print stylesheet. Heading-only navigation preserves the current article DOM.
3. **Shareable evidence views.** Evidence text search and type filters compose, preserve query state in the URL, restore on navigation, report actual counts, and have reset and no-results states.
4. **Resilient local briefs.** Fields are disabled in server HTML until the submit handler is attached. Length validation also checks programmatic values. Character counters update from actual text. Drafts and prepared state survive navigation inside the portable review in document memory only; full reload/closing loses that memory. Markdown exports escape embedded HTML and use safe filenames. Nothing is submitted.
5. **Better controls and lifecycle handling.** Light/dark/system preferences behave consistently when storage is denied, and system mode follows OS changes. Guide tabs support arrow/Home/End keys. Event handlers, observers and timers have abortable, idempotent cleanup; repeated initialization and stale cleanup do not duplicate or remove active handlers.
6. **Stricter verification boundaries.** Added missing MDX type dependency declaration, a framework dependency/lockfile preflight, repeatable review checks, and read-only local-server tests. The loopback server rejects writes, blocks form submissions with CSP, and uses explicit content/script and response headers. These are verified local behaviours, not a production security certification.

## Executed checks

| Gate | Result | Scope |
| --- | --- | --- |
| Baseline Node suite before changes | 12 passed | Existing content/render/search contracts |
| New regression tests before implementation | 19 failed as expected | Captured missing feature behaviour |
| Final Node suite | **32 passed, 0 failed** | 12 inherited + 19 new tests + one real HTTP test group |
| Strict core TypeScript | **Passed** | 10 content/search/reading/enhancement modules; not Next/React dependency resolution |
| Syntax/transpilation | **29 TS/TSX files; 0 syntax errors** | Syntax only for framework-dependent files |
| MDX generation | **8 documents generated** | Generation, not MDX compilation |
| Review exporter | **18 views; 342,435 bytes portable HTML** | Independent review-only TSX serializer, not ReactDOM/Next |
| Original browser suite | **25 groups passed** | Existing behaviours preserved; intentional Markdown escaping expectation updated |
| New browser suite | **22 groups passed** | New search, reading, brief, theme, filter, lifecycle and failure paths |
| Responsive new-suite sweep | **90 combinations passed** | All 18 views × 360/390/768/1280/1440px; one H1, no page-level horizontal overflow |
| Internal-link inspection | **593 local links; 98 fragment references; 54 asset references; 0 errors** | Fragment references are a subset of local links; external sources not opened |
| Runtime errors/network | **No page exceptions or network requests in portable interaction suites** | Source destinations were not followed |
| Framework preflight | **Blocked, exit 1** | Next/React/Fumadocs packages and real lockfile are absent |
| Registry probe | **Failed: EAI_AGAIN** | `registry.npmjs.org` DNS resolution unavailable; HTTPS resolution probe also timed out |

The HTTP test makes actual requests to five routes, checks HEAD behaviour, rejects POST/PUT/DELETE, checks unknown/private-looking paths and traversal handling, and inspects security headers. It does not certify production hosting.

## Browser evidence and method

Browser: Chromium 144.0.7559.96 with Python Playwright. The Browser plugin is not exposed. A fresh attempt to load the loopback server returned:

```text
Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR at http://127.0.0.1:4197/
```

No browser policy was changed. The unmodified portable HTML was loaded with `page.set_content`; actual rendered DOM, scripts, hash routes and interactions were exercised. HTTP route behaviour was separately tested through real loopback requests. This is not a hosted URL, React hydration, or a Next.js browser test.

**Real operations:** article and brief downloads produced actual files; article bytes matched its canonical Markdown; navigation, filters, search, heading scroll, print-media CSS, no-JavaScript disabled controls, theme media changes, draft continuity and duplicate-init cleanup were exercised.

**Controlled substitutes:** clipboard success and denial used test replacements, as did the `window.print()` call. Print CSS was checked through actual media emulation, but no physical printer or OS print dialog was tested. No unrestricted OS clipboard claim is made.

Two new test-harness mistakes were corrected without altering application behaviour: a function assignment returned from Playwright evaluation caused a print double to run once during setup, and a hard-coded character count was off by one. The no-script text assertion uses text content because Playwright’s visible-text matcher ignores `noscript` elements. The final suites have no failing checks.

## Visual review

Inspected the actual updated desktop and mobile documentation, contextual search dialog, filtered evidence table, dark documentation and the original home layout. Checked five concrete areas: original headline/brand hierarchy retained; toolbar spacing and mobile wrapping; type legibility and code framing; white/violet palette and dark-theme contrast; active section/selection indicators and control alignment. The new mobile contents navigation and toolbar fit at narrow widths; no image-generated redesign or pixel-perfect concept claim is made.

The full screenshot set and final logs are included under `verification/` beside the source folder in the ZIP. Prior v1 results are retained separately as historical evidence and are not counted as new v2 checks.

## Reproduce

The checked-in review already opens without dependencies. To regenerate and verify it, TypeScript must be available locally (the scripts also recognise the authoring environment’s global TypeScript):

```sh
npm run check:review
node --check preview/review.js
node scripts/serve-preview.cjs
```

Python Playwright and a Chromium binary are required for browser checks:

```sh
QA_OUTPUT=/tmp/mlai-v2-regression python tests/browser_review.py
QA_OUTPUT=/tmp/mlai-v2-improvements python tests/improvements_browser.py
```

After a network-enabled install and review of the resulting real lockfile:

```sh
npm run check:framework
```

Bun may run the same project scripts. The CI definition requires a reviewed Bun lockfile and frozen install; it was updated but **not executed** here. Existing dependency version pins were inherited, not re-resolved or declared security-audited. No fabricated lockfile was added.

## Remaining acceptance boundaries

Next/React installation, complete framework-aware type checking, Fumadocs macro/MDX compilation, production build, hydration/StrictMode in React, dependency security audit, hosted performance, Safari/Firefox, screen-reader/axe acceptance, real OS clipboard/print, normal-origin theme persistence, and deployment remain unverified. Browser tests verify the portable review only. This update changes no GitHub repository, external account, domain, server deployment or existing Quesar application.

## Implementation references

- Fumadocs Next.js setup: https://www.fumadocs.dev/docs/mdx/next
- Fumadocs manual installation: https://www.fumadocs.dev/docs/manual-installation/next
- WAI-ARIA combobox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

Consulted for implementation guidance; references do not substitute for the unrun framework build or assistive-technology testing.
