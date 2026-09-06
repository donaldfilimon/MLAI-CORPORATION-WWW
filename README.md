# MLAI website and local application

An independent MLAI public website, Abbey workspace, developer console, and customer/staff portal. Next.js runs on Node; Bun manages dependencies and commands. Application records use SQLite WAL with Drizzle migrations. Original documents and deliverables remain private filesystem files.

## Start locally

Requirements: Node 22.18+ (verified with Node 26.8), Bun 1.4, uv, Python 3.11–3.13, LibreOffice (`soffice` on PATH), and Java 21+. On Apple silicon, `bun run model` can start a dedicated MLX runtime. Existing MLX Core or another local OpenAI-compatible runtime can also be used.

```sh
bun install --frozen-lockfile
bun run setup
bun run dev
```

Open **http://127.0.0.1:3100** and register your own account. No sample accounts, default passwords, or customer records are seeded. Registration creates a personal workspace. Create a project, select a model in Settings, and upload a document. Provider setup can be skipped for projects and the customer portal.

`setup` migrates the database, installs the locked Python environment, verifies Apache Tika's SHA-512 checksum, downloads parser/embedding assets, and processes the supplied test fixtures. These setup downloads contain no customer content. Capabilities are advertised only after their fixtures pass. Missing dependencies produce an actionable setup error.

Development first builds the private `@mlai/ui` workspace package, then the launcher starts the web server and worker on loopback. Production uses `bun run build` followed by `bun start`. Keep the launcher running while using the application. `Ctrl-C` stops both. Restarting preserves records and recovers expired job leases.

## Commands

| Command                                     | Purpose                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `bun run setup`                             | Install/verify processing dependencies, model assets and migrations                                           |
| `bun run dev`                               | Next development server and persistent worker                                                                 |
| `bun run worker`                            | Run another worker using the same data directory                                                              |
| `bun run model`                             | Optional dedicated local MLX-LM server, port 3102                                                             |
| `bun run gateway`                           | Dedicated persistent WDBX playground on loopback 3104/3105                                                    |
| `bun run build` / `bun start`               | Production build / local Node server and worker                                                               |
| `bun run check`                             | Shared UI ESM/declarations, TypeScript, Vitest, pytest, and production build                                  |
| `bun run format:check`                      | Read-only formatting gate for application, scripts, tests, and shared UI                                      |
| `bun run test:e2e`                          | Playwright workflows in `.data-e2e` / port 3101                                                               |
| `bun run verify:formats`                    | Test broad format fixtures and update installed capabilities                                                  |
| `bun run verify:integrations`               | Real local model, ABI and isolated WDBX checks                                                                |
| `bun run verify:agent`                      | Live local-model agent run: proposal, confirmation, backup and restored-run completion                        |
| `bun run verify:clean-install`              | Source-hashed fresh installation, setup, checks, development rebuild, and production restart/account workflow |
| `bun run db:migrate`                        | Apply pending Drizzle migrations                                                                              |
| `bun run backup /absolute/new-backup`       | Snapshot database plus referenced original/derived files                                                      |
| `bun run restore /backup /new-data`         | Verify checksums and restore into a new directory                                                             |
| `bun run account:staff person@example.test` | Explicitly assign MLAI staff access to an existing account                                                    |
| `bun run account:reset person@example.test` | Hidden terminal password entry; revoke existing sessions                                                      |

Bun forwards positional arguments directly; `bun run backup /absolute/new-backup` also works. Install the test browser once with `bunx playwright install chromium`.

## Model and service configuration

Copy `.env.example` to `.env.local` for non-secret installation settings. Private state defaults to `.data` (`MLAI_DATA_DIR` overrides it). `APP_URL` controls the matching loopback URL and port. The example MLX Core endpoint is `http://127.0.0.1:8080/v1`.

For the independently verified local runtime, run `bun run model` and set the local connection URL to `http://127.0.0.1:3102/v1`, model `mlx-community/Llama-3.2-3B-Instruct-4bit`. This is an explicit operator choice. The existing MLX Core service at port 8080 advertised that model but rejected inference during verification; that external service was not modified.

