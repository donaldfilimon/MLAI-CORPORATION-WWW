# design-sync NOTES — MLAI-CORPORATION-WWW

This repo is a **Next.js app**, not a packaged design system. The sync targets the repo's
de-facto design system, built in **synth-entry mode** (no shipped `dist`/`.d.ts`) from a
purpose-built barrel: `src/components/ds.ts`, which re-exports **two layers**:

- `src/components/ui/` — 16 shadcn-style primitives (Button, Card, Dialog, …)
- `src/components/site/` — 24 section-level blocks (Section, StatBlock, ProvTag, …),
  harvested 2026-08-08 from the "MLAI Design System" / "MLAI Site Design System" Claude
  Design projects and re-tokenized onto the Lab brand.

`componentSrcMap` enumerates the card-worthy components so sub-parts (CardHeader,
DialogTrigger, …) stay in the bundle for composition without becoming separate cards.

## Gotchas

- **NEVER let the DS bundle reach Next's client runtime.** This is the single biggest trap
  in this repo. `src/lib/router-compat.tsx` (the `react-router-dom` alias) imports
  `next/link` + `next/navigation`, which read `process.env.__NEXT_*` **at module scope**.
  In the standalone DS bundle there is no Next runtime, so that throws
  `ReferenceError: process is not defined` during the IIFE — which kills **every** export,
  not just the router-using one. Symptom: `[BUNDLE_EXPORT] N/N not a component on
  window.MlaiLab` plus `[RENDER] root empty` on components that have nothing to do with
  routing. Cost a full build cycle on 2026-08-08.
  - The converter already defines `process.env.NODE_ENV`; that is **not** enough — Next
    reads a dozen other `__NEXT_*` vars.
  - Consequences, both deliberate: `LogoMark` lives in its own router-free module
    (`src/components/LogoMark.tsx`) so it can ship, while `Logo` (which links to `/`) is
    **excluded from the DS** and stays app-only. `NextUp` and `PublicationIndex` render a
    plain `<a>` and take an optional `linkComponent` prop instead of importing the shim.
  - **Before adding any component to `ds.ts`, check its transitive imports for
    `react-router-dom` / `next/*`.**
- **CSS must be recompiled before every sync build.** There is no shipped stylesheet, so
  `[CSS_RUNTIME]` fires unless we compile one: `node .ds-sync/compile-css.mjs` runs the
  repo's own `@tailwindcss/postcss` over `src/index.css` → `.design-sync/lab-compiled.css`
  (~216 KB), which `cfg.cssEntry` points at. The emitted utility set is derived by scanning
  source, so **any component added or restyled changes it** — a stale file silently ships
  components whose classes don't exist. The script is staged into the gitignored `.ds-sync/`,
  so it is recreated from this note on a fresh clone (it is ~30 lines: postcss + tailwind
  over `src/index.css`, `from:` set to the real path).
- **playwright pin drifts — verify, don't trust this file.** The cached chromium build was
  **1228** (playwright 1.61.0) in the prior run and is **1234** (playwright **1.62.0**) as of
  2026-08-08. Check `~/Library/Caches/ms-playwright/` (macOS — *not* `~/.cache/ms-playwright`)
  and match the release whose `browsers.json` pins that build, then install into `.ds-sync`
  with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`. A mismatch fails with
  `browserType.launch: Executable doesn't exist`.
- **Self-symlink loop**: `node_modules/mlai-corporation-www -> ..` (Bun-created) makes the
  converter's ts-morph `**/*.d.ts` glob recurse forever (ENAMETOOLONG). It was absent on the
  2026-08-08 run, but if a build dies with ENAMETOOLONG, `rm node_modules/mlai-corporation-www`
  and retry; `bun install` recreates it.
- **Fonts**: Geist (body sans) ships via `@fontsource`. Spectral (display serif, the Lab
  signature) + JetBrains Mono are Google-Fonts-served at runtime, so they are declared in
  `cfg.runtimeFontPrefixes` rather than shipped. If a future scope adds heading-heavy
  components, ship Spectral woff2 via `cfg.extraFonts` for full fidelity.

## Preview authoring conventions (this repo)

- **Wrap EVERY preview — both layers — in the Lab ink ground**:
  `<div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>`, hoisted to a
  module-level `const ink` per file with any `maxWidth` folded in.
  The converter's preview template hardcodes `body{background:#fff}` (`lib/emit.mjs` — do
  not fork it). This DS is **dark-only**, so without the wrapper `text-white` content is
  literally invisible: on the first 2026-08-08 capture FAQList rendered as an empty card,
  StatBlock's label line was absent entirely, and Accordion was near-illegible. Wrapping is
  the sanctioned fix and matches what the upstream mlai-site previews did.
  **A prior run recorded this as an accepted "known dark-canvas mismatch" — that framing is
  retired.** It is not a limitation to live with; it is a per-preview fix, and a preview
  missing it renders invisible rather than failing loudly, so it will not show up in any
  automated check. All 36 previews carry it as of 2026-08-08.

