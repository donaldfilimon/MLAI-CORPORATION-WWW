# MLAI implementation and acceptance ledger

## Published MLAI Research review integration (2026-09-08)

The September 8 published review is now a native application feature. The
existing 21-publication corpus and three local application notes remain intact;
seven source-backed implementation studies have dedicated static Next.js routes,
metadata, sitemap entries, operating boundaries, exact revision evidence and
related-research navigation. The `/research` landing page now follows the live
review's hierarchy of six practical research areas, implementation studies and
the searchable publication collection while using the application's existing
public design system.

The imported `implementation-data.json` is byte-identical to the source export
at `../mlai-research-sites/public/implementation-data.json` (SHA-256
`c9e7b8cb39e88ad6379de3aa022f051adc5914b6c30b50fd3b79991e61abc651`).
`docs/research-merge/published-review-manifest.json` records the clean source
revision `419f08b24753c024c6d40a720ea5a417d8192251`, generation timestamp and
collection counts without replacing the original September 6 source manifest.
Public study pages consume no workspace API or private application data and are
explicitly labeled as source-backed summaries, not generated workspace
interpretation or proof of live deployment.

Focused evidence for this integration:

- `bunx vitest run tests/research.test.ts`: **8 passed**. Covers the exact
  implementation snapshot hash, source revision/digest shape, all static routes
  and sitemap entries, study rendering, research-area/study collection anatomy,
  and the original publication/equation/attachment checks.
- `bunx playwright test tests/e2e/research.spec.ts`: **4 passed**. Covers the
  landing page, search/filter persistence, publication evidence and downloads at
  390, 768 and 1440 pixels, all 21 publication routes, all seven implementation
  routes, the three retained application notes, responsive overflow and the
  unknown-route 404. No page errors or hydration errors were observed in the
  final run.
- `bun run typecheck`: **passed**, including a fresh shared UI ESM/declaration
  build and strict application TypeScript. Concurrent agent-runtime files were
  not modified or staged by this research change.
- `MLAI_DATA_DIR=.data/research-review-check NEXT_DIST_DIR=.next-research-review
  bun run check`: **passed** after serial migration of the isolated database:
  shared UI ESM/declarations, strict TypeScript, **81/81 Vitest tests across eight
  suites**, **26/26 Python parser tests**, and the production Next.js build with
  all static research routes. The generated `tsconfig.json` additions were
  removed after the gate.
- The published reference and application screenshots were inspected at 1440
  pixels, with an additional 390-pixel application inspection. The final
  application render preserves the accepted copy and three-section order,
  presents all six research areas and seven studies, uses the existing MLAI
  navigation and accent system, and collapses cleanly to one column on mobile.

No deployment, external access, workspace authorization, model-provider or
private-data setting was changed. This section does not claim release
activation.

Combined application and shared UI release verified on 2026-09-06. The independent repository contains the public website, authenticated Abbey workspace, developer console, and customer/staff portal. Application records and private files persist locally. Billing, public deployment, domain changes, external email, and changes to sibling repositories are outside this release.

## Delivery gates

- [x] Foundation: Node/Next.js App Router, React, strict TypeScript, Tailwind, Bun lockfile, SQLite WAL and Drizzle migrations, Better Auth, workspace memberships, private storage, web/worker launcher.
- [x] Website: technical/editorial home, platform, ABI/WDBX/Abbey, architecture, searchable documentation, API reference, integration guides, research articles, company/services/investors/contact/privacy/terms/processing. Contact submissions persist as staff inquiries.
- [x] Workspace: registration/onboarding, profile/password/sessions, projects, provider selection and hosted consent, persistent streaming conversations, cancellation/retry/rename/export/delete, authorized source inspection.
- [x] Documents: immutable originals, Docling/OCR, LibreOffice conversion, Tika, extracted structure/tables/locations/warnings, leased jobs and restart recovery, keyword and pinned local semantic search, persistent interpretation, complete deletion and removed-source citations.
- [x] Console: scoped hashed API keys, operator-controlled connections, bounded ABI diagnostics, workspace-exclusive WDBX gRPC operations and events, real outcomes/usage and content-free traces.
- [x] Customer operations: persistent inquiries and service requests, assigned staff, onboarding, milestones, versioned deliverables, exact-version review and change requests, review history/comments, notifications and preferences.
- [x] Verification: automated gates, browser workflows and responsive screenshots, real local integrations, backup/restore, fresh installation and production startup.

## Automated evidence

