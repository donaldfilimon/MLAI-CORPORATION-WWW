# MLAI implementation and acceptance ledger

Application implementation verified on 2026-09-06. The independent repository contains the public website, authenticated Abbey workspace, developer console, and customer/staff portal. Application records and private files persist locally. Billing, public deployment, domain changes, external email, and changes to sibling repositories are outside this release.

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
| `bun run check` | TypeScript passed; 14 Vitest tests passed; 26 pytest tests passed; production build passed |
| `bun run test:e2e` with an explicit local model | Four Chromium workflows passed: account/session controls; local grounded chat/cancellation; customer-to-staff versioned review; public routes/projects/documents/search/responsive navigation |
| `bun run verify:formats` | 24 structured/legacy/OCR fixtures passed across 23 extensions, in addition to native text/code/structured-text/email/CSV/HTML parser tests |
| `bun run verify:integrations` | Actual ABI, dedicated WDBX, local MLX, worker recovery, interpretation, source deletion, and restored workflows passed |
| `bun run verify:clean-install` | Fresh source copy, frozen Bun/Python installation, setup and all format fixtures, full checks, production server, registration and project persistence passed; dependency/model caches reused |

Evidence: [isolated release artifact](verification/release-artifact.json), [local integrations](verification/local-integrations.json), [clean installation](verification/clean-install.json), [format fixtures](verification/formats.json), and [browser screenshots](verification/screenshots/).

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

The main installation is served at `http://127.0.0.1:3100` with its worker. The explicitly configured local model uses port 3102. `bun run gateway` manages a new, persistent playground store under private `.data/gateway` on ports 3104/3105; an owner must bind it to one workspace before use. These are local processes, not installed login services. Start commands and operator configuration are in [README](../README.md).

No main-installation accounts or default passwords are seeded. Register an account, then use the operator command to grant staff access to the chosen existing account. Backups include application data and referenced artifacts; external model caches, service stores and environment/file credentials require their own operator management.

Live hosted-provider verification remains **unverified because no hosted credentials were supplied**. Tika formats expose a warning when exact page/layout locations are unavailable; legacy conversion can change layout. Broad fixture support does not promise arbitrary proprietary/encrypted binaries or perfect extraction from every document. No benchmarks or customer traction claims were invented.

## Concurrent checkout changes at handoff

A separate task began extracting `packages/ui` and changed the package/build graph during final closeout. Its files and working-tree edits were preserved. An isolated copy of the application Git index passed frozen installation, TypeScript, all 14 Vitest tests and a production build after the final project-association fix. The running app uses its saved `.data/releases/verified-app` artifact. The initial application commit records this task’s implementation; the concurrent package extraction remains outside that commit and requires its own final type/build/browser validation. The previously passing application checks above do not claim that every later concurrent edit is verified.
