# MLAI platform

This repository is the local integration home for MLAI's active public
surfaces. It preserves the independent history and verification boundaries of
the production website, the Expo mobile companion, and Quasar while giving
them one discoverable layout and one coordination command.

## Repository map

| Path | Purpose | Native gate |
|---|---|---|
| `apps/web/` | Next.js 15 website, API routes, private console, Cloud Run deployment, and app-owned OpenTofu | `bun run check:web` |
| `apps/mobile/` | Expo SDK 53 mobile companion and native CloudKit module | `bun run check:mobile` |
| `apps/quasar/` | Independent nested Bun workspace for the local AI site builder | `bun run check:quasar` |
| `packages/contracts/` | Shared type vocabulary for product, persona, and claim provenance axes | `bun run check:topology` |
| `packages/design-tokens/` | Raw cross-platform Lab colors; semantic UI tokens remain app-local | `bun run check:topology` |
| `packages/tooling/` | Repository topology checks | `bun run check:topology` |

The former mobile `www/` subtree was a historical copy of the website. Its
history is retained by the merge, but the current implementation lives only at
`apps/web/`. Quasar remains a nested workspace because it has its own app,
service, shared package, template, lockfile, and acceptance flow.

## Setup and verification

Use Bun 1.4 or newer. Root tooling, web, mobile, and Quasar deliberately keep
separate lockfiles. This prevents Next's React 19.2 types from being hoisted
over Expo SDK 53's React 19.0 types (or vice versa).

```bash
bun run install:all
bun run check:topology
bun run check:web
bun run check:mobile
bun run check:quasar
# or run every gate in order
bun run check
```

Development entry points:

```bash
bun run dev:web
bun run dev:mobile
bun run dev:quasar
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
