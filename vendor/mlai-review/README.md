# MLAI marketing and documentation — v2

A focused improvement of the existing review, not another replacement website. The original white/violet design, “Intelligence, with integrity.” homepage, 17 content routes and 404 are retained.

## Open it

Open **`MLAI-preview.html`** in a browser. It is a self-contained interactive review with embedded content, styles, local search and hash navigation. No package installation, model API or account is required. Attachment viewers may disable JavaScript; open the actual HTML file.

For ordinary local paths, run:

```sh
node scripts/serve-preview.cjs
```

The read-only review server binds `http://127.0.0.1:4173`. `PORT` changes the port. It is not a production server or public deployment. It rejects write methods and will not serve arbitrary source/configuration files.

## What improved

- **Contextual search:** matching passages, safe term highlighting, exact-section links, accent-insensitive matching, multi-word queries and accurate result totals. Keyboard navigation uses active-result semantics.
- **Reading tools:** estimated reading time, progress, active section, mobile contents, Copy Markdown, Download Markdown and print styling. Exported articles include actual code and source references. Clipboard denial reveals selectable text.
- **Evidence filtering:** search and type filters work together and are represented in the URL, with real counts, empty states and reset.
- **Safer briefs:** no-JavaScript controls stay disabled; validation checks limits; draft state survives portable review navigation in memory; exports escape embedded HTML. Nothing is submitted. Reloading/closing clears draft memory—download or copy first.
- **Theme and keyboard controls:** explicit light/dark/system choice, OS changes in system mode, graceful denied storage, and arrow/Home/End guide tabs.
- **Maintainability:** focused cleanup-safe enhancement modules replace a large interactions file. Observer/timer/listener lifetimes and repeated initialization are tested.
- **Release checks:** an honest dependency/lockfile preflight, missing MDX typings declaration, local-server method/header tests and repeatable review checks. No lockfile or framework success is fabricated.

## Two different execution paths

**Portable review (tested):** the review exporter renders shared TSX through a small independent serializer, then enhances it using native browser scripts. It is not ReactDOM and does not test Next rendering or hydration.

**Framework source (still unverified):** `app/` contains Next.js App Router routes; React TSX components, Tailwind CSS and the headless Fumadocs macro/MDX integration are provided. Dependency installation is blocked in the authoring environment. A working review is not proof that this framework build passes.

This source does not claim installed shadcn/Base UI, Fumadocs UI or Motion packages. It preserves the original native-control approach rather than adding unused dependencies. Follow the existing production application’s conventions when integrating selected changes.

## File organisation

| Location | Responsibility |
| --- | --- |
| `lib/content.ts` | Canonical project, article, source and evidence records |
| `lib/search.ts` | Search ranking, excerpts, Unicode matching and safe highlighting |
| `lib/reading.ts` | Reading estimates and canonical Markdown export |
| `lib/dom.ts` | Abortable listeners, timers, clipboard/download helpers |
| `lib/chrome-ui.ts` | Theme, modal/mobile navigation and topic tabs |
| `lib/search-ui.ts` | Search-dialog rendering and keyboard state |
| `lib/filter-ui.ts` | Project/evidence filters and URL state |
| `lib/reading-ui.ts` | Progress, TOC, export and print interactions |
| `lib/brief-ui.ts` | In-memory brief validation, state and export |
| `lib/interactions.ts` | Idempotent enhancement lifetime orchestration |
| `components/`, `app/` | Shared TSX views and Next source |
| `content/docs/` | Generated MDX; edit canonical records, not duplicated prose |
| `scripts/` | Export, syntax/link checks, read-only server and framework preflight |
| `tests/` | Content, regression, HTTP and browser tests |
| `preview/` | Already generated static site |

## Verification commands

With TypeScript installed (or the recognised authoring installation available):

```sh
npm run check:review
```

This strictly checks ten framework-independent TypeScript modules, syntax-checks the TSX source, generates MDX, exports the review, runs 32 Node tests and inspects local links/assets. MDX generation is not MDX compilation.

Browser checks require Python Playwright and an installed Chromium:

```sh
QA_OUTPUT=/tmp/mlai-regression python tests/browser_review.py
QA_OUTPUT=/tmp/mlai-improvements python tests/improvements_browser.py
```

Both scripts support `CHROMIUM_PATH`. The improvements suite attempts loopback browser navigation and records its outcome, then tests the portable document in memory. Clipboard and print calls are controlled substitutes; Markdown downloads are real. No browser policy is changed.

For the framework, use a network-enabled isolated checkout, inspect the inherited dependency pins, install compatible dependencies and review the real lockfile, then:

```sh
npm run check:framework
```

The preflight refuses to call a preview export a framework build. After dependencies and a real lockfile are present, this runs framework-aware type checks and `next build`. No dependency/security audit or hosted CI execution has been completed in this package.

## Results and provenance

See `docs/VERIFICATION.md` for current v2 results and limitations, `CHANGELOG.md` for the targeted change list, and `docs/VERIFICATION-v1-historical.md` for the preserved original record. New results are 32 Node tests, 25 inherited browser groups and 22 new browser groups, a 90-case responsive sweep, and zero errors from the local link checker. These are review checks, not backend capability tests or a certification.

The current package derives from `MLAI-website-source.zip`; its SHA-256 is recorded in the verification notes. Project facts and source-review dates are inherited from that package and were not re-audited during this improvement pass.

## Existing-platform boundary

The existing MLAI/Quesar repository and deployment are untouched. This package does not recreate its private console, connect an AI model/database, collect leads or publish a site. Read `docs/INTEGRATION.md` before transferring changes. The preview remains noindex; no production origin or domain is guessed.
