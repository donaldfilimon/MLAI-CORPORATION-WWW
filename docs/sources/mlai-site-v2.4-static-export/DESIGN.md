# MLAI — Design Handoff

Component specs, states, and responsive behavior for engineering. Pairs with the design-system doc (tokens) and brand guidelines (logo/voice).

> **Scope note (this directory):** This file is the source-repo design handoff, kept here for
> reference. The components below (`components/Nav.tsx`, `components/ui.tsx`,
> `components/content.tsx`, `components/Logo.tsx`) live in the **source** project, not in this
> static export. Here the specs serve as a decoder ring for the rendered HTML/RSC — `.surface`
> cards, accent-tick eyebrows, the `<details>`-based FAQ, provenance tags, and accent tokens are
> all visible in the exported markup. Treat this as authoritative when editing the source.

---

## Layout grid

- Container: `max-w-6xl` (72rem), centered, `px-6` gutters.
- Section vertical rhythm: `py-20` to `py-24`.
- Prose measure: `max-w-2xl` body, `max-w-3xl` thesis/hero copy.
- Breakpoints (Tailwind): `md` 768px is the primary desktop/mobile fork; `lg` 1024px for 3-column grids.

---

## Component specs

### Nav (`components/Nav.tsx`) — client component
- **Desktop (≥md):** logo lockup left (`LogoMark` 28px + wordmark), inline links right, Contact as bordered button.
- **Mobile (<md):** logo left, hamburger right. Tapping opens a full-height sheet; body scroll locks; `Esc` and route-change close it; hamburger ↔ X morph.
- States: link `hover` brightens; active route gets accent text.

### Logo (`components/Logo.tsx`)
- `LogoMark size mono` — square glyph, `viewBox 0 0 48 48`. `mono` switches to `currentColor`.
- `Logo size mono className` — mark + wordmark, `gap-2.5`.
- Min size 24px; below that prefer mono.

### Section (`components/ui.tsx`)
- Props: `eyebrow`, `title`, `lead?`, `accent`, `children`.
- Eyebrow: mono uppercase, leading accent-tick (`h-px w-6` accent bar). Title: Sora `text-3xl→4xl`. Lead: `text-lg slate-400`, `max-w-3xl`.

### StatBlock
- Large metric (Sora, accent-colored), label (slate-400), provenance tag below.
- Provenance: ● measured (emerald) · ○ target (amber) · ◆ reported (violet).

### FeatureCard
- `.surface` card, title (Sora `text-lg` white) + desc (slate-400). Hover: `.surface-hover` lift.

### DataTable
- Header band (panel, mono uppercase), zebra rows (`bg-white/[0.015]` on odd), optional `highlightCol` accent-washed. Horizontal scroll on overflow at mobile.

### Prose (`components/content.tsx`)
- `max-w-2xl`, `text-[15px]`, `leading-[1.75]`, `slate-400`, `space-y-4`.

### SplitSection
- Grid `md:grid-cols-[0.4fr_0.6fr]`, `border-t border-line`, `py-12`.
- Left: kicker (mono + accent tick) + Sora `text-2xl` title. Right: `Prose`.
- **Mobile:** collapses to single column, label stacks above prose.

### DeepDive
- `cols` 2 or 3 → `md:grid-cols-2|3`. Each card: `.surface .surface-hover .accent-edge`, title + body + optional mono `meta` footer (border-top).
- **Mobile:** single column.

### StepList
- Ordered list of `.surface .accent-edge` rows. Each: numbered chip (`rounded-full`, accent-tinted bg) + title + body.

### FAQList — zero-JS
- Bordered container, `divide-line` rows. Each row is a native `<details>`; `summary` shows question + `+` glyph that rotates to `×` on `group-open`. Answer `max-w-2xl slate-400`.
- No JavaScript — progressive disclosure is native.

### Glossary
- `dl`, `md:grid-cols-2`. Each: `border-l-2 border-line pl-4`, mono term + slate-400 def.

### PullQuote
- `max-w-3xl`, accent left bar (`w-[3px] rounded-full`), Sora `text-2xl→[28px]` slate-200. No real-person attribution.

### NextUp
- Cross-link rail, 1–2 cards, each with label + desc + accent. Present on every page except `/contact` (terminal page) by design.

---

## Responsive rules (universal)

| Element | Desktop | Mobile (<md) |
|---|---|---|
| Multi-column grids | 2–3 col | 1 col |
| SplitSection | 0.4/0.6 split | stacked |
| Hero | two-column | stacked, art below |
| StatBlock row | 4-up | 2-up |
| Nav | inline links | hamburger sheet |
| DataTable | full | horizontal scroll |

---

## Motion

- Hover lifts (`translateY(-2px)`) and border brightening on surfaces.
- FAQ glyph rotation `+`→`×`.
- Hero benchmark terminal animates on the homepage.
- **All** wrapped in `prefers-reduced-motion: reduce` → no transforms, no transitions.

---

## Accent contract

Every accent-aware component takes `accent: "wdbx" | "abi" | "abbey"` and drives color through the `--accent` CSS variable (hex from `accentHex`). A page picks one accent and passes it down; the three never mix within a single page body.
