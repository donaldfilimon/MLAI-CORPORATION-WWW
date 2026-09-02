# AGENTS.md

This is the MLAI integration repository. Read the home operating charter first,
then this file, then the `AGENTS.md` inside the app you are changing.

## Boundaries

- `apps/web` is the canonical Next.js website. Do not restore the retired
  mobile `www/` snapshot or collapse the website into an Expo static mock.
- `apps/mobile` is the Expo companion. Preserve its native CloudKit versus
  encrypted-local fallback distinction and its signed-device acceptance gap.
- `apps/quasar` is an independent nested Bun workspace. Its service, Expo app,
  template, tests, and lockfile move together.
- `packages/contracts` contains names and types, not publishable benchmark
  values. App content sources remain authoritative for copy and figures.
- The root is orchestration only. Run app-native gates independently and report
  their results independently.
- Do not add web or mobile to the root Bun workspace. Their React type graphs
  intentionally differ; each app owns its own lockfile and `node_modules`.

## Commands

Use Bun, not npm, pnpm, or yarn.

```bash
bun run install:all
bun run check:topology
bun run check:web
bun run check:mobile
bun run check:quasar
```

For focused work, change into the affected app and follow its local docs. Never
claim CloudKit, Cloud Run, GitHub Pages, or a live Anthropic generation from a
local build alone.

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
