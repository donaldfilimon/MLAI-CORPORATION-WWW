# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the canonical repository-wide map: the boundaries between the
four apps, the root commands, and what each gate does and does not prove.
Read it first, then the guidance for the surface you are changing. Do not
duplicate their detailed instructions here.

| Surface | Read before editing |
|---|---|
| `apps/web` | `apps/web/AGENTS.md`, `apps/web/CLAUDE.md`, and `apps/web/infra/README.md` for OpenTofu |
| `apps/mobile` | `apps/mobile/AGENTS.md`, `apps/mobile/CLAUDE.md` |
| `apps/quasar` | `apps/quasar/README.md` — this app has no `AGENTS.md` or `CLAUDE.md` |
| `apps/website-app` | `apps/website-app/AGENTS.md`, `apps/website-app/CLAUDE.md`, and `apps/website-app/README.md` |
| `packages/*` | that package's own `README.md` |

`apps/web` is the canonical production Next.js website; `apps/website-app` is
the independently configured local Next.js application. Other trees
by that name exist elsewhere on this machine (`~/CLAUDE.md` maps them), so
confirm which one a request means before editing.

## Root commands

The root is orchestration only. These are the scripts it owns; anything more
specific belongs to an app and runs from that app's own directory. Use Bun
1.4, never npm, pnpm, or yarn.

```bash
bun run install:all      # root packages, then web, mobile, quasar, website-app (non-frozen)
bun run check            # check:topology, check:workflows, check:tooling, then web, then mobile, then quasar, then website-app
bun run check:topology   # bun packages/tooling/src/check-topology.ts
bun run check:workflows  # pinned Actionlint 1.7.12 via Go (requires Go 1.25+)
bun run check:tooling    # repository wrapper regression tests
bun run check:web        # cd apps/web && lint && test && build
bun run check:mobile     # cd apps/mobile && typecheck && test && lint && expo export
bun run check:quasar     # cd apps/quasar && typecheck && test && expo export
bun run check:website-app # isolated data wrapper: db:migrate, then check
bun run dev:web          # also dev:mobile, dev:quasar, dev:website-app
```

`AGENTS.md` (*Gate boundaries*) records what each gate does and does not
prove, plus how to focus a single test in each app. Read it before reporting
any gate result: a green web gate is not mobile evidence, a green Expo export
is not a signed CloudKit run, and no local gate is a hosted deployment.

## Cross-app facts

Each of these takes several files to reconstruct, so they are recorded here
rather than inside one app's docs.

- **The test runner differs per app, and the wrong invocation fails quietly.**
  `bun run test` is Vitest in `apps/web` and Jest in `apps/mobile`; a bare
  `bun test` in either one invokes Bun's own runner instead and does not run
  the suite you meant. `apps/quasar` is the exception: its `test` script
  genuinely is `bun test packages`.
- **`check:topology` requires this file to exist.**
  `packages/tooling/src/check-topology.ts` lists root `AGENTS.md`,
  `CLAUDE.md`, and `README.md` among its required paths, so renaming or
  removing one fails the first gate in `bun run check`. It is an existence
  check only; it compiles no contracts and validates no content.
- **`@mlai/contracts` is a type-only vocabulary shared by two apps.** Web and
  mobile each consume it through a `file:../../packages/contracts` dependency,
  and every use in app source is an `import type`
  (`apps/web/src/components/site/accent.ts`,
  `apps/mobile/lib/brand.ts`, `apps/mobile/lib/theme.ts`). By contrast
  `@mlai/design-tokens` is imported by no app source at all: it holds raw
  cross-platform Lab colors while semantic tokens stay app-local, so a change
  there does not reach a running app on its own.
- **A green local `bun run check` does not prove CI's install step.**
  `.github/workflows/ci.yml` runs topology, web, mobile, quasar, and website-app as five
  independent jobs, each doing `bun install --frozen-lockfile` from its own
  app directory, while `install:all` is deliberately non-frozen. Lockfile
  drift therefore surfaces in CI and not locally.
- **`apps/web/site/` is a separately published artifact, not a build output.**
  GitHub Pages publishes it from `.github/workflows/pages.yml` with Actions as
  the source; the legacy `gh-pages` branch is retired and must not be
  recreated. Some brand assets exist in both `apps/web/public/` and
  `apps/web/site/`, and regenerating the `public/` copies does not touch the
  `site/` ones.

<!-- machine-git-policy -->
## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->