- **The ink object needs `color` and `fontFamily`, not just `background`.** The harness body
  sets `background:#fff` with **no `color`**, so text inherits black. A component that sets
  no text-color class of its own then goes from "black on white, washed out" to "black on
  near-black, **invisible**" — strictly worse. Use:
  ```js
  const ink = { background: "#05070d", color: "var(--foreground)",
                fontFamily: "var(--font-sans)", padding: 28, borderRadius: 12 };
  ```
  which reproduces `<body className="…text-text">` from `app/layout.tsx`. Verified
  color-inheriting primitives: **`ui/textarea.tsx`** (value text) and **`ui/label.tsx`**.
  `ui/input.tsx` sets `text-foreground` and is NOT affected — a batch report claimed
  otherwise; the grep is the authority. Most `site/` blocks set their own `text-*` classes
  and are unaffected, but include `color` anyway so the next component added can't regress.
- **Full-width compositions need `cardMode: "column"`.** Set for Section, SplitSection,
  DeepDive, StepList, DataTable, FAQList, Prose, Glossary, PublicationIndex, HeroBench,
  NextUp, SpecList. Without it, SplitSection's two-column sticky layout collapsed to a
  one-character-wide column of text in the grid cell.
- **Preview content is bound by the external-claims policy** (see `CLAUDE.md` and
  `docs/master-reference.md`). No invented QPS/latency/recall/speedup figures — the upstream
  components shipped several (`8.2ms p50`, `295×`, `95% recall`, a WDBX-vs-baseline table)
  and **none of them were carried over**. `StatBlock`/`ThroughputCard` require a provenance
  tag per figure; prefer countable facts or architecture facts.

### Capture-environment facts that shape what a preview can show

Folded from the 2026-08-08 four-batch preview run.

- **The capture viewport is 900×700 and `fullPage: false`** (`package-capture.mjs`), so
  anything past 700px is **silently clipped** — with `.section-y` (`py-20`) a band component
  lands near ~690px, so preview copy for `Section`/`SplitSection` has to stay short.
- **A wrapper `maxWidth` cannot trigger a `lg:` layout.** Tailwind breakpoints read the
  *viewport*, not the container. `SplitSection`'s two-column sticky layout (`lg:` = 1024px)
  and `DeepDive`'s `cols={3}` (`lg:grid-cols-3`) are both invisible at 900px — `Grid2` and
  `Grid3` rendered *identically*. The fix is `cfg.overrides.<Name>.viewport` (capture caps at
  2000); both now declare `"1280x900"`. Do **not** inject CSS to fake a layout the component
  doesn't actually produce at that width.
- **Previews must use inline `style={{}}`, not Tailwind classes.** `lab-compiled.css` is
  generated by scanning `src/` only, so a new utility class used in `.design-sync/previews/`
  gets no CSS at all and fails silently.
- **Grading must come last in the loop.** `preview-rebuild.mjs` clears a grade when a
  preview's contract changes, and an explicit `ov.viewport` is grade-keyed — so
  edit-all → rebuild → capture → *read the sheet* → grade.
- **`preview-rebuild.mjs` does not rebuild `_ds_bundle.js`.** A component whose *source* was
  fixed mid-session is still stale in the bundle, and previews get graded against the old
  behavior. This bit the `HeroBench` `animate` fix on 2026-08-08 (caught only by grepping the
  bundled function signature). After any source fix, run the full driver before final grading.

### Preview content rules learned the hard way

- **`src/data/categories/stats.ts` is NOT safe to lift preview copy from.** It is
  target-framed, but its entries are `295x`, `0.8ms`, `16.5k` — exactly the banned
  categories. Filter, never lift wholesale.
- **A bar is an assertion even with no number printed.** Every `ThroughputCard` row's `fill`
  must be proportional to the countable thing in its `value`; a persona-routing ladder with
  invented 0.42/0.34/0.24 fills was removed for implying a traffic split.
- **Provenance tags are easy to get wrong, including by the author of the component.** On the
  first pass a countable repo fact ("12 workspace crates") was tagged `target`, and a bare
  `O(log n)` was tagged `reported` with no citation. `measured` = countable/reproduced;
  `target` = a goal, say so in the note; `reported` = **cited**, so name the source.
- **Pair the accent with the layer the figure describes** — a retrieval figure carrying the
  `abbey` (agent-layer) accent reads as a miscategorization.
