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

- `bun run build` executes a Node one-liner: recursively remove `out/`, then
  recursively copy `public/` to `out/`. It does not compile, validate content,
  run tests, or deploy. Never keep unique work in `out/`.
- `.openai/hosting.json` configures static hosting from `out/`; `.gitignore`
  excludes that directory. Changing hosting configuration is not a content edit.
- There are no dependencies, lockfile, dev server, test/lint/typecheck scripts,
  or CI workflows in this artifact. Do not install an application toolchain here.
- For documentation-only work, review the diff and use `git diff --check`.
  `node --check public/assets/filter.js` checks JavaScript syntax only.

## Static behavior

- `public/index.html` and `public/research/` contain the review pages;
  `research-data.json` is the structured collection and `assets/` is bundled locally.
- `assets/filter.js` progressively filters publication cards through
  `data-filter` and `data-publication-tag`; article links work without JavaScript.
- `public/robots.txt` disallows crawling. This is not authentication or a privacy
  boundary; hosting access control must be verified independently before sharing.
