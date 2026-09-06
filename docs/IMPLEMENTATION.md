# MLAI implementation and acceptance ledger

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

| Gate | Result |
|---|---|
| `bun run check` | TypeScript passed; 18 Vitest tests passed; 26 pytest tests passed; production build passed |
| `bun run test:e2e` with an explicit local model | Five Chromium workflows passed: shared public navigation, reduced motion and mobile focus; account/session controls; local grounded chat/cancellation; customer-to-staff versioned review; public routes/projects/documents/search/responsive navigation |
| `bun run verify:formats` | 24 structured/legacy/OCR fixtures passed across 23 extensions, in addition to native text/code/structured-text/email/CSV/HTML parser tests |
| `bun run verify:integrations` | Actual ABI, dedicated WDBX, local MLX, worker recovery, interpretation, source deletion, and restored workflows passed |
| `bun run verify:clean-install` | Fresh source copy, frozen Bun/Python installation, setup and all format fixtures, full checks, development UI rebuild, process-tree teardown, production startup/restart, registration and project persistence passed; dependency/model caches reused |

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