- **`LogoMark`'s `title` prop next to visible text is an a11y trap** — it double-announces.
  `Logo.tsx` omits it deliberately; only set `title` when the mark stands alone.

## Known render warns

- `[FONT_MISSING]` Spectral + JetBrains Mono — expected; the app serves them at runtime
  (`cfg.runtimeFontPrefixes`). The primitives render in Geist (shipped).
- **Floor cards (4, deliberate)**: Dialog, DropdownMenu, Toaster, Tooltip. Base UI portals
  their open state to `document.body`, so the open panel escapes the card, and hand-drawing
  a static lookalike is disallowed. Authorable if Base UI gains an inline/`keepMounted`
  render path, or via a portal-container override.

## Re-sync risks — what can silently go stale

1. **`lab-compiled.css` is generated and gitignored.** Regenerate it every run (above). If
   it is missing, `cfg.cssEntry` dangles and the bundle ships unstyled.
2. **`.ds-sync/compile-css.mjs` is gitignored too** — it is recreated from the description
   above, not restored from git. Consider promoting it into the durable set if it keeps
   being needed.
3. **The router trap re-arms itself.** Any new `site/` component that imports a link, or any
   refactor that pulls `router-compat` into an existing one, silently breaks the *entire*
   bundle. The failure looks unrelated to routing — read the first gotcha before debugging.
4. **playwright/chromium pin drifts with the machine's cache**, as it already did once.
5. **Preview grades follow their sources**, so the authored `.tsx` files and preview-affecting
   config carry forward; styling/bundle churn does not invalidate them. A `grade cleared` on a
   no-change run means a nondeterministic input — chase it.
6. `Logo` is deliberately absent from the DS (router). If someone "fixes" that by adding it
   back to `componentSrcMap`, the whole bundle dies — see gotcha 1.
7. **The ink-ground wrapper is a workaround repeated in all 36 previews.** Four independent
   batches converged on the same durable fix, and one located it exactly:
   `lib/emit.mjs:133` — `body{margin:0;padding:24px;background:#fff}` on the per-card preview
   document. `styles.css` is already linked there, so `background: var(--background)` would
   resolve to the real token with no new config key; the same string recurs at `emit.mjs:210`
   and `:516`, and two sibling light-theme constants on that template need the same pass
   (`.ds-cell{border:1px solid #e5e7eb}`, `.ds-cell>h4{color:#6b7280}`). Do **not** touch
   `package-capture.mjs:209` — that is contact-sheet chrome whose black label text depends on
   the white ground.
   **Still not implemented here, deliberately, for two reasons:** the skill names
   `lib/emit.mjs` as defining the output contract with the app's self-check and says not to
   fork it; and `.ds-sync/` is gitignored and re-copied from the skill on every run, so an
   edit there is silently reverted on the next sync. This belongs upstream in the converter.
   Until then every new preview must remember the wrapper, and a forgotten one renders
   invisible rather than failing loudly.
9. **`dark:` variants are dead in previews.** `src/index.css` defines
   `@custom-variant dark (&:is(.dark *))` and the app puts `.dark` on `<html>`, but the
   preview root has no such ancestor — so `dark:bg-input/30` (Input/Textarea/Select field
   fills) and Tabs' `dark:data-active:bg-input/30` never apply. Fidelity gap, not a blocker:
   everything still renders legibly. The fix is a decorator/provider stamping `class="dark"`
   on the preview root, which would cover all 36 at once — same upstream conversation as (7).
10. **`Skeleton`'s `animate-pulse` is not frozen during capture**, so its cell's brightness
   varies run to run. A washed-out Skeleton cell may be capture phase, not a defect; the real
   fix is playwright's `animations: 'disabled'`.
11. **`pendingGrade` needs a second capture pass to settle.** It is computed at capture time,
   before grades exist, and `resync.mjs` gates on `pendingGrade === false`. The carry-forward
   branch refreshes it without re-screenshotting or clearing grades — so after grading, run
   `package-capture.mjs` once more. The documented loop stops one step short of this.
8. **Open API gaps deliberately left open**: `Glossary` has no variant prop (single-axis by
   nature, fine); `DataTable`'s `highlightCol={0}` is a documented no-op rather than an error.
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


## Retargeted to "MLAI Design System" (2026-08-20)

`projectId` moved from `c535eba1…` ("MLAI Lab UI Primitives") to
`6d97fa83-1224-4573-9c22-46f67ac46f3c` ("MLAI Design System") on Donald's explicit call:
one project is to hold both this repo's components and the mobile-app design layer
(8 `preview/mobile-*.html` cards + 6 `guidelines/` docs) synced there earlier the same day.

