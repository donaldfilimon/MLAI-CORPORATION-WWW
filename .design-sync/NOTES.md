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

## Run log — `/design-sync MLAI` (this run)

**Config audit: clean.** All 16 `componentSrcMap` paths resolve, `entry`
(`src/components/ui/index.ts`) exists and re-exports every mapped module, and the
barrel's 17th export (`toast`) is correctly a sub-part of `Toaster`, not a 17th card.
No drift since the last sync.

**Fixed: the CSS compile step is now in-repo.** `cfg.cssEntry`
(`.design-sync/lab-compiled.css`) was *missing* — the recipe was documented above but
the script lived only in the external converter checkout (`.ds-sync/compile-css.mjs`),
so a fresh clone could not regenerate it and every sync would report `[CSS_RUNTIME]`.
It's now `scripts/design-sync-css.mjs` (`bun run design-sync:css`): runs the repo's own
`@tailwindcss/postcss` over `src/index.css`, self-checks that OKLCH tokens *and* real
utilities came out, and exits non-zero if not. Output is 208 KB (matches the ~203 KB
recorded previously) and is gitignored — regenerate, never hand-edit or commit.

**Found + fixed a real token bug (accessibility).** Diffing every utility used by the
primitives against the compiled sheet surfaced `text-destructive-foreground` (used by
`badge.tsx` and twice in `toast.tsx`) resolving to **nothing**: `--destructive-foreground`
was never defined in `src/index.css`. Tailwind v4 emits no rule for an undefined theme
color, so the destructive Badge/Toast text silently inherited the light `--foreground`
— **2.7:1** on the light-red `--destructive` (`#ff5352`), failing WCAG AA. Added
`--destructive-foreground: oklch(0.15 0.02 25)` (dark ink → **6.2:1**), mirroring the
documented `--primary-foreground` reasoning, and re-exposed it via `@theme inline` per
the "update both" rule. Both dead utilities now emit.

**Guarded going forward.** `src/__tests__/design-sync.test.ts` (41 assertions) pins the
config against the filesystem and asserts every semantic token used by the primitives is
both defined in `:root` and re-exposed as `--color-*`. Mutation-checked: deleting the
token fails 2 assertions.

**Previews unaffected.** The 12 authored previews use inline `style={{}}`, not utility
classes, so they carry no dependency on Tailwind's content scanning — a good property,
keep it. The 4 floor cards (Dialog, DropdownMenu, Tooltip, Toaster) remain floor cards
for the portal reason recorded above.

**Not run here:** the converter itself (bundling, Playwright capture, card upload) — that
toolchain is external to this repo and unavailable in this environment. Everything above
is the repo-side half: config integrity, the compiled `cssEntry`, and the token fix the
capture would otherwise have rendered wrong.
