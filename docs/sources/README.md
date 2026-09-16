# MLAI source trees (reference only)

Consolidated 2026-09-16 from MLAI trees scattered across this machine. Nothing
here is built, linted, tested, or deployed. These directories preserve design
and prototype history. The live applications are under `apps/`. `SHA256SUMS`
records every imported file as copied.

To keep these trees inert, nested agent guidance was renamed
(`CLAUDE.md` → `CLAUDE.md.source`, `AGENTS.md` → `AGENTS.md.source`) and nested
`.gitignore` files became `gitignore.source`. Dependency manifests and lockfiles
(`package.json`, `bun.lock`, `package-lock.json`) carry a `.source` suffix, so
GitHub's dependency graph and Dependabot don't treat these frozen prototypes
as live dependencies. Before that rename they raised 43 alerts. Dependency, build, `.git`, `.next`,
`.expo`, `.claude` and `.remember` directories were excluded. No source tree was
moved or deleted.

| Directory | Source | Revision / state | Notes |
| --- | --- | --- | --- |
| `design-handoff-20260827/` | `~/dev/archive/MLAI-design-handoff-20260827` | `git archive` of `6354d4b` (clean) | `.dc.html` design references and reference TSX; formerly `~/MLAI` |
| `design-handoff-vite-20260827/` | `~/Documents/files/design_handoff_mlai_site` (iCloud, no git) | working tree, 2026-08-27 | Vite build of a design handoff, including `vendor/`; distinct from the row above |
| `nextjs-landing-20260916/` | `~/Downloads/Docs/2026-09-16-loose/files-2-mlai-nextjs-landing` (no git) | as filed 2026-09-16 | Next.js landing prototype plus `mlai-landing.tar.gz`; also tarred in `~/at-risk-bundles/downloads-files2-nextjs-nogit-20260916.tar.gz` |
| `mlai-site-final/` | `~/Documents/files/mlai-site-final` (iCloud) | HEAD `9f81480` **plus uncommitted edits** (`ARCHITECTURE-VERIFICATION.md`, `components/ui.tsx`, `package.json`, `tests/brand.test.ts`) | Committed history is in `~/at-risk-bundles/documents-mlai-site-final-20260906.bundle` |
| `mlai-site-from-design/` | `~/Documents/files/mlai-site-from-design` (iCloud) | HEAD `d662a78` **plus untracked files** (`ARCHITECTURE-VERIFICATION.md`, `public/canvases.js`, `public/neural.js`, `public/og/README.txt`) | Committed history is in `documents-files-mlai-site-from-design-20260906.bundle` |
| `mlai-site-v2.4-static-export/` | `~/Documents/files/mlai-site-v2.4-static-export` (iCloud, zero-commit repo) | working tree | `mlai-site-v2.4-static-export.zip` and the `... 2` directory are exact subsets (they lack only `CLAUDE.md` and `DESIGN.md`) and were not imported separately |
| `mlai-site-v2.4-source/` | `~/Documents/files/mlai-site-v2.4.zip` | zip contents dated 2026-06 | Earlier source of `mlai-site-final` |
| `mlai-mobile-2/` | `~/Documents/mlai-mobile 2` (iCloud, no git) | working tree, 2026-08-27 | Older copy of `apps/mobile`; only `expo-env.d.ts` (generated) is absent there. `~/Documents/mlai-mobile` (git) was already fully contained in `origin/main` (`1cb2220`) and needed no import |
| `reference/MLAI-master-reference.md` | `~/Documents/files/MLAI-master-reference.md` | 2026-06-18 | Brand and product reference notes |

Other MLAI trees and why they have no directory here:

- `~/dev/active/mlai-website-app`: merged with history into `apps/website-app`
  (see `docs/website-app-integration.md`).
- `~/dev/active/mlai-research-sites`: merged with history into `apps/research-sites`.
- `~/dev/active/MLAI-CORPORATION-WWW`, `~/Downloads/files/MLAI-CORPORATION-WWW`,
  `~/Downloads/files (1)/MLAI-CORPORATION-WWW` and
  `~/dev/archive/mlai-website-pre-monorepo-20260824`: checkouts of this same
  repository. Their commits are ancestors of `main` or were already ported (the
  `files (1)` UX copy pass landed as `87e89e1`). Its two remaining commits only
  document that checkout itself. The loose `mlai-www-improvements.patch` series,
  `-full.tar.gz` snapshots and hero PNGs beside them are already in history
  (`7b18e1b`..`982cb13`, `1259bde`).