The operator registry is `.data/connections.json` (or `MLAI_CONNECTIONS_FILE`). The application exposes names and capabilities, never credentials or configuration paths. Example entries:

```json
[
  {
    "id": "mlx",
    "name": "Dedicated local MLX",
    "kind": "local",
    "url": "http://127.0.0.1:3102/v1",
    "model": "mlx-community/Llama-3.2-3B-Instruct-4bit"
  },
  {
    "id": "hosted",
    "name": "Hosted provider",
    "kind": "hosted",
    "url": "https://provider.example/v1",
    "model": "configured-model",
    "keyEnv": "MLAI_HOSTED_KEY"
  },
  {
    "id": "abi",
    "name": "Local ABI",
    "kind": "abi",
    "binary": "/absolute/path/to/abi"
  },
  {
    "id": "wdbx",
    "name": "Workspace WDBX",
    "kind": "wdbx",
    "url": "127.0.0.1:50051",
    "tokenFile": "/private/gateway-token"
  }
]
```

Hosted credentials come from the server environment. Each workspace must explicitly enable hosted processing and select the provider before prompts/excerpts can be sent there. Local failures never choose a different provider. Operators must use local models behind local endpoints; known cloud model identifiers are rejected in local mode.

For WDBX TLS add `caFile` and use the certificate’s DNS name in `url` (for example `localhost:3104`); Node 26 rejects IP addresses as TLS server names. For mTLS add both `certFile` and `keyFile`. Each physical gateway/store must serve one workspace. Do not register aliases to share a store between customers. The current gRPC protocol has no tenant field. Its playground is separate from the application's document index; vector dimensions must match the data in the dedicated store. Native search accepts vectors; `TextSearch` uses the pinned local 384-dimensional encoder.

To run an independent playground, set `MLAI_WDBX_BINARY=/absolute/path/to/abi-wdbx-gateway` in `.env.local` and run `bun run gateway` in a separate terminal. This creates a new `.data/gateway/playground.wdbx` and private token; point the registry to `127.0.0.1:3104` and the absolute `.data/gateway/token` path. An owner must bind it before use. `Ctrl-C` stops the process; the store persists. Use a separate operator-managed gateway/store for each additional workspace.

ABI is restricted to `dashboard --once --json` and `backends`, with bounded execution and no arbitrary shell. The copied protobuf is the actual ABI gateway contract; its source and verification are recorded in `docs/verification`.

## Documents, privacy and recovery

The pipeline preserves originals, extracted text/tables, source locations, parser versions and warnings. Docling handles structured documents/OCR; isolated LibreOffice conversion handles legacy Office; Tika handles additional iWork/email/RTF formats. Mac extraction subprocesses and their converter children have network access denied. Parsers disable remote resources and never execute macros or embedded scripts. Formats with partial location support say so; encrypted/corrupt/empty inputs fail explicitly.

Keyword search remains available if local semantic encoding fails. The embedding model and revision are pinned in `worker/embed.py`; indexes cannot mix model versions. Interpretation runs as a persistent job and stays separate from source extraction. Cancelling a stream preserves its partial message with a cancelled state. Document deletion cascades through chunks, embeddings, jobs and interpretations; historical citations show “Source removed.”

Local email/password accounts do not verify email ownership. Password recovery is operator-assisted; no email delivery is simulated. Staff can manage assigned engagements and triage inquiries; they cannot read unrelated private documents or conversations. Deliverable decisions attach to a particular version, and replacement versions require review.

Backups use a database writer lock while snapshotting the committed database and referenced artifacts. They include the local auth secret and therefore require private storage. External credential files/environment values and model caches are not bundled. Restore refuses an existing target and verifies every file hash plus SQLite integrity. Start the restored installation with `MLAI_DATA_DIR=/new-data APP_URL=http://127.0.0.1:3103 bun start`.

## Development and validation

