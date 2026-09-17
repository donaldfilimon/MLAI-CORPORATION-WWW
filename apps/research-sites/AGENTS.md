# AGENTS.md

Canonical guidance for this generated review artifact, not the MLAI source app.

Since 2026-09-16 this artifact lives at `apps/research-sites` inside the MLAI
monorepo (`donaldfilimon/MLAI-CORPORATION-WWW`), merged with its full history
from the former standalone `~/dev/active/mlai-research-sites` checkout (kept at
`~/dev/archive/mlai-research-sites-merged-20260916`). The
exporter is `apps/web/scripts/export-research.tsx` in this same repository. Run
`bun run check:research-sites` from the repository root, or `bun run check` here.
This checkout's origin is `donaldfilimon/MLAI-CORPORATION-WWW`; the
`git.chatgpt-team.site` origin recorded in older notes belongs to the retired
standalone copy.

## Ownership and regeneration

- `README.md` and `package.json` identify this as an export of canonical MLAI
  research. Do not hand-edit generated prose, HTML, PDFs, CSS, or JavaScript in
  `public/` to fix source behavior.
- Route source changes to `apps/web` and its exporter,
  `apps/web/scripts/export-research.tsx`, in this same repository.
  Regeneration is that exporter, not the local `build` command.
- `public/research-manifest.json` records source revision/dirty state, canonical
  origin, content hashes, publication attachments, and per-file hashes. Preserve
  provenance on regeneration; do not replace evidence with a new claimed hash.
- This artifact is distinct from the independent `mlai-website-app` application.
  Nothing here runs its accounts, private document pipeline, or WDBX gateway.

## Local command boundary

- `bun run build` verifies the clean canonical manifest, exact file inventory,
  and every file hash, then recursively removes `out/` and copies `public/`
  unchanged to `out/`. It verifies the copy too. It never repairs hashes or
  rewrites canonical browser code. Never keep unique work in `out/`.
- `.openai/hosting.json` configures static hosting from `out/`; `.gitignore`
  excludes that directory. Changing hosting configuration is not a content edit.
- Package manager is bun, and this artifact has **zero dependencies**: there is no
  `bun.lock` and no `node_modules`, because `bun install` deletes an empty lockfile.
  `bun test` and `bun build` are bun builtins and need no install step. Do not add
  `package-lock.json`, and do not reintroduce a dependency without a use for it —
  the previous `shadcn` devDependency pulled 81 MB of Babel for nothing and was
  removed. `bun test` covers historical filter logic and export packaging;
  `bun run check` runs tests then integrity-checked packaging. The root
  `.github/workflows/ci.yml` `research-sites` job runs `bun run check` here with
  no install step. This directory is not a root Bun workspace member.
- For documentation-only work, review the diff and use `git diff --check`.

## Static behavior

- `public/index.html` and `public/research/` contain the review pages;
  `research-data.json` is the structured collection and `assets/` is bundled locally.
- Canonical `apps/web/scripts/research-discovery.js` is exported as
  `public/assets/discovery.js`, loaded with `defer`. Historical `src/filter.ts`
  utilities remain tested but are no longer loaded by the exported pages.
  Article links work without JavaScript.
- `public/robots.txt` disallows crawling. This is not authentication or a privacy
  boundary; hosting access control must be verified independently before sharing.
