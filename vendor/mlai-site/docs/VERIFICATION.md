# MLAI review — verification record

Date: September 7, 2026.

## Result and boundary

The independent HTML review passed the executed checks below. The accompanying Next.js/Fumadocs source is an **unbuilt integration candidate**. These are different deliverables and different verification boundaries. No repository was modified, no website was published, and no custom domain was connected.

The review contains 18 routes, nine documentation pages, and a separate 404 page. It renders shared TSX markup using an explicitly review-only serializer, not React. The same browser enhancement module handles interactions in the review and is referenced by the Next client boundary, but this does not establish React hydration or framework correctness.

## Executed checks

| Check | Actual result | Scope |
| --- | --- | --- |
| Node content and logic contracts | 8 passed, 0 failed | Route/anchor uniqueness, source-reference resolution, safe search, project filtering, brief validation and filename handling |
| Browser interaction checks | 17 passed, 0 failed | Actual self-contained review HTML in Chromium 144 |
| Responsive route checks | All 18 routes at 360, 390, 768, 1280 and 1440 pixels | Meaningful content, exactly one H1, no horizontal page overflow |
| Runtime errors | None recorded during the browser suite | Review JavaScript only |
| Source syntax | 20 TypeScript/TSX files; 0 syntax diagnostics | Syntax transpilation, not full dependency type-checking |
| Content generation consistency | All 9 MDX pages match canonical content | Generated text equivalence, not MDX compilation |
| Static link/markup inspection | 703 links inspected; no reported issues | Internal route/anchor resolution, unique IDs, named controls, labels, no-index and safe external-link attributes |
| HTTP review routes | 18 successful route responses and a branded HTTP 404 | Loopback review server, separately checked from browser navigation |

The browser checks exercised page identity, the conceptual project selector, body-text search, suggestions and no-results states, keyboard result navigation, dialog focus containment, Escape and focus restoration, script-like search input, clipboard failure fallback, documentation anchors and adjacent-page links, browser Back, URL-backed project filtering, brief validation and reset, actual brief-file download, theme behavior with denied storage, mobile menu cleanup, reduced motion, and unknown routes.

### Clipboard and download distinctions

Native clipboard failure was observed in the restricted environment and the manual-copy fallback was tested. The success code path used an explicit test adapter to check that the exact intended code or article text reaches the Clipboard API. **Native operating-system clipboard success was not verified.** The project-brief download was a real captured browser download, not a mocked success notification.

### Browser environment

The Browser plugin was not available, so the review used Python Playwright with the installed Chromium 144. Managed Chromium policy blocked ordinary URL navigation, including localhost. No policy was changed. The browser loaded the actual self-contained HTML through `page.set_content()` and exercised its fragment routes and interactions. HTTP route responses were checked independently with Python against the local review server. This is not evidence of a successful browser navigation to a deployed Next application.

## Visual inspection

Desktop, mobile, dark-theme, documentation, and search screenshots were inspected. The visual reference was the written design specification; no separately approved image-generated mockup existed, and no image-to-build fidelity score is claimed.

| Inspected area | Observation |
| --- | --- |
| Copy and hierarchy | The homepage uses “Intelligence, with intention.” and clear project/docs actions; no invented benchmark figures or customer strip. |
| Desktop layout | Open white composition, generous gutters, balanced text and conceptual diagram, and varied section rhythm. |
| Typography | Readable headings and body text; code stays inside its own containers on narrow screens. |
| Palette and identity | White/graphite/green visual system, with a separate violet ABI product accent. |
| Mobile behavior | Navigation collapses, docs become a readable single column, and tested routes do not widen the page. |
| Interaction states | Selected project, filtered/no-results content, focus states, dark mode, and search dialog are visible and functional. |

### Issues reproduced and fixed

1. A theme-control selector also matched the root HTML element in the multi-page review. Controls now use the explicit `data-theme-toggle` attribute.
2. Theme preference was lost between fragment routes when persistent storage was denied. An in-memory preference now preserves the session choice.
3. Keyboard focus could leave the search modal for browser chrome. An explicit wrap loop now keeps Tab and Shift+Tab within the dialog.
4. Escape in a nonempty search field could clear the query without closing the dialog. The modal now handles Escape explicitly and restores trigger focus.

The final browser run included regression checks for each of these fixes.

## Commands actually run

```sh
# TYPESCRIPT_PATH pointed to the compiler already installed in the review environment.
export TYPESCRIPT_PATH=/usr/local/slides_js/node_modules/typescript
node --test tests/contracts.cjs
node scripts/check-source.cjs
node scripts/generate-mdx.cjs --check
node scripts/build-preview.cjs
QA_DIR=/mnt/data/mlai-qa python -u tests/browser.py
```

The tests also work with a normally installed local TypeScript compiler; the environment-specific path is not required for normal package installation. Browser tests require Python Playwright and an available Chromium executable, as described in their script.

## Not executed / remaining gates

- A registry-backed package install, resolved lockfile, dependency compatibility review, or dependency security audit.
- ESLint, complete TypeScript dependency checking, Tailwind production compilation, or actual Fumadocs MDX compilation.
- Next.js production build, server rendering, React hydration, RSC streaming, direct framework route loads, or deployment.
- Native clipboard success, Safari/Firefox, screen-reader testing, automated axe checks, or a formal WCAG conformance audit.
- External-link availability crawling; linked source documents were selectively read, not continuously monitored.
- ABI, Gama, WDBX, or the existing MLAI platform's backend tests and benchmarks.
- A marketing-content merger into canonical source, private-console integration, domain changes, or production rollout.

The npm registry could not be resolved in this environment. The source therefore includes no fabricated lockfile or claim that the chosen dependency combination builds. No shadcn/Base UI, Motion, or Geist installation is claimed; this review uses native HTML controls and system fonts. Read `INTEGRATION.md` before adapting the work to the existing application.

## Evidence supplied

The source ZIP includes a separate `qa-evidence/` folder with the browser result JSON, static result JSON, unit/syntax/content logs, and desktop/mobile/docs/search/dark screenshots. These are evidence for the review, not a substitute for the unexecuted application gates above.
