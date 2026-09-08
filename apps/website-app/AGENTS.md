# Repository Guidelines

Canonical project guidance; `CLAUDE.md` adds source-level detail and commands.

This is the MLAI website and local application, integrated under `apps/website-app`.
It remains an independent Bun workspace and runtime. `apps/web` is the canonical
production website. ABI, Abbey, and WDBX remain external services.

## Architecture

Next.js App Router and TypeScript run on Node.js. Bun manages packages and scripts. SQLite/Drizzle owns application persistence. Better Auth owns credentials and sessions. The background worker invokes the Python document pipeline. Source documents, models, database files, and secrets stay outside Git.

## Commands

Run `bun install --frozen-lockfile`, `bun run setup`, then `bun run dev`. Development builds the private shared UI package before starting the web process and persistent worker on loopback. `bun run check` covers shared UI ESM/declarations, types, unit tests, parser tests, and production build; `bun run test:e2e` covers browser workflows. Use `bun run format:check` for read-only formatting validation. Keep generated UI dist, Next output, and next-env.d.ts out of Git.

## Runtime traps

- `package.json` pins Bun 1.4.0 for package management; runtime scripts use
  `node --import tsx`. Use `bun run <script>`, not `bun scripts/<file>.ts`.
  Keep native `better-sqlite3` on Node and preserve `serverExternalPackages`.
- Run from this app directory (`apps/website-app`): migrations, Python entry points, and the gRPC
  protobuf resolve against cwd. `APP_URL` selects the launch port (default 3100).
- Importing `config.ts` creates private directories and an auth secret;
  importing `db.ts` opens SQLite and applies migrations. Set an isolated
  `MLAI_DATA_DIR` before dynamic server imports in tests or probes.
- `setup` performs downloads, Python installation, and database migration;
  it is not a read-only diagnostic. Python is constrained to >=3.11,<3.14 in
  `worker/pyproject.toml` and locked by `worker/uv.lock`.
- Application tables use numbered SQL migrations plus `drizzle/meta/_journal.json`;
  `schema.ts` only models Better Auth. Do not implement app schema changes there alone.
- `packages/ui/build.mjs` compiles files separately to preserve `use client`,
  copies styles, and emits declarations. App TypeScript excludes `packages/`.
- `check` excludes formatting, Playwright, and live integration/recovery acceptance.
  Playwright uses `tests/e2e`, one worker, port 3101 (`MLAI_E2E_PORT` overrides it), and UUID-isolated data/build
  directories; it refuses to reuse an existing server. Do not aim it at private live data.

## Required invariants

- Authorize workspace membership or explicitly assigned service engagement on every resource access, including downloads and citations.
- Local AI never silently falls back to hosted AI. Hosted processing requires a stored, explicit workspace choice.
- No raw prompts, document bodies, or secrets in operational traces. No fake successful generation or service requests.
- WDBX connections are workspace-exclusive and use the existing gRPC contract. No arbitrary shell or user-supplied service URL execution.
- Document deletion removes artifacts, index entries, embeddings, and derived interpretation. Historic citations show source removed.
- Staff roles are operator-assigned. Staff access to an engagement never grants access to unrelated customer AI data.
- Keep source extraction separate from generated interpretation. Label partial extraction and unavailable capabilities.

## Style and validation

Use two spaces, strict types, named React components, shared schemas, and `@/` imports. Keep server-only modules out of browser imports. Use the accepted design references in `docs/design`, the original SVG logo, and WDBX cyan / ABI violet / Abbey emerald accents. Test at 390, 768, and 1440 pixels.

Work on local `main`. Maintain `docs/IMPLEMENTATION.md` with evidence and remaining gaps. Do not claim release completion until functional, integration, persistence, and browser acceptance are recorded separately.

## Commits and reviews

This new repository uses descriptive imperative subjects, such as `feat: add document source inspection`. Keep commits scoped. For a review, explain the behavior change, affected workflows, validation results and linked issue; attach screenshots for visual changes. Do not commit private data, credentials, model weights or generated build output.