**Upload is WRITES-ONLY for this consolidation — no reconciliation deletes.** The target is
non-empty and holds material this repo does not produce (the mobile layer, `uploads/`, the
vision-trailer template, `Canvas.dc.html`). The standard reconciliation pass deletes every
remote path a sync's own bundle doesn't contain, which would destroy all of it. Merge intent
beats tidiness here; the cost is that genuinely stale files from earlier syncs linger.
If a future run wants the tidy behaviour, it must first confirm the non-repo material is
expendable — do not re-enable deletes silently.

**Converter availability changed.** The previous run recorded the converter toolchain as
"external to this repo and unavailable in this environment"; it is available now (shipped
with the design-sync skill), so an end-to-end build/verify/upload is possible for the first
time. Playwright is staged into the gitignored `.ds-sync/` and driven against the installed
Google Chrome via `DS_CHROMIUM_PATH`, so no browser binary is downloaded into the repo.

## First end-to-end run (2026-08-20) — what bit, and what to do next time

**Self-referential symlinks break the `.d.ts` walk. This is the trap of this repo.**
`lib/dts.mjs` globs `${root}/**/*.d.ts` with a `!**/node_modules/**` negation, but the
negation only *filters results* — fast-glob still **traverses**. This repo has npm
self-reference links (`<pkg>/node_modules/<pkg> -> ..`) which make traversal infinite; the
build dies with `ENAMETOOLONG: scandir` on a path repeating the package name ~25 times.
`root` is the repo root here because synth-entry mode has no `types` field to narrow it
(`findTypesRoot` falls through to `pkgDir`).

Two existed:
- `design-sources/variants/mlai-operating-system/node_modules/mlai-operating-system -> ..`
  — **deleted permanently**. `design-sources/` is gitignored with zero tracked files, and the
  link is npm-generated, so nothing was lost. It will come back if that scratch package is
  reinstalled.
- `node_modules/mlai-corporation-www -> ..` — the repo's OWN self-link. **Do not delete
  it**; npm manages it and app code may self-import. The build recipe is to unlink it, build,
  and restore it in the same command so it is restored even on failure:
  ```sh
  SL=node_modules/mlai-corporation-www; HAD=0
  [ -L "$SL" ] && unlink "$SL" && HAD=1
  node .ds-sync/package-build.mjs …; EXIT=$?
  [ "$HAD" = 1 ] && ln -s .. "$SL"
  exit $EXIT
  ```
  A cleaner permanent fix would be a `libOverrides` fork of `dts.mjs` that skips symlinked
  dirs, or a `publishConfig.types` narrowing `root` to `src/` — neither was needed to ship.

**Interactive `rm`.** The shell aliases `rm` to `rm -i`; with no tty it *silently skips the
delete and still exits 0*, so a `rm x && echo done` chain lies. Use `unlink` / `command rm -f`.

**No browser download needed.** `package-capture.mjs` honours `DS_CHROMIUM_PATH`; pointing it
at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` avoids Playwright's
chromium download. npm's blocked install-scripts warning for esbuild was benign — the binary
loaded fine.

**Result.** Build clean (40 components, 988 KB bundle, 36 authored previews reused, 4 floor
cards as documented). `package-validate.mjs` exit 0: 40/40 previews render, anchor matches
disk, styles.css closure resolves, 2 tokens missing (below threshold). Uploaded 216 files.

## Re-sync risks (watch-list for the next run)

- **The upload was WRITES-ONLY** (see the retarget section). The target therefore still holds
  files this repo does not produce and which no diff will ever reconcile: `components/lab/**`,
  `components/site/{Footer,Logo,Nav}`, `components/vendor/**`, `vendor/**`, `_ds/**`,
  `colors_and_type.css`, `_ds_manifest.json`, `SKILL.md`, `preview/**`, `assets/**`,
  `ui_kits/**`, `templates/**`, `uploads/**`. Some are genuinely stale prior-sync output
  (`components/lab/**` duplicates `components/general/**`); the rest is the deliberately
  preserved mobile/design layer. Cleaning the stale half requires an explicit decision — do
  not infer it from a diff.
- **The anchor now in the project describes THIS build.** Next re-sync can diff against it
  normally; the styleSha will change whenever `bun run design-sync:css` output changes, which
  re-verifies everything.
- **`.design-sync/lab-compiled.css` is gitignored and MUST be regenerated** before every build
  (`bun run design-sync:css`) — a stale one silently ships classes that don't exist.
- **Assumed toolchain**: node 26.7, bun 1.4, converter staged into `.ds-sync/` from the
  design-sync skill. The skill's scripts change; re-copy them every run rather than trusting a
  stale `.ds-sync/`.
