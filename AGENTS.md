# AGENTS.md

Canonical guidance for this generated review artifact, not the MLAI source app.

## Ownership and regeneration

- `README.md` and `package.json` identify this as an export of canonical MLAI
  research. Do not hand-edit generated prose, HTML, PDFs, CSS, or JavaScript in
  `public/` to fix source behavior.
- Route source changes to the canonical MLAI repository and its
  `scripts/export-research.tsx`, as named in the README. That exporter is not
  present here; regeneration is not the local `build` command.
- `public/research-manifest.json` records source revision/dirty state, canonical
  origin, content hashes, publication attachments, and per-file hashes. Preserve
  provenance on regeneration; do not replace evidence with a new claimed hash.
- This artifact is distinct from the independent `mlai-website-app` application.
  Nothing here runs its accounts, private document pipeline, or WDBX gateway.

## Local command boundary

- `bun run build` compiles `src/filter.ts` to `public/assets/filter.js` (browser
  IIFE), then recursively removes `out/` and copies `public/` to `out/`. It does
  not validate research content or deploy. Never keep unique work in `out/`.
- `.openai/hosting.json` configures static hosting from `out/`; `.gitignore`
  excludes that directory. Changing hosting configuration is not a content edit.
- Package manager is bun (`bun.lock`). Do not add `package-lock.json`. `bun test`
  covers publication-filter logic; `bun run check` runs tests then a browser IIFE
  compile. There is no CI workflow.
- For documentation-only work, review the diff and use `git diff --check`.

## Static behavior

- `public/index.html` and `public/research/` contain the review pages;
  `research-data.json` is the structured collection and `assets/` is bundled locally.
- `src/filter.ts` is the filter source. `bun run build` emits
  `public/assets/filter.js`, which pages load with `defer`. It filters cards
  through `data-filter` and `data-publication-tag`; article links work without
  JavaScript.
- `public/robots.txt` disallows crawling. This is not authentication or a privacy
  boundary; hosting access control must be verified independently before sharing.
