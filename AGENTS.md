# AGENTS.md

This is the canonical MLAI integration guide; `CLAUDE.md` points here. Read the
app-local `AGENTS.md` for web/mobile and `apps/quasar/README.md` for Quasar.

## Boundaries

- `apps/web` is the canonical Next.js website. Do not restore the retired
  mobile `www/` snapshot or collapse the website into an Expo static mock.
- `apps/mobile` is the Expo companion. Preserve its native CloudKit versus
  encrypted-local fallback distinction and its signed-device acceptance gap.
- `apps/quasar` is an independent nested Bun workspace. Its service, Expo app,
  template, tests, and lockfile move together.
- `packages/contracts` contains names and types, not publishable benchmark
  values. App content sources remain authoritative for copy and figures.
- `packages/tooling` holds the topology gate: `check:topology` runs
  `bun packages/tooling/src/check-topology.ts`.
- The root is orchestration only. Run app-native gates independently and report
  their results independently.
- Do not add web or mobile to the root Bun workspace. Their React type graphs
  intentionally differ; each app owns its own lockfile and `node_modules`.
- `vendor/` holds site archives vendored verbatim on 2026-09-07. Nothing in it
  is built, linted, tested, or deployed; `check:topology` asserts required
  paths exist rather than forbidding extra ones, so a green root gate says
  nothing about it. `vendor/mlai-review` and `vendor/mlai-site` are two
  revisions of one standalone Next.js site, not patches against `apps/web`, so
  "the MLAI site" resolves to three trees in this repository. Inventory,
  provenance digests, and what was deliberately excluded: `vendor/README.md`.

## Commands

Use Bun 1.4 (`packageManager` and CI), not npm, pnpm, or yarn.

```bash
bun run install:all
bun run check            # aggregate gate: check:topology && check:web && check:mobile && check:quasar
bun run check:topology
bun run check:web
bun run check:mobile
bun run check:quasar

bun run dev:web          # cd apps/web && bun run dev
bun run dev:mobile       # cd apps/mobile && bun run start
bun run dev:quasar       # cd apps/quasar/apps/quasar && bun run start
```

For focused work, change into the affected app and follow its local docs. Never
claim CloudKit, Cloud Run, GitHub Pages, or a live Anthropic generation from a
local build alone.

## Gate boundaries

- `install:all` uses non-frozen installs; CI uses `bun install --frozen-lockfile`
  separately in web, mobile, and Quasar. Root workspaces contain only `packages/*`.
- `check:topology` only checks required paths exist; it does not compile contracts
  or validate content, lockfile drift, or app behavior.
- `check:web`: `lint` is `tsc --noEmit`, then Node-only Vitest, then sitemap/llms
  generation and Next build. From `apps/web`, focus with
  `bun run test src/__tests__/landing-page.test.ts`; do not substitute `bun test`.
- `check:mobile`: TypeScript, Jest in-band, Expo lint, Expo **web** export.
  From `apps/mobile`: `bun run test __tests__/cloud.test.ts --runInBand`.
- `check:quasar`: workspace typechecks, `bun test packages`, then Expo **web**
  export from `apps/quasar/apps/quasar`. From `apps/quasar`, focus with
  `bun test packages/service/src/paths.test.ts` (Bun's runner, unlike web/mobile).
- Quasar workspace globs are `packages/*` and `apps/*`; `templates/next-site`
  has its own lockfile and is not built by that aggregate gate.
- `dev:quasar` starts only the Expo app. Start the service separately from
  `apps/quasar` with `bun run --filter '@quasar/service' start`; see its README
  for the unauthenticated LAN listener and provider-dependent acceptance flow.

## Documentation

Root documents describe topology and cross-app rules. App documents describe
app architecture and commands. Avoid copying long app instructions into the
root; link to the authoritative file so the copies cannot drift.

<!-- machine-git-policy -->
## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->

## GitHub Pages

- **GitHub Pages** publishes the static companion in `apps/web/site/` via `.github/workflows/pages.yml` (Actions only). The legacy `gh-pages` branch is retired; do not recreate it for deploys.