| Gate                                            | Result                                                                                                                                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run check`                                 | TypeScript passed; 18 Vitest tests passed; 26 pytest tests passed; production build passed                                                                                                                                                               |
| `bun run test:e2e` with an explicit local model | Five Chromium workflows passed: shared public navigation, reduced motion and mobile focus; account/session controls; local grounded chat/cancellation; customer-to-staff versioned review; public routes/projects/documents/search/responsive navigation |
| `bun run verify:formats`                        | 24 structured/legacy/OCR fixtures passed across 23 extensions, in addition to native text/code/structured-text/email/CSV/HTML parser tests                                                                                                               |
| `bun run verify:integrations`                   | Actual ABI, dedicated WDBX, local MLX, worker recovery, interpretation, source deletion, and restored workflows passed                                                                                                                                   |
| `bun run verify:clean-install`                  | Fresh source copy, frozen Bun/Python installation, setup and all format fixtures, full checks, development UI rebuild, process-tree teardown, production startup/restart, registration and project persistence passed; dependency/model caches reused    |

Evidence: [combined release artifact](verification/release-artifact.json), [local integrations](verification/local-integrations.json), [clean installation](verification/clean-install.json), [format fixtures](verification/formats.json), and [browser screenshots](verification/screenshots/).

API tests cover unauthorized workspace associations, downloads/search/citations, viewer restrictions, revoked membership/keys, staff boundaries, exact-version approvals, and database/file restoration. Model adapter tests cover local failure with zero hosted fallback, consent enforcement, hosted-compatible streaming/usage, empty responses, and invalid citation identifiers. A mocked hosted protocol check is separate from live hosted verification.

## Real service and recovery evidence

- **MLX:** a dedicated local MLX-LM 0.31.3 runtime on port 3102 loaded `mlx-community/Llama-3.2-3B-Instruct-4bit`. Real answers streamed, cited the uploaded fixture correctly, and stopped on cancellation. Persistent action-item interpretation completed.
- **Existing MLX Core:** port 8080 advertised the model but rejected inference with “Model type llama not supported.” It was left unchanged. The installation explicitly selects the independently verified runtime; no automatic provider fallback exists.
- **ABI:** the existing executable returned its actual `abi.dashboard` JSON diagnostic snapshot. Arbitrary operations were rejected.
- **WDBX:** temporary stores passed statistics, vector insert/search, key/value, mutation events, bearer rejection, TLS/mTLS, bounded timeout and disconnection checks. Certificate validation remained enabled. Node 26 requires a certificate DNS name, such as `localhost`, for TLS rather than an IP server name.
- **Worker:** an expired processing lease recovered; extraction and the pinned normalized 384-dimensional local index completed. Deletion removed files, chunks, embeddings and interpretations; existing citations became removed-source references.
- **Restore:** checksummed SQLite and referenced originals/derived files were restored to a separate temporary installation. The account/session and source download remained valid; a new customer request/comment, project and real grounded AI answer worked.
- **Clean install:** setup tested the public Keynote fixture as well as Pages, Numbers, Office, OpenDocument, EPUB, email, PDFs and image/OCR fixtures. No fixture/customer records were seeded into the main installation.

## Browser and design acceptance

Compared the implementation with the approved Abbey and revised homepage references in `docs/design`. The homepage preserves the editorial hierarchy, architecture diagram, product accents and documentation actions. The application uses the original SVG brand, persistent navigation, project/conversation controls and source inspector. Browser tests exercise widths of 390, 768 and 1440 pixels, detect horizontal overflow and page errors, and verify mobile keyboard navigation/focus restoration. Screenshots capture settled layouts and loaded records, not loading placeholders.

## Local handoff and boundaries

The main installation is served at `http://127.0.0.1:3100` with its worker from the retained combined source/runtime snapshot recorded in `verification/release-artifact.json`. A controlled production restart preserved every main record count. The explicitly configured local model uses port 3102. `bun run gateway` manages a new, persistent playground store under private `.data/gateway` on ports 3104/3105; an owner must bind it to one workspace before use. These are local processes, not installed login services. Start commands and operator configuration are in [README](../README.md).

No main-installation accounts or default passwords are seeded. Register an account, then use the operator command to grant staff access to the chosen existing account. Backups include application data and referenced artifacts; external model caches, service stores and environment/file credentials require their own operator management.

Live hosted-provider verification remains **unverified because no hosted credentials were supplied**. Tika formats expose a warning when exact page/layout locations are unavailable; legacy conversion can change layout. Broad fixture support does not promise arbitrary proprietary/encrypted binaries or perfect extraction from every document. No benchmarks or customer traction claims were invented.

## Combined release and source identity

The shared `@mlai/ui` package, typed application adapters, styles/fonts, and project-scoped Abbey development agent are integrated. Development and typechecking build the package first; production builds emit package ESM and declarations. Native ESM import and client directives are regression-tested. Generated package output, alternate Next builds, and `next-env.d.ts` are ignored.

The final runtime source SHA-256 is `2b8d27fddf74fa006df57088aea0b0c19adb489bac909fa6fddd64e1090abbba`. Clean-install and live-integration receipts record the same source identity; documentation and evidence are excluded from this runtime hash. The original `1d4b727` baseline and `.data/releases/verified-app` remain rollback references. They are not the current combined release.

Release verification exposed and fixed three defects: development children surviving a terminated Bun wrapper; a timeout fixture retaining sockets; and a deferred SQLite rate-limit transaction failing with `SQLITE_BUSY_SNAPSHOT` under a competing worker write. The first clean production result was rejected because it reached a stale development process. The corrected verifier terminates its process group and verifies the port is free before each start. The rate limiter now obtains its write lock before reading the counter; a competing-connection regression verifies both serialization and normal rate limiting. The final browser workflow fails on HTTP 5xx as well as page errors.

The development-agent definition passes the plugin-dev structural validator, and Claude's initialization event lists the project `abbey` agent. A generated-response smoke test was blocked by the Claude account session limit; no agent response behavior is claimed from that test. See `verification/abbey-agent.json`.

The running release uses `.data/releases/mlai-clean-rG7B8J` for source, dependencies, and the production build, with the canonical private `.data` directory supplied explicitly. It passed production homepage/mobile-sign-in checks and starts both web and worker processes. Logs and launch state are `.data/local-release.log` and `.data/local-release.json`. Startup is session-independent but is not installed as an operating-system login service.

A separate active task owns the newly requested in-app autonomous Abbey agent, confirmed mutations, durable proposals, and associated migrations. Those additions are outside this accepted release and require their own integrated acceptance before replacing it. The separate task's `docs/superpowers` planning files are preserved and are not part of this release commit.

The accepted source checkpoint is `1cbaed670cd4773c56f720775c2de21859613002`. The release source freeze is lifted: the separate task may resume its agent implementation using isolated data and new acceptance evidence. Automatic task-message delivery failed because the destination had no active turn id; this committed ledger records the handoff.

## Public content search improvement (2026-09-06)

Documentation and research search now preserve the query in the URL across reloads and article back/forward navigation. Matching is case-insensitive, ignores extra whitespace, and accepts words in either order across the title, description, and category. Research uses its own search label. Both indexes expose a semantic search field, a live result count, an empty-state recovery hint, and a 44-pixel clear button that returns keyboard focus to the field. URL updates replace the current history entry and preserve unrelated parameters and the fragment.

The shared package owns filtering and presentation; the Next.js adapter owns URL synchronization under a Suspense boundary. Standalone package consumers retain local query state. This change does not add article-body search.

Current change evidence, separate from the historical combined release above:

