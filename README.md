# MLAI platform

This repository is the local integration home for MLAI's active public
surfaces. It preserves the independent history and verification boundaries of
the production website, the Expo mobile companion, Quasar, and the local website application while giving
them one discoverable layout and one coordination command.

Current journey delivery and acceptance limits: [four-app delivery ledger](docs/four-app-journeys.md).

## Repository map

| Path | Purpose | Native gate |
|---|---|---|
| `apps/quasar-web/` | Next.js 16 website, API routes, private console, Cloud Run deployment, and app-owned OpenTofu | `bun run check:web` |
| `apps/mobile/` | Expo SDK 53 mobile companion and native CloudKit module | `bun run check:mobile` |
| `apps/quasar/` | Local AI site builder: service, shared package, Expo app, and a separately locked Next template | `bun run check:quasar` |
| `apps/website-app/` | Next.js local application, Abbey workspace, SQLite/Better Auth, Python worker, and agent package | `bun run check:website-app` |
| `apps/research-sites/` | Generated static export of the research collection; no dependencies | `bun run check:research-sites` |
| `packages/contracts/` | Shared type vocabulary for product, persona, and claim provenance axes | `bun run check:topology` |
| `packages/design-tokens/` | Raw cross-platform Lab colors; semantic UI tokens remain app-local | `bun run check:topology` |
| `packages/tooling/` | Repository topology and workflow checks | `bun run check:topology`, `bun run check:workflows`, `bun run check:tooling` |

The former mobile `www/` subtree was a historical copy of the website. Its
history is retained by the merge, but the current implementation lives only at
`apps/quasar-web/`. Quasar keeps its own app, service, shared package, template, and
acceptance flow under `apps/quasar/`.

## Setup and verification

Use Bun 1.4 or newer. Every app installs through one root Bun workspace with
one `bun.lock` and the isolated linker (`bunfig.toml`), so each app sees only
its own declared dependencies. The Next apps keep React 19.2 types and the
Expo apps keep SDK 53's React 19.0 types; [AGENTS.md](AGENTS.md) records the
two mechanisms that keep third-party declarations on the right copy. Only
`apps/research-sites` (no dependencies) and the Quasar template (its own
lockfile) stay outside the workspace.

```bash
bun run install:all      # bun install at the root
bun run check:topology
bun run check:workflows
bun run check:tooling
bun run check:web
bun run check:mobile
bun run check:quasar
bun run check:website-app
bun run check:research-sites
# or run every gate in order
bun run check
```

`check:workflows` runs pinned Actionlint 1.7.12 through Go (requires Go 1.25+
and network access on the first run; subsequent runs use the Go cache). It validates
workflow syntax and expressions, with optional ShellCheck and Pyflakes disabled.
`check:tooling` runs the repository wrapper regression tests. Both checks run in
the aggregate gate and the CI topology job.

Development entry points:

```bash
bun run dev:web
bun run dev:mobile
bun run dev:quasar
bun run dev:website-app
```

Read the app-local `README.md` and `AGENTS.md` before changing a surface. A
green web gate is not mobile evidence; a green Expo export is not a signed
CloudKit run; Quasar's unit suite is not a live Anthropic generation. Hosted
deployments and device/provider acceptance remain explicit, separate actions.

## Claims and identity contract

Public figures are always classified as `measured`, `target`, or `reported`.
The classifications are not interchangeable. Product accents and persona
colors are also different axes: the ABI product is violet, while the Abi
persona is cyan. Platform-neutral names live in `packages/contracts`; each app
owns its own rendering and detailed content source.

The integration lineage was reconciled with the production repository and
published on `main` through
[PR #31](https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/pull/31) on
2026-08-24. The web, mobile, and Quasar verification boundaries above remain
independent inside that published tree. Archiving any superseded local
checkouts is still a separate operator decision.

## Website application integration

`mlai-website-app` is integrated with its Git history under `apps/website-app/`.
Run its commands from that directory, or use the root wrappers above. It keeps
its shared UI package, SQLite migrations, Python worker and lock, and
non-deployable agent scaffold; its JavaScript dependencies are locked by the
root `bun.lock`. `apps/quasar-web` remains the canonical production
website with its existing deployment workflows.

Before the full website-app gate, follow [its setup guide](apps/website-app/README.md):
`bun run setup` installs Python/parser/model dependencies. The root gate migrates
the database serially before checking to avoid concurrent build migration races.
Both stages share a new temporary `MLAI_DATA_DIR`, removed on exit. An explicitly
supplied nonempty `MLAI_DATA_DIR` is used as supplied and never removed by the
wrapper; migration and checks can modify that directory.
CI runs its separate TypeScript/format/research/unit/build subset; parser and
browser acceptance remain local gates. Private databases, credentials, uploaded
documents, model weights and generated output are not part of the import.
See [the integration record](docs/website-app-integration.md) for source provenance
and validation. The source repository, `donaldfilimon/mlai-website-app`, was
archived read-only on 2026-09-16 after its history was merged here.
