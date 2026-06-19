# design-sync NOTES — MLAI-CORPORATION-WWW

This repo is a **Next.js app**, not a packaged design system. The sync targets the
shadcn-style primitives in `src/components/ui/` (the de-facto design system), built in
**synth-entry mode** (no shipped `dist`/`.d.ts`): `--entry ./src/components/ui/index.ts`
bundles the real barrel; `componentSrcMap` enumerates the 16 card-worthy components so
sub-parts (CardHeader, DialogTrigger, …) stay in the bundle for composition but don't
become separate cards.

## Gotchas
- **Self-symlink loop**: `node_modules/mlai-corporation-www -> ..` (Bun-created) makes the
  converter's ts-morph `**/*.d.ts` glob recurse forever (ENAMETOOLONG). It is removed for
  the sync run and `bun install` recreates it. If a build dies with ENAMETOOLONG, `rm
  node_modules/mlai-corporation-www` and retry. Restore at the end with
  `ln -s .. node_modules/mlai-corporation-www` (or just run `bun install`).
- **CSS is Tailwind v4 utilities**, not CSS-in-JS. There is no shipped stylesheet, so
  `[CSS_RUNTIME]` fires unless we compile one. `.ds-sync/compile-css.mjs` runs the repo's
  own `@tailwindcss/postcss` over `src/index.css` → `.design-sync/lab-compiled.css`
  (203 KB, real Lab OKLCH tokens + every utility). `cfg.cssEntry` points at it.
  **Re-sync risk**: re-run the compile step before each build (utilities change as the app
  changes); the file is a generated artifact (gitignored under `.design-sync/.cache/`? no —
  it lives at `.design-sync/lab-compiled.css`; regenerate, don't hand-edit).
- **Fonts**: Geist (body sans) ships via `@fontsource`. Spectral (display serif, the Lab
  signature) + JetBrains Mono are Google-Fonts-served at runtime in the app, so they are
  declared in `cfg.runtimeFontPrefixes` rather than shipped. The `ui/` primitives render in
  Geist anyway (Spectral only hits raw h1–h3). If a future scope adds heading-heavy
  components, ship Spectral woff2 via `cfg.extraFonts` for full fidelity.
- **playwright**: cached chromium is build **1228** → use `playwright@1.61.0` (installed in
  `.ds-sync`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).

## Known render warns
- (none recorded yet)

## Preview authoring decisions (this run)
- **12 of 16 authored**; Dialog, DropdownMenu, Tooltip, Toaster left as **floor cards** —
  Base UI portals their open state to document.body, so the open panel escapes the card and
  hand-drawing a static lookalike is disallowed. Authorable later if Base UI gains an
  inline/keepMounted render path, or via a portal-container override.
- **Select** closed-trigger shows the raw `value` (Base UI resolves the item *label* only
  after the popup opens), so values are human-readable ("Abbey", not "abbey").
- **Dark-canvas mismatch (known)**: the converter's preview template hardcodes
  `body{background:#fff}` (lib/emit.mjs — do not fork). This DS is dark-only
  (`--background` ≈ oklch(0.07)), so components built for dark (Input/Label/Separator/Select
  borders + muted text) read faint on the white *capture* background. Tokens are correct
  (dark Cards, cyan Buttons, semantic Alerts prove the pipeline); on claude.ai/design's dark
  DS pane they render in their intended environment. If a future run wants dark captures,
  a portal-container / body-bg override would need an emit.mjs fork (currently avoided).

## Known render warns
- [FONT_MISSING] Spectral + JetBrains Mono — expected; app serves them at runtime
  (cfg.runtimeFontPrefixes). ui/ primitives render in Geist (shipped).