- `bunx playwright test tests/e2e/content-search.spec.ts tests/e2e/account.spec.ts`: **3 passed**. Covers URL initialization, back/forward, reload, multiword/whitespace matching, typing, empty results, keyboard clearing/focus, preserved URL parameters, research labels, and long-query overflow at 390, 768, and 1440 pixels, plus the existing profile/password/session/drawer workflow. Documentation search records no page errors. Mobile and desktop research screenshots were inspected; screenshots are saved with the task outputs, not over the historical release evidence.
- `bunx vitest run tests/api.test.ts tests/models.test.ts tests/rate-limit.test.ts tests/release.test.ts`: **18 passed**.
- `uv run --project worker pytest worker/tests`: **26 passed**.
- Prettier validation of the five changed implementation/test files and `git diff --check`: **passed**. Shared UI ESM and declaration generation: **passed**.
- `bun run check`: **blocked at TypeScript** by the pre-existing untracked `tests/agent.test.ts:21`, which imports the absent `src/lib/server/agent-runtime` owned by the separate agent task. `bun run build` compiled successfully and then stopped at the same TypeScript error. The unfinished agent test was not excluded or stubbed to make the gate pass.

The existing local production release was not replaced. Integrated production build acceptance remains pending the agent task's implementation and a fresh complete gate. No hosted-provider, clean-install, or live-service verification is claimed for this search change.

## Agent source checkpoint (2026-09-06)

At the user's explicit request to commit all remaining work into `main`, the agent lifecycle migration/journal, typed contracts, regression scenarios, and development-agent scenario receipt were reviewed and included as an unfinished source checkpoint. There are no other local branches or linked worktrees to merge. A fresh `bun run check` still fails at `tests/agent.test.ts:21` because `src/lib/server/agent-runtime` has not been implemented. Committing this work does not establish agent runtime, endpoint, UI, or release acceptance. The scenario receipt records account-session-limit blocks, not successful behavioral verification.

## WDBX Specimen Studio handoff coverage (2026-09-06)

The existing `WdbxStudioLink` appears once in each of the Connections and Playground tabs and is absent from Api keys, Usage, and Traces. The fixed external destination opens in a new tab with `noopener noreferrer`. The visible notice explains that Studio storage belongs to its own browser/site origin and that opening it does not connect workspace data, credentials, or bound gateways. No component or console behavior changes were needed for this coverage.

Verified evidence for this handoff only:

- `bunx playwright test --config .data/studio-qa/playwright.config.ts tests/e2e/wdbx-studio.spec.ts`: **3 Chromium tests passed (48.5 seconds)**, one at each of 390, 768, and 1440 pixels with a 960-pixel viewport height. The ignored local config uses `http://127.0.0.1:3113`, `.data/studio-qa/data`, `.next-studio-qa`, and `/tmp/mlai-studio-qa-results` for isolated test accounts, build output, and screenshots; port 3101 remains reserved for the concurrent agent task. To run the new spec with the ordinary Playwright configuration, use `bunx playwright test tests/e2e/wdbx-studio.spec.ts`.
- Both placements passed exact destination/new-tab semantics, visible privacy notice, Tab traversal from the last console tab to the link, visible keyboard focus outline, and Enter activation. All six popup navigations were intercepted before reaching the external site. Each was a GET to the fixed URL with no query, body, referrer, authorization header, or cookie. Each destination had a null opener, an empty document referrer, and no access to synthetic console local/session storage values; the original console URL and storage values remained intact. No application API mutations occurred during tab navigation or link activation.
- Responsive geometry passed for both placements at every width: no document horizontal overflow, no panel/text/action clipping, action height of at least 48 pixels, stacked layout at 390/768, full-width action at 390, and side-by-side layout at 1440. Six settled screenshots were captured outside the repository; the 390 Connections, 768 Playground, and 1440 Connections screenshots were visually inspected. Page identity and meaningful console content passed, with no page errors or HTTP 5xx responses observed by the spec.
- Prettier checks passed for the new spec, Studio component/CSS, and console component. `git diff --check` passed. The isolated development startup rebuilt shared UI ESM and declarations successfully. An initial run stopped on the test's incorrect `API keys` capitalization; the corrected locator matches the existing `Api keys` label and the full focused rerun passed.

Remaining browser gaps: the published Studio itself was intentionally intercepted, so its availability, redirects, topology/trace/results/provenance tools, and storage persistence across reloads remain unverified here. This is Chromium desktop-engine coverage at three viewport sizes, not Safari/WebKit, Firefox, physical mobile, screen-reader, zoom, or cross-browser popup-policy acceptance. Existing Studio-origin cookies/data were not exercised. Full application typecheck/build, service integration, persistence/recovery, and production-release acceptance were not rerun for this test-only handoff. Gateway bindings, existing credentials, workspace authorization, and WDBX service behavior were not changed.

## Durable agent runtime/API checkpoint (2026-09-06)

This section records the scoped missing-runtime task separately from the concurrent Agent UI, live-model verification, and local release work. The earlier missing-module checkpoint is superseded at source level; it is not a claim that the whole application agent has release acceptance.

**Source evidence.** The integrated implementation is present in local `main` commit `a91eaa8d206b046b01c89593e1c9f81edfce77fc`, created by the concurrent checkpoint task. This task did not create a branch, worktree, or push. `agent-runtime.ts` implements `acquireAgentRun` and `processAgentRun`; `agent-routes.ts` mounts session-only create/read/events/cancel/confirm/reject routes. `agent-tools.ts` hydrates workspace/project/selection-authorized references without saving source excerpts in operational step records. `agent-actions.ts` stores immutable proposals, checks current requester membership and resource revisions, and atomically applies approved writes with their result receipts. Completed writes return to planning; another write requires another explicit proposal confirmation. Provider/model fingerprints and hosted consent are rechecked before calls, confirmation, and writes. Worker integration uses the same bounded queue, pinned interpretation selection, lease attempts, and an atomic insight/job completion guard; restore retains proposals and approvals while requeuing interrupted runs. Conversation history exposes run summaries only to sessions; SSE sends `snapshot` events with durable revision IDs and reauthorizes each update. OpenAPI labels agent endpoints as session-only. No original agent assertions were removed or weakened.

