# Visual system consolidation — design

Date: 2026-09-07. Status: approved in chat (approach 3, tokens first). Scope:
the public marketing site only. The authenticated workspace shell is out of
scope.

## The problem, measured

Not "the site looks generic" — four specific, countable defects.

1. **Nine of ten public pages are one template.** `.marketing-hero`
   (`grid-template-columns: 1.2fr 1fr`, `globals.css:2081`) → `.feature-grid`
   (`1fr 1fr`, `:2103`) → `.next-up` (`1fr 1fr`, `:2346`), and all three
   collapse identically at `:2383`. Platform, Abbey, ABI, Architecture,
   Investors, Knowledge, Company and Repositories share one silhouette at
   every width. `/wdbx` no longer does, as of `0d631a7`.
2. **The token layer is bypassed.** 122 hardcoded hex literals across
   `globals.css` (78), `components.css` (35) and `base.css` (9), including a
   shadow palette of near-identical greys — `#c0c6cf`, `#c5ccd5`, `#b7c0cb`,
   `#b8c0cb` — that no token controls. `var(--radius)` is referenced **zero**
   times outside `tokens.css`.
3. **No scales.** Radius is spread across 5px (×15), 4px (×14), 3px, 6px,
   14px, 16px, 999px and 50%. Spacing is hand-tuned per component
   (9/19/22/23/47px). Eight breakpoint values are in use with no system.
   There are no type tokens at all, and three conflicting `h1` rules:
   `base.css:68` (48px), `.home-hero h1` (`clamp(40px,4.6vw,65px)`, −0.065em),
   `.marketing-hero h1` (`clamp(40px,4.8vw,56px)`, −0.015em).
4. **Two component systems disagree.** Tailwind began rendering on
   2026-09-07 (`f5aee14`), so shadcn primitives now coexist with the
   hand-written CSS: three chip treatments (`.claim-status`, `.prov-tag`,
   shadcn `Badge`) and two button systems (`.button` at 4px radius / 13px vs
   shadcn's `rounded-md` / 14px / 36px tall).

## What this design does not do

**No retint.** The Lab palette is already on `main`, `docs/design` pins the
near-black canvas, and the handoff names a `#00D4FF`/Sora/Manrope regression
as forbidden. The accents stay `--cyan #22d3ee`, `--purple #a855f7`,
`--green #34d399`. **No font change.** Spectral, Geist Sans and JetBrains Mono
are deliberate and verified loading (`document.fonts.check` returns true for
all three; the `h1` computes to `Spectral, Georgia, serif`). This is
consolidation, not a reskin — the identity problem is structural.

## Principles

1. **Provenance is the structure, not a chip.** The site's one honest
   differentiator is that every figure carries `measured ● / target ○ /
   reported ◆` and a pinned commit. Where a page has sourced evidence, that
   evidence leads. `/wdbx` is the built example.
2. **A device must encode something.** An accent belongs where its product is
   the subject. `/investors` cycling cyan→violet→emerald for
   "Thesis / Model / Evidence" encodes nothing and is decoration.
3. **One scale each** for radius, spacing and type — expressed as tokens, with
   the raw literals swept into them.

## Sequence

Ordered so the gate can only go red for one step at a time.
`tests/claims.test.ts` renders to static markup with no stylesheet, so it is
CSS-blind: steps 1–3 cannot break it. Only step 4 can.

**Step 1 — token authority.** Add type, radius and spacing scales to
`packages/ui/src/styles/tokens.css` `:root` (the authoritative sheet: it is
imported unlayered, so it beats Tailwind's `base`/`theme`/`utilities` layers).
Sweep the literals that duplicate an existing token onto that token — the
near-identical text greys are the clear case. A literal that is genuinely
one-off, such as a gradient stop or a single inset highlight, stays a literal;
the goal is one authority per *repeated* value, not the elimination of every
hex. Keep `@theme inline` as a derivation only.
Gate: `bun run build:ui` then `bun run check`.

**Step 2 — one type scale.** Resolve the three `h1` rules into one ramp and
repoint `.home-hero h1` and `.marketing-hero h1`. Blast radius is the ~60
descendant selectors in `globals.css` that shadow the element rules, plus the
`font:` shorthand sites that reset weight and line-height together and must be
unrolled before a size token fits.

**Step 3 — rhythm.** Normalize `.marketing-section`, `.system-section` and
`.public-container`; consolidate the eight breakpoints to the three the site
is actually tested at (390 / 768 / 1440) plus the nav's 900px collapse.

**Step 4 — page shape.** Give each page's most credible artifact the hero
slot, as `/wdbx` now has. This is the only step that touches JSX and therefore
the only one that can trip the claims gate. The eyebrow cull is part of this
step and is **not yet approved** — it changes copy on every page and needs its
own yes.

## Verification

Per step: `bun run build:ui` (mandatory after any `packages/ui/src/styles`
edit — the app reads `dist/`), then `bun run check`, then the browser suite in
one invocation. Zero horizontal overflow at 390 / 768 / 1440 is the standing
assertion. Screenshots under `docs/verification/screenshots/` are regenerated
by the e2e run and are git-tracked, so each run dirties the tree with binary
diffs; commit them with the step that caused them.

## Known traps

- `globals.css` must stay unlayered. Wrapping it in `@layer` demotes it below
  `layer(utilities)` and every Tailwind utility starts winning.
- `@source` in `index.css` scans the UI package's compiled output only, so a
  Tailwind utility written in the app's `src/**` produces no CSS and no error.
- `base.css` reduced-motion `transition: none !important` is unlayered, which
  for `!important` is the *lowest* priority. A `!transition-*` utility would
  win and break the reduced-motion assertion.
- `claims.test.ts` regex-scans markup: ArchitecturePage must not match
  `\d+\s*(ms|µs)`, so an inline `transition: "200ms"` there fails the gate.
- `.table-scroll` is load-bearing for both the claims gate and the 390px
  overflow assertion.
