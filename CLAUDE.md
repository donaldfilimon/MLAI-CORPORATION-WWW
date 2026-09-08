# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the canonical repository-wide map: the boundaries between the
three apps, the root commands, and what each gate does and does not prove.
Read it first, then the guidance for the surface you are changing. Do not
duplicate their detailed instructions here.

| Surface | Read before editing |
|---|---|
| `apps/web` | `apps/web/AGENTS.md`, `apps/web/CLAUDE.md`, and `apps/web/infra/README.md` for OpenTofu |
| `apps/mobile` | `apps/mobile/AGENTS.md`, `apps/mobile/CLAUDE.md` |
| `apps/quasar` | `apps/quasar/README.md` — this app has no `AGENTS.md` or `CLAUDE.md` |
| `packages/*` | that package's own `README.md` |

`apps/web` is the only Next.js site named MLAI in this repository. Other trees
by that name exist elsewhere on this machine (`~/CLAUDE.md` maps them), so
confirm which one a request means before editing.

<!-- machine-git-policy -->
## Git workflow (machine policy, 2026-08-27)

Work on the default branch in this canonical checkout. Do not create
branches or worktrees by default; they are for tasks that genuinely need
isolation, or when Donald asks. Any worktree or topic branch created here
must be merged back into this checkout's default branch, the worktree
removed, and the branch deleted, before pushing and before the task is
called done. Full policy: `~/.claude/CLAUDE.md` (*Git discipline*).
<!-- /machine-git-policy -->