**Test evidence.** `bun run test tests/agent.test.ts tests/api.test.ts tests/models.test.ts` passed **40 tests**, including **22 agent tests**. Coverage includes workspace isolation, invalid and valid bearer rejection, requester-only decisions, input replacement rejection, stale revisions before and after confirmation, viewer investigation, unknown tools/malformed output, removed membership, cancellation during generation, source deletion/citation removal, revoked hosted consent, changed provider configuration, output/tool/time limits, same-worker lease fencing, SSE reconnect/revocation, and conversation deletion with queued agent jobs. `bun run typecheck` and targeted Prettier checks passed. The first `bun run check` passed TypeScript and stopped at Vitest: **50 passed, 2 failed (52 total)**. The failing concurrent worker fixtures were extraction deadlines through semantic indexing and graceful shutdown/requeue; both failed to reach the expected fixture state. Parser and build stages did not run within that failed combined command. The initial log is retained locally at `.data/agent-checkpoint/check.log`. A subsequent focused worker rerun passed **8/8** without removing its deadline or requeue assertions. Independently, the Python parser suite passed **26/26**, and the isolated production build passed after running `db:migrate` once for its fresh fixture database. The first isolated build had compiled and passed TypeScript but failed during concurrent fresh-database migration (`table user already exists`); serial fixture initialization resolved that build prerequisite. Build retries use `.next-agent-checkpoint` and `.data/agent-checkpoint/build`, and generated TypeScript include changes are removed after validation. These outputs are saved in `.data/agent-checkpoint/{parser,build,build-retry,worker-retry}.log`.

**Final combined gate.** After serial initialization of the isolated fixture database, `MLAI_DATA_DIR=.data/agent-checkpoint/build NEXT_DIST_DIR=.next-agent-checkpoint bun run check` exited **0**: shared UI ESM/declarations, TypeScript, **52/52 TypeScript tests across 6 suites**, **26/26 Python parser tests**, and the Next.js production build all passed in the same invocation. This includes the previously failing worker lifecycle fixtures. The final log is `.data/agent-checkpoint/check-final.log`. Production data and the active release were not used for this build. The earlier failed runs above remain recorded as diagnostic history.

**Persistence evidence.** Isolated SQLite tests verified proposal-without-write, duplicate confirmation, expired-lease replay, immutable requester decisions, exactly one queued interpretation job, atomic interpretation/complete-job publication, and cancellation preventing later insight publication. The restore fixture invoked `scripts/restore.ts` in a separate process against a copied database, checked integrity, requeued interrupted execution, cleared lease ownership, preserved active-time accounting, and retained pending/approved actions. These fixture results do not establish successful restoration and use of a real local-model proposal in a separately running installation; that acceptance belongs to the concurrent live/recovery verification task.

**Browser acceptance.** No Agent UI/browser acceptance is claimed by this runtime checkpoint. The concurrent application task owns the browser flows at 390/768/1440 pixels, keyboard/source-inspector checks, real local-model requests, and local release activation. Hosted-provider live acceptance remains unverified. Existing public-search and WDBX Studio browser evidence above is separate and does not substitute for agent acceptance.

## Strict code-quality review of the agent runtime (2026-09-06)

A structural and correctness review of `ec826ef^..HEAD` produced source changes, so the
"Durable agent runtime/API checkpoint" receipts above predate the current tree and no longer
tie to the source under review. This section supersedes them for gate status only; their
behavioral findings still stand.

**Applied.** Extraction failures again surface `extract.py`'s specific stdout error instead of a
generic string (`scripts/worker.ts`), restoring the contract stated in `CLAUDE.md` and in that
script's own module docstring. `agentLimits` gained `objectiveChars` and the browser view now
consumes the shared limits rather than hardcoding `8`/`16000`. The non-terminal run-status set is
exported once as `agentActiveStatuses`/`agentTerminalStatuses`/`agentActiveStatusSql` and reused by
the store, routes, and view; the migration keeps its own literal, since applied migrations are
immutable. `dispatch`'s scope expression became a named `scopeFor()` documenting why agent paths and
browser conversation creation resolve to `read`. `invalidateAgentSources` now updates
`agent_steps.count` alongside the ids it filters, so the UI no longer reports a stale record count.
`validateModelSelection` carries a comment stating what it cannot prove. `README.md` no longer
claims in-app agent actions are excluded from the release and documents `verify:agent`.

**Not applied, reported instead.** For an unpinned connection (the `config.ts` default, `model: ""`),
`validateModelSelection` compares `c.model || expected.model` against `expected`, so it cannot detect
a swapped served model; only `generate()`/`assertModelSelection` probe. The interpretation
publication path holds no probe-backed check, leaving a window in which a mid-job model swap goes
unnoticed. Closing it requires an async probe at a publication boundary that is currently a
synchronous transaction, which is a design decision rather than a review edit. Also reported and not
executed: consolidating the nine agent tools into one registry, and collapsing the repeated
model-selection re-validation behind a single wrapper.

**Gate.** `bun run check` exited **0**: shared UI ESM/declarations, TypeScript, **52/52 tests across
6 suites** (including a new `tests/api.test.ts` assertion that a viewer may open its own
investigation conversation while other writes stay forbidden), **26/26 Python parser tests**, and the
Next.js production build. `git diff --check` passed. `bun run format:check` was already failing at
`e0f9907` and still fails on the same files carried in unformatted by the reviewed commits
(`agent-contracts.ts`, `agent-jobs.ts`, `documents.ts`, `embeddings.ts`, `models.ts`, `worker.ts`,
`restore.ts`, `verify-agent-restored.ts`, `agent-view.tsx`, `models.test.ts`, `worker-agent.test.ts`).
This review deliberately did not reformat them: running Prettier over `agent-contracts.ts` alone
expands 41 lines to 216 and buries a three-line change, so the repo-wide reformat belongs in its own
commit (`bunx prettier --write .`) rather than mixed into review fixes. Edits here match each file's
existing idiom. No live-model, browser, or release acceptance was rerun.

## MLAI research merge (2026-09-06)

