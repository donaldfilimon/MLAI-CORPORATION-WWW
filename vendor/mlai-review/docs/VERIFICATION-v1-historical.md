# Historical v1 record — not v2 verification

# MLAI website review — verification record

Verified September 7, 2026 in an isolated authoring container. This record distinguishes executed review checks from unverified framework and deployment work.

## Delivered

17 authored routes plus one 404 view; four project detail pages; eight source-based docs; a local evidence ledger, theme control and brief composer. The self-contained HTML is approximately 250 KB and makes no external network requests during the browser sequence. The ZIP also includes the typed Next.js/React source candidate, generated MDX, content model, scripts and tests.

## Executed checks

| Check | Result | Scope |
| --- | --- | --- |
| Node contract suite | 12/12 passed | Content, sources, routes, search, filters, review serialization |
| TypeScript core check | Passed | Strict type checking of content.ts, search.ts and interactions.ts |
| TS/TSX syntax checks | 22 files; no syntax errors | Transpilation only, not framework type resolution |
| MDX generation | 8 documents generated | Does not compile or execute Fumadocs |
| Independent review export | 18 views rendered | Review-only TSX serializer; not ReactDOM or Next.js |
| Browser review | 25 check groups passed | Chromium 144.0.7559.96 |
| Responsive route sweep | Passed | All 18 views at 360, 390, 768 and 1440 px; one visible H1, no page-level horizontal overflow |
| HTTP serving | Passed | 17 page routes returned 200; 2 unknown paths returned the designed 404 |
| Runtime console | No page errors | Complete browser interaction sequence |
| External requests | None | Generated review interactions; external source links were not followed |

## Browser method

The Browser plugin was not exposed in this session. Playwright used installed Chromium. Managed-browser policy rejected localhost navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; no policy was changed. The exported standalone HTML was loaded through `page.set_content`, and its actual hash-route navigation and JavaScript were exercised. The loopback HTTP server was separately checked using local HTTP requests. This does not establish successful browser navigation to a hosted deployment or literal file:// loading in every browser.

Clipboard outcomes were intentionally mocked: success copied the exact source text, and a rejected write selected the actual text and announced the failure. The project-brief Markdown download was actually downloaded and its content and filename checked. Browser-local preference persistence across sessions was not tested under a normal origin; state across review routes and graceful storage denial were exercised.

## Browser checks

1. Home identity, meaningful content, and a single primary heading.
2. Architecture diagram nodes do not overlap at four viewport widths.
3. All 18 views: single visible H1 and no page overflow at 360/390/768/1440px.
4. Project filters compose with search, update URL/counts, and reset the empty state.
5. Direct project query URL restores search and category state.
6. Home topic switching updates content and opens the correct guide.
7. Ctrl+K → body-text search → Enter opens a real guide and closes search.
8. Search arrows, suggestions, literal untrusted input, empty results, Escape and focus return.
9. Search dialog contains keyboard focus while modal.
10. Evidence filter changes real table rows and accurate counts.
11. Code copy exact text with mocked success; denied permission selects actual code and reports failure.
12. Documentation TOC deep link lands below the sticky header.
13. Transient clipboard feedback is cleared on navigation.
14. Theme changes remain readable and persist across review routes even with storage unavailable.
15. Mobile menu Escape/focus, navigation closure, and desktop-breakpoint cleanup.
16. Mobile documentation disclosure opens and navigates to the selected guide.
17. Local brief validation, escaped user content, generated summary and success focus.
18. Brief copies exact text and downloads a real Markdown file with a sanitized filename.
19. Editing preserves the in-memory draft.
20. Search shortcut does not hijack form input.
21. Unknown routes have a usable 404 recovery path.
22. Reduced-motion preference removes smooth scrolling and transition dependence.
23. All internal page links and section anchors resolve in rendered views.
24. No JavaScript runtime errors during the complete interaction sequence.
25. No external network requests from the review site.

## Visual review and fixes

Inspected the desktop and mobile home layouts, docs layout, search modal and dark theme. Repaired an overlap between the ABI and WDBX diagram links. Added explicit modal Tab wrapping after native Chromium dialog focus moved temporarily to browser chrome. Corrected transient clipboard feedback that remained visible after route cleanup canceled its dismissal timer; the final suite contains a regression assertion for this case.

The design is code-native. No user-approved generated-image concept or image-fidelity score is claimed. Primary brand/text, source links, input fields, buttons, diagrams and article content remain rendered elements rather than UI screenshots.

## Not verified / not performed

- npm/Bun dependency installation, a resolved lockfile, dependency/security audit or CI execution.
- Full React/Next.js TypeScript resolution, Next production build, server rendering/hydration, StrictMode behavior in React, or the headless Fumadocs macro and MDX body compilation.
- Integration with the existing Next.js 15 platform, private console, APIs, authentication, cloud runtime, mobile companion, or Quasar.
- Safari/Firefox coverage, automated axe scan, screen-reader review, WCAG certification, Lighthouse scores or production performance measurement.
- Production-domain routing, canonical/sitemap origin, external-link uptime, DNS, Sites publication, Vercel/Cloud Run deployment or rollback acceptance.
- ABI/Gama runtime builds, upstream test reproduction, AI quality, vector-database behavior, native acceleration or any backend security/performance claim.

The selected Sites/Build Web Page plugin could not be invoked as an editing action after discovery attempts. This deliverable is a local review and source package, not a claimed live Sites project. No existing repository, user device, account, domain, deployment or production resource was modified.

## Reproduction

From the source directory: `node --test tests/contracts.cjs`; `node scripts/check-syntax.cjs`; `node scripts/generate-mdx.cjs`; `node scripts/build-preview.cjs`; `tsc --noEmit --strict --target ES2022 --module commonjs --lib ES2022,DOM lib/search.ts lib/content.ts lib/interactions.ts`; `node --check preview/review.js`; `QA_OUTPUT=/tmp/mlai-review-qa python tests/browser_review.py`.

The exporter/contracts require TypeScript. The browser checks require Python Playwright and Chromium. The already-built HTML and the loopback review server need neither package installation nor a framework build.