Source: `src/app` routes, `src/components` UI, `src/content` editorial content, `src/lib/contracts.ts` shared request schemas, and `src/lib/server` authorized services. Migrations: `drizzle`. Processing: `worker`. Tests: `tests` and `worker/tests`. Original brand assets: `public/brand`. Approved design references and browser screenshots: `docs/design` and `docs/verification/screenshots`.

The API reference is `/docs/api`; OpenAPI JSON is `/api/v1/openapi.json`. Browser mutations require a same-origin Origin header. API keys remain workspace-bound and scope-checked; owner and staff operations require sessions. Errors include stable codes and request IDs. Traces contain outcomes, durations and provider-reported usage; missing measurements remain unavailable.

Run `bun run check`, then browser tests. To include the real local chat browser test:

```sh
MLAI_E2E_MODEL_URL=http://127.0.0.1:3102/v1 \
MLAI_E2E_MODEL_ID=mlx-community/Llama-3.2-3B-Instruct-4bit bun run test:e2e

MLAI_MODEL_URL=http://127.0.0.1:3102/v1 \
MLAI_ABI_BINARY=/absolute/path/to/abi \
MLAI_WDBX_BINARY=/absolute/path/to/abi-wdbx-gateway bun run verify:integrations

MLAI_MODEL_URL=http://127.0.0.1:3102/v1 \
MLAI_MODEL_ID=mlx-community/Llama-3.2-3B-Instruct-4bit bun run verify:agent
```

Local test accounts/files are confined to test directories. The live integration script creates and deletes a dedicated temporary WDBX store, never an existing customer store. See `docs/IMPLEMENTATION.md` for separate source, browser, integration and recovery evidence. Billing, deployment, domain changes, external email, and edits to existing MLAI/ABI/Abbey/WDBX repositories are outside this release.

## Verified artifact during concurrent UI work

The original baseline artifact at `.data/releases/verified-app` and its locked runtime at `.data/releases/runtime` remain available for rollback. The combined release includes `packages/ui` source; its generated `dist` and Next outputs are ignored and rebuilt by the documented commands.

Run `MLAI_KEEP_RELEASE=1 bun run verify:clean-install` to retain a separately installed source snapshot, locked Node/Python dependencies, and production build under `.data/releases/mlai-clean-*`. Its exact path and source hashes are written to `docs/verification/clean-install.json`. The verifier includes new, non-ignored package sources, excludes generated `next-env.d.ts`, and refuses to report success if executable source changes during verification. It reuses dependency/model caches and the verified Tika jar; this is not an offline dependency-distribution bundle. Fixture accounts stay in the separate installation.

Release receipts hash application code, shared UI, configuration, tests, agent definition, and lockfiles. Documentation and acceptance receipts are excluded from the runtime hash so evidence can be recorded afterward. `docs/verification/release-artifact.json` identifies the accepted combined release and local handoff. Generated outputs, private records, secrets, and dependencies are not committed.

The current frozen release is already running on port 3100. After stopping that launcher, restart this exact snapshot from the canonical repository root with:

```sh
APP_URL=http://127.0.0.1:3100 \
MLAI_DATA_DIR="$PWD/.data" \
MLAI_CONNECTIONS_FILE="$PWD/.data/connections.json" \
MLAI_TIKA_JAR="$PWD/.tools/tika-app-3.3.2.jar" \
NEXT_DIST_DIR=.next bun run --cwd .data/releases/mlai-clean-rG7B8J start
```

This explicitly uses the main installation's records and connections, rather than the snapshot's isolated verification fixtures. The current launch metadata and logs are `.data/local-release.json` and `.data/local-release.log`. The launcher is not installed as a login service.

## Abbey development agent

`.claude/agents/abbey.md` is the project-scoped Claude Code development agent. Start Claude Code from this repository with `claude --agent abbey` to select it. It follows the repository's authorization, local-model, source-citation, privacy, and evidence rules. It is separate from the in-app Abbey chat assistant and from in-app autonomous agent runs, which propose every change for explicit confirmation before anything is applied.