This section closes step 4 of `docs/research-merge/plan.md`, which had been "In progress" with
the whole merge sitting uncommitted since 16:25. It records verification only; the merge's
design rationale and its scope boundaries are in `docs/research-merge/report-source.md` and are
not restated or weakened here.

**Content integrity.** Verified independently of the merge's own tests, against
`docs/research-merge/source-manifest.json`: the corpus hash of `src/content/research-data.json`
recomputes to `1bac66896aa58c1c97813cdf7ff9ac80f94285abb6e3b183d901620a352ecaa4`, matching the
manifest, and **all 21 per-publication hashes match with zero mismatches**. The imported data is
**deep-equal to the source export** at `../mlai-research-sites/public/research-data.json`, and
that export's own manifest carries the same `contentSha256`. All **four PDFs under
`public/research/` match their manifest sha256 byte-for-byte**, and so do the originals they were
copied from. `ensure_ascii=False` is required in these JSON hashes; Python's escaping default
makes 8 of 21 publications appear corrupt.

The source export is itself current rather than stale: its `sourceRevision`
`0a516a84f3b2d8f6f0c96491b8ac4f3e4307cefb` is an ancestor of `../mlai`'s `main`, 13 commits back,
with **zero changes to any research path** in between (checked against a control diff that did
show the 10 unrelated changed files, so the empty result is a real negative and not a failed
command).

**Rendering.** The production build prerenders **all 21 publications** as static HTML under
`research/`, plus the three retained application notes (`provenance`, `provider-boundaries`,
`execution-traces`) — 24 pages, matching the library's card count — and the sitemap contains a
`<loc>` for every one of the 21 slugs with none missing. Note when checking this by hand that a
`find -path "*research*"` matches every file if the dist directory is itself named
`.next-research-merge`; count by filename, not by path.

**Browser acceptance, and two test defects found by running it.** `bunx playwright test
tests/e2e/research.spec.ts` initially failed **3 of 4** tests. Both causes were in the spec, not
in the product, and both were fixed:

- `getByLabel("Research area", { exact: true })` can never match. Playwright's `getByLabel`
  matches the label's text content, and the `<label>` wraps its `<select>`, so that text is
  `"Research areaAll areasAI & agent behavior…"`. Measured directly: exact match resolved **0**
  elements, loose match resolved **2** (the select and the `<nav aria-label="Research areas">`,
  so loose is ambiguous and not the fix), while
  `getByRole("combobox", { name: "Research area" })` resolved **1**. The rendered accessible name
  was correct throughout. Same fix applied to "Document type".
- `expect(page.locator("#evidence")).toContainText("Limitations")` never matched, because the
  section heading renders **"Evidence & limitations"** with a lowercase l. Rather than just
  lowering the case, the assertion now checks the rendered `h2` exactly and then asserts the
  section contains the publication's own `statusNote` and every one of its `limitations` strings
  from `src/content/research.ts`, so it verifies the data the section claims to show. This is the
  same defect class as the earlier `API keys` / `Api keys` capitalization fix recorded above.

After those two fixes: **4 passed** — the library at 390, 768 and 1440 pixels (topic and type
filtering down to a single card, filter state surviving a reload and a back-navigation, reset,
search-to-zero and clear-search keyboard focus, KaTeX visible, both download editions present, no
horizontal overflow, no page errors, and every attachment served as `application/pdf`), plus
route coverage asserting a 200 with an `id="sources"` body for all 21 slugs and the three legacy
notes, and a 404 for an unknown one.

**Repository gate.** `MLAI_DATA_DIR=.data/research-merge/build bun run check` exited **0** —
shared UI ESM/declarations, TypeScript, **56/56 tests across 7 suites** (up from 52/6; the new
suite is `tests/research.test.ts`, 4 tests), **26/26 Python parser tests**, and the Next.js
production build. Exit codes were read from the commands themselves, not through a pipe.
`git diff --check` passed. Prettier passes on every file this merge added or touched.
`bun run format:check` repo-wide is **still failing on the eleven pre-existing files named in the
section above**; that is unchanged by this work and deliberately not absorbed into this commit.

`tsconfig.json` was reverted before committing. `next build` had rewritten it with generated
`.next-research-merge/**` includes and reformatted its inline arrays; per the practice recorded
above, generated TypeScript include changes are removed after validation. The final gate was
re-run against the reverted file and still exited 0.

**Homepage screenshots, re-verified rather than assumed.** The merge changed
`src/app/(public)/page.tsx`, and the three `docs/verification/screenshots/home-{390,768,1440}.png`
staged with it were the earlier session's 16:23 output, so they were committed as verification of
a page nobody had re-screenshotted. Those files are owned by `tests/e2e/public-accessibility.spec.ts`
(not by the research spec, whose `MLAI_RESEARCH_SCREENSHOTS` path writes `research-library-*` and
`research-article-*` instead). Running that owning spec passed and regenerated all three
**byte-identically** — `git status docs/verification/screenshots/` came back empty afterwards — so
the committed images do show the current homepage, and the accessibility assertions around them
(no horizontal overflow at any of the three widths, mobile navigation focus restore and
`aria-expanded`, a `0s` skip-link transition under reduced motion, `/docs/` served, unknown route
404, no page errors) passed against the merged tree.

**Gate fixture.** `.data/research-merge/` is a disposable fixture directory created for these
runs, not application state; it is covered by `.gitignore:5` (`.data/`) and nothing under `.data`
entered the commit. It sits beside the earlier `.data/agent-checkpoint/` fixture from the runtime
checkpoint above and can be deleted freely.

**Gaps, carried forward unchanged.** No live fetch of the remote published page was performed, so
nothing here is acceptance of its served content. The KaTeX 0.18.7 dependency risk posture remains
unknown — no affirmative security verdict. Browser evidence is Chromium at three widths, not
Safari/WebKit, Firefox, physical mobile, screen-reader, or zoom acceptance. This merge does not
deploy the application and does not resolve any pre-existing runtime, auth, model or release
acceptance gap. The repository still has **no remote of any kind**, so its bundle in
`~/at-risk-bundles/` remains the only backup.

