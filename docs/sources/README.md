# MLAI source trees (reference only)

Consolidated 2026-09-16 from MLAI trees scattered across this machine. Nothing
here is built, linted, tested, or deployed. These directories preserve design
and prototype history. The live applications are under `apps/`. `SHA256SUMS`
records every file still present (regenerate it with the recipe under *Removals*).
The trees are content-complete rather than byte-complete: byte-identical copies
across trees were removed on 2026-09-16, each pointing at the copy that was kept.

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
| `nextjs-landing-20260916/` | `~/Downloads/Docs/2026-09-16-loose/files-2-mlai-nextjs-landing` (no git) | as filed 2026-09-16 | Next.js landing prototype (its `mlai-landing.tar.gz` was removed 2026-09-16, see below); also tarred in `~/at-risk-bundles/downloads-files2-nextjs-nogit-20260916.tar.gz` |
| `mlai-site-final/` | `~/Documents/files/mlai-site-final` (iCloud) | HEAD `9f81480` **plus uncommitted edits** (`ARCHITECTURE-VERIFICATION.md`, `components/ui.tsx`, `package.json`, `tests/brand.test.ts`) | Committed history is in `~/at-risk-bundles/documents-mlai-site-final-20260906.bundle` |
| `mlai-site-from-design/` | `~/Documents/files/mlai-site-from-design` (iCloud) | HEAD `d662a78` **plus untracked files** (`ARCHITECTURE-VERIFICATION.md`, `public/canvases.js`, `public/neural.js`, `public/og/README.txt`) | Committed history is in `documents-files-mlai-site-from-design-20260906.bundle` |
| `mlai-site-v2.4-static-export/` | `~/Documents/files/mlai-site-v2.4-static-export` (iCloud, zero-commit repo) | working tree | `mlai-site-v2.4-static-export.zip` and the `... 2` directory are exact subsets (they lack only `CLAUDE.md` and `DESIGN.md`) and were not imported separately |
| `mlai-site-v2.4-source/` | `~/Documents/files/mlai-site-v2.4.zip` | zip contents dated 2026-06 | Earlier source of `mlai-site-final` |
| `mlai-mobile-2/` | `~/Documents/mlai-mobile 2` (iCloud, no git) | working tree, 2026-08-27 | Older copy of `apps/mobile`; only `expo-env.d.ts` (generated) is absent there. `~/Documents/mlai-mobile` (git) was already fully contained in `origin/main` (`1cb2220`) and needed no import |
| `reference/MLAI-master-reference.md` | `~/Documents/files/MLAI-master-reference.md` | 2026-06-18 | Brand and product reference notes |

## Removals

- 2026-09-16: `nextjs-landing-20260916/mlai-landing.tar.gz` (70,404 bytes) was removed. All
  21 files it contained are present, byte-identical, under
  `nextjs-landing-20260916/nextjs-boilerplate/` (with the `.source` renames above). The
  tarball remains in git history (present through `fe41894`) and `SHA256SUMS` was
  regenerated without it.
- 2026-09-16 (later the same evening, on Donald's call): 23 files (224,399 bytes) that were
  byte-identical to a copy in another tree, or to the `nextjs-boilerplate/` project beside
  them, were removed. Each removed path is listed with its kept copy below; every pair was
  checked with `cmp` first. Removed files remain in git history through `a30722e`.
  Byte-identical files *within* one tree were kept because they are structural parts of that
  tree: `mlai-site-final/app/icon.svg` = `public/brand/mlai-mark.svg`, the static export's
  `404.html` = `404/index.html`, and its two sets of identical route chunks.

  | Removed | Kept copy |
  | --- | --- |
  | `design-handoff-vite-20260827/vendor/mlai-site/src/Logo.tsx` | `mlai-site-final/components/Logo.tsx` |
  | `design-handoff-vite-20260827/vendor/mlai-site/src/brand.ts` | `mlai-site-final/lib/brand.ts` |
  | `mlai-site-v2.4-source/lib/brand.ts`, `app/{globals.css,layout.tsx,not-found.tsx,robots.ts,sitemap.ts}`, `components/{HeroArt,HeroBench,PublicationIndex}.tsx`, `next.config.ts`, `postcss.config.mjs`, `public/og.png`, `tailwind.config.ts`, `tsconfig.json` | the same paths under `mlai-site-final/` |
  | `mlai-site-v2.4-static-export/og.png` | `mlai-site-final/public/og.png` |
  | `mlai-site-from-design/next-env.d.ts` | `mlai-site-final/next-env.d.ts` |
  | `nextjs-landing-20260916/{globals.css,layout.tsx,metrics.ts,next.config.ts,page.tsx}` | the same files under `nextjs-landing-20260916/nextjs-boilerplate/` (`src/app/`, `src/lib/metrics.ts`, `next.config.ts`) |

  `SHA256SUMS` recipe (run in this directory; it excludes itself and this README):
  `git ls-files | grep -v '^SHA256SUMS$\|^README.md$' | sed 's|^|./|' | LC_ALL=C sort | tr '\n' '\0' | xargs -0 shasum -a 256`

Other MLAI trees and why they have no directory here:

- `~/dev/active/mlai-website-app` (now `~/dev/archive/mlai-website-app-merged-20260916`; GitHub repo archived): merged with history into `apps/website-app`
  (see `docs/website-app-integration.md`).
- `~/dev/active/mlai-research-sites` (now `~/dev/archive/mlai-research-sites-merged-20260916`): merged with history into `apps/research-sites`.
- `~/dev/active/MLAI-CORPORATION-WWW`, `~/Downloads/files/MLAI-CORPORATION-WWW`,
  `~/Downloads/files (1)/MLAI-CORPORATION-WWW` and
  `~/dev/archive/mlai-website-pre-monorepo-20260824`: checkouts of this same
  repository. Their commits are ancestors of `main` or were already ported (the
  `files (1)` UX copy pass landed as `87e89e1`). Its two remaining commits only
  document that checkout itself. The loose `mlai-www-improvements.patch` series,
  `-full.tar.gz` snapshots and hero PNGs beside them are already in history
  (`7b18e1b`..`982cb13`, `1259bde`).