## Claims reconciliation against sibling source — 2026-09-07

A v3 design pass was applied to this tree. The design's own figure table was **not** copied in:
`src/content/provenance.ts` already carried a stricter contract than the design did (a required
`source` on every row, an explicit `BANNED_HANDOFF_FIGURES` refusal list, and provenance tags kept
separate from claim-ledger status), and the design's grid tagged twelve cells `measured` with no
source at all while shipping `efConstruction=200`. Importing it would have been a regression. The
work became a reconciliation: every claim was checked against the sibling repositories, and only
what source supports survived.

**What was checked, and where.** `wdbx` at `6114b95a`, `abi` at `6cd758e3` — both HEADs verified to
be on `origin/main`, so the pinned blob URLs in `provenance.ts` resolve publicly.

- `wdbx/crates/abi-wdbx/src/hnsw.rs` — `MAX_LAYERS = 4`, `M = 16`, `EF_CONSTRUCTION = 40`,
  `EF_SEARCH = 32`. The stale `200` default appears nowhere in this tree; `research-data.json`
  already had the correct trio, so the site was self-consistent here and stays that way.
- `wdbx/crates/abi-wdbx/src/format.rs` — `prev_hash` and a SHA-256 chain exist. The hash-chain
  claim survives, with a source.
- `abi/crates/abi-ai/src/router.rs` — routing is keyword-weighted `f32` scoring normalized to a
  distribution, with `select_best_profile` taking the highest weight. Deterministic and
  inspectable; **not** a trained model.
- `abbey-bot/Cargo.toml` — Rust: serenity 0.12.5, poise 0.6.2, songbird 0.6.0.
- `AbbeyBot/Package.swift` — swift-tools 6.4: DiscordBM, Vapor, Fluent. Twitch EventSub lives in
  this Swift surface (`Sources/AbbeyServer/Routes/TwitchEventSubRoutes.swift`) and in no Rust
  source. Both bot repositories are private, so those two rows cite a path, not a link.

**Four claims were false against source and are gone.**

1. `abbey-page.tsx` described Abbey Bot as "Discord (Bun + discord.js v14)". It is Rust. The site
   already said so correctly in `src/content/knowledge.ts:181`, so this page was contradicting its
   own knowledge base. Corrected, and the Swift product is now listed as a second product rather
   than a "port in progress" of the first.
2. "Neural backtracking — hash-chained interaction blocks rewind to the exact divergence point."
   `backtrack` appears in **zero** files across `abi`, `abbey` and `wdbx` (`.rs`, `.md`, `.toml`;
   the instrument was control-checked against `persona`, which matches 31 files). The nearest real
   thing is abbey's `/rewind`, which clears a chat id. The hash chain is real; the rewind feature
   is not. The card now claims only the chain, and names reconstruction as a target.
3. "Training penalizes unsupportive phrasing via an explicit empathy loss term" and "a conciseness
   loss term penalizes filler tokens. Fewer tokens, lower latency." Neither term exists in `abi`
   (the only `empathy` hit in the repository is in `CODE_OF_CONDUCT.md`), and the latency half was
   an unharnessed performance claim. Both replaced with the routing behavior that source shows.
4. Persona routing was described as `argmax over P(persona | input, context)`. The weights are
   normalized keyword scores, not a probability. Reworded to what `router.rs` does.

**The provenance layer was live code that nothing rendered.** `provenance.ts` and
`prov-tag.tsx` existed, `globals.css` styled `.prov-tag`, and `figures` was empty, so no page
carried a tag. `figures` now holds eight source-cited rows and they render as tables on `/wdbx`
(the five substrate rows) and `/abi` (the two routing rows), each row beside its own chip and a
`● measured / ○ target / ◆ reported` legend. Vector query latency stays an em dash under a
`target` tag: there is no published harness, so there is no number.

**New gate: `tests/claims.test.ts`, 15 tests.** It pins what was verified rather than pretending to
re-verify it — this repository cannot import the sibling crates. It requires a `source` on every
figure, requires source URLs to name a 40-hex commit rather than a branch, holds the four HNSW
constants, keeps the latency row an em-dash target, forbids the restoration of `ef*=200`,
`discord.js`, `backtrack`, the two loss terms and the banned handoff figures, requires both real
bot stacks by name on the Abbey page, and renders both pages to assert every figure reaches a page
with its chip — so a figure can no longer become dead data again.

**Repository gate.** `MLAI_DATA_DIR=<scratch> bun run check` exited **0**: shared UI build,
TypeScript, **71/71 tests across 8 suites** (up from 56 across 7; the new suite is
`tests/claims.test.ts`, 15 tests), **26/26 Python parser tests**, and the Next.js production build,
which prerendered `/wdbx` and `/abi`. Exit codes were read from the commands themselves, never
through a pipe. Prettier passes on all five files this pass touched. `bun run format:check`
repo-wide is **still failing on the same eleven pre-existing files**; that red is not from this
work and is not absorbed into this commit. `tsconfig.json` was compared before and after
`next build` and was unchanged this time.

**Not done, stated plainly.** No live browser acceptance was run against these two pages. The
production server on port 3100 belongs to another session and serves a clean-install release
snapshot out of `.data/releases/`, not this working tree, so it will never show these changes; it
was left running. A second dev server could not be started through the launch mechanism because
`scripts/dev.ts` takes its port only from `APP_URL`. The wide tables use `.table-scroll`
(`packages/ui/src/styles/components.css`, `overflow: auto`), the same container the Abbey page's
register table already uses under the passing 390 px no-horizontal-overflow assertion, and the
build prerendered both pages — but that is structural evidence, not a screenshot at three widths.

**Correction to the section above.** Its closing line, "the repository still has no remote of any
kind", is stale: `origin` is `donaldfilimon/mlai-website-app` (private), and `main` tracked it at
`29391e5` when this work began.

## Browser acceptance repair — two real layout defects, two stale expectations (2026-09-07)

**Two genuine horizontal-overflow defects on the public site, both found by measuring the DOM
rather than reading CSS, and both fixed.** `tests/e2e/public-accessibility.spec.ts` had been
failing on `main` at the 390 px no-horizontal-overflow assertion.

1. **Footer accent, ≤767 px.** `.public-footer-accent` bled `-40px` on each side to reach the
   footer's padding edge, but the ≤767 px breakpoint sets the footer's horizontal padding to `0`
   and its margin to `23px`. Measured at a 390 px viewport: the element rendered 424 px wide from
   `left=-17` to `right=407`, making `documentElement.scrollWidth` 407. The bleed and the padding
   are now one value (`--footer-pad`), so a breakpoint cannot change one without the other.
2. **Public nav, 768–900 px.** The horizontal nav had outgrown its collapse point. At 768 px the
   eight section links plus three actions measured 884 px against a 768 px viewport, and the drawer
   only took over at ≤767 px. The nav-specific rules moved to `@media (max-width: 900px)`;
   `.brand span` stayed at ≤767 px. Tightening type again was rejected — the next link added would
   have reintroduced the scrollbar.

Measured after the fix: 390 px `scrollWidth` 390 with zero overflowing elements, 768 px 768,
1440 px 1440.

**Two stale test expectations, corrected without weakening an assertion.** Neither was a
capability regression, and both were verified against source before editing.

- `tests/e2e/research.spec.ts` expected the `h1` "Research you can follow to the source."
  Commit `3040d21` deliberately rewrote it to "Figures with their receipts." and did not update
  the spec, so it had been red since that merge.
- `tests/e2e/content-search.spec.ts` looked for a searchbox named "Search documentation". The docs
  redesign renamed the in-page index filter to "Filter documentation" and gave the name "Search
  documentation…" to the ⌘K command palette. URL-backed docs search still exists — every behavior
  the section above records for it (URL initialization, back/forward, reload, whitespace matching,
  result counts, keyboard clearing and focus, preserved parameters) still passes under the new
  name.

**Rate limiting, not a broken sign-up flow.** `workflows.spec.ts` and `wdbx-studio.spec.ts` failed
with "Too many requests" on `/api/auth/sign-up/email`. `auth.ts` sets Better Auth to 30 requests
per 60 s per IP, and `.data-e2e` persists that counter across runs, so both repeated runs and a
single whole-suite sweep exhaust it. Each spec passes in isolation against a reset `.data-e2e`
(`workflows` 7/7 with `content-search` and `research`; `wdbx-studio` 3/3). **The limit was not
lowered and no test-only bypass was added** — that setting is production-correct, and weakening it
to make a sweep green would trade a real protection for a green log.

**Evidence.** `bun run check` exit **0** — 75/75 TypeScript tests across 8 suites, 26/26 Python
parser tests, and the production build prerendering 57 static pages. Exit codes were read from the
commands themselves, never through a pipe. Browser: `public-accessibility` passes at 390/768/1440;
`content-search`, `research` and `workflows` pass 7/7 together on a reset `.data-e2e`;
`wdbx-studio` passes 3/3 in isolation. Verification screenshots were regenerated from the passing
runs, including a new `architecture-390.png`. `format:check` remains red on the same eleven
pre-existing files and was not absorbed here. `tsconfig.json` was compared before and after
`next build` and was unchanged.

**Not done, stated plainly.** The full browser suite has still never been green in one invocation,
and the block is the rate limiter described above, not any assertion. Making it green in one sweep
needs a decision that is a product call, not a test fix: stagger the account-creating specs,
give them a shared fixture account, or scope the limiter by something other than IP. No live-model
acceptance was run (`live-chat.spec.ts` was excluded throughout). The `Unknown at rule: @theme` /
`@source` CSS parse warnings from `packages/ui/dist/styles/` still appear in the dev log; they did
not affect these assertions and were not investigated.

## Tailwind was never wired, so every shadcn primitive shipped unstyled (2026-09-07)

**A user-visible defect, not a warning.** The dev log's `Unknown at rule: @source` / `@theme`
messages from `packages/ui/dist/styles/` had been recorded as unexplained. They were the symptom of
a missing build step: the repository had **no PostCSS config at all**, so Next never ran Tailwind
over the design system stylesheet. `packages/ui/src/styles/index.css` states the intent in its own
comment — "`@source` points at compiled package sources so shadcn utility classes in
`components/ui` are generated **when the stylesheet is processed by the app bundler**" — and
imports Tailwind's preflight, theme and utilities layers. Nothing consumed them, so every utility
class in `packages/ui/src/components/ui/*` resolved to nothing.

**Measured before the fix**, by opening the docs ⌘K palette and reading the dialog's computed
style rather than inspecting CSS: the `[role="dialog"]` rendered at `x=0, y=763, w=1440, h=497` —
in normal document flow below the footer — with `background: rgba(0,0,0,0)`, `padding: 0px` and
`z-index: auto`. It was not a modal. **After** adding `postcss.config.mjs`: `x=464, y=275,
w=512, h=350` (centred), `background: rgb(5,7,13)`, `border: 1px solid`, `z-index: 50`, and zero
`Unknown at rule` warnings in the dev log.

Affected surfaces, enumerated rather than assumed — the app imports shadcn primitives in three
places: `docs-shell.tsx` (`CommandDialog` and friends), `repositories-page.tsx` (`Badge`, `Card`
and its subcomponents) and `quesar-pages.tsx` (`Button`, `Card`, `Badge`, `Dialog`).
`/repositories` now renders bordered cards and status chips instead of unstyled blocks.

**Preflight risk was checked, not argued.** Tailwind's preflight arrives in `layer(base)` while
the hand-written stylesheets are unlayered, so the existing CSS still wins the cascade. Verified
by rendering `/`, `/repositories` and `/research` at 390 and 1440 after the change: horizontal
overflow is `0px` on all six, and the home page is unchanged against the screenshot committed
before it.

**Evidence.** `bun run check` exit **0** — 75/75 TypeScript tests across 8 suites, 26/26 Python
parser tests, production build prerendering 57 static pages with Tailwind now in the pipeline.
Browser: `public-accessibility`, `content-search`, `research` and `workflows` pass **8/8** together
on a reset `.data-e2e`. Exit codes read from the commands themselves. `tsconfig.json` compared
before and after `next build` and unchanged.

**Not done, stated plainly.** `/quesar` was not re-checked in a browser after the change, only
`/`, `/repositories`, `/research` and `/docs`. No visual diff was run against the pre-Tailwind
screenshots beyond the home page; other committed screenshots were regenerated from passing runs
rather than compared pixel by pixel. Whether the design intends utilities to be available to the
application's own `src/**` (the `@source` glob covers only the UI package) was not decided here.

**Correction to the residual above (same session).** "`/quesar` was not re-checked in a browser"
is no longer true. All three Quesar routes were rendered at 390 and 1440 with the Tailwind
pipeline active: `/quesar` (no shadcn primitives — its Card and Badge usage is on the sub-routes),
`/quesar/consent` (1 card) and `/quesar/audit` (3 cards, 4 badges). Cards compute a real
`1px` border and a `15.2px` radius, horizontal overflow is `0px` on all six renders, and no page
errors were raised. The selector was validated against `/repositories` first, so a zero count
means the page genuinely has none rather than a wrong query. The remaining residuals stand: no
pixel diff against the pre-Tailwind screenshots beyond home, and whether `@source` should also
cover the application's own `src/**` is still undecided.

## Closing the two Tailwind residuals with measurement (2026-09-07)

**The remaining browser specs now have post-Tailwind evidence.** Only four spec files were re-run
when the PostCSS config landed; the account-creating ones had not been. Run in separate
invocations against a reset `.data-e2e` to stay inside the auth rate limit: `portal` **1/1**,
`account` **1/1**, `wdbx-studio` **3/3**, and `agent` **2 skipped** because it is gated on
`MLAI_E2E_MODEL_URL`. With the earlier `public-accessibility`, `content-search`, `research` and
`workflows` **8/8**, the whole non-live suite is **13 passed, 2 model-gated skips, 0 failures**
under the Tailwind pipeline — though still only across separate invocations, never one sweep.

**The pixel diff was run, and preflight's blast radius is now a measured number rather than a
reassurance.** All 14 committed verification screenshots were compared against their pre-Tailwind
versions at `76fd32a`:

- **7 are byte-identical**, including `production-home-1440`, `customer-1440`, `staff-1440` and all
  three `abbey-grounded` widths.
- **4 grew slightly**: `home-1440` +3 px, `home-390` +6 px, `home-768` +7 px, `architecture-390`
  +12 px. Every pixel above the change is identical, and `home-1440` is explained *entirely* by a
  uniform 3 px shift — nothing on it was restyled.
- The origin of the growth was located and inspected rather than assumed: it is the provenance
  legend strip. Text, colour, glyphs and wrapping are identical; it simply sits a few pixels lower,
  because preflight resets the default margins of the elements it is built from. `architecture-390`
  differs across a wider span only because that page carries two such legends, so no single uniform
  shift realigns it.
- **3 differ in tiny bands that are not styling at all**: `abbey-390` (0.21 % of pixels),
  `abbey-768` (0.15 %) and `documents-1440` (0.01 %). Cropping `abbey-390` shows the model picker
  reading "Local · MLX Core / auto-discover" where it previously read "Choose a model" — an MLX
  server was listening on port 3102 during the later run. Environmental content, not a regression.

No text, colour, spacing-within-components or layout damage was found anywhere. The judgement that
preflight in `layer(base)` cannot disturb the unlayered hand-written CSS held under measurement.

**Still not done.** The full suite in a single invocation remains blocked by the rate limiter, and
that is a product decision, not a test fix. Whether `@source` should also scan the application's
own `src/**` is still undecided.

**The `@source` scope question is settled, not deferred.** The application's own `src/**` contains
**zero** Tailwind utility classes, so widening the glob would generate nothing today. The only
Tailwind-shaped names there — `text-link`, `text-button`, `space-top` — are hand-written classes
defined in `packages/ui/src/styles/components.css`. The current scope is correct as written. The
consequence worth knowing: a genuine utility class written in `src/**` will silently do nothing
until the glob is widened, which fails as missing styling rather than as a build error.

## The whole browser suite is green in one invocation, and the earlier diagnosis was wrong (2026-09-07)

**Correction first.** Two sections above attribute the suite's 429s to `auth.ts` setting Better
Auth to 30 requests per 60 s. That is not the binding limit. Better Auth applies a **built-in**
rule of **three requests per ten seconds**, keyed per IP *and path*, to `/sign-in`, `/sign-up`,
`/change-password` and `/change-email`, and it replaces the configured window for those paths
(`node_modules/better-auth/dist/api/rate-limiter/index.mjs`, `getDefaultSpecialRules`). The
configured 30/60 s never applied to sign-up at all. Anything in this file that says otherwise is
superseded by this paragraph.

That correction changed the fix. A per-path `customRules` entry raising `/get-session` was tried
first and **reverted**: it addressed a limit that was not the constraint, and it loosened a
production setting for a test's benefit. `auth.ts` is untouched by this work.

**The real fix is test-side, and it respects the throttle rather than removing it.**
`tests/e2e/support/account.ts` creates fixture accounts through one helper that waits out a 429 —
honouring `Retry-After` when present — and retries twice before failing. `wdbx-studio.spec.ts` was
creating one account per width for an assertion identical at all three; it now creates one in
`beforeAll` and replays its cookies, removing two sign-ups from a three-per-ten-second budget.
`portal.spec.ts` and `account.spec.ts` route through the same helper.

**Evidence.** `bunx playwright test tests/e2e --grep-invert live` exits **0** in a single
invocation: **13 passed, 2 skipped** (`agent.spec.ts`, gated on `MLAI_E2E_MODEL_URL`), **0
failed**, 45.1 s. This is the first recorded green whole-suite run; every earlier green was a set
of separate invocations. `bun run check` exit 0 alongside it.

**What did not change.** No production rate limit was raised, no assertion was weakened or
deleted, and no test-only bypass was added to application code. The suite still needs
`rm -rf .data-e2e` between runs because that database persists other counters.
