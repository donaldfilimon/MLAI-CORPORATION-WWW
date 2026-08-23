# MLAI "Lab" UI — conventions for building with this design system

These are the shadcn-style primitives behind the MLAI Corporation site, styled with the
**"Lab"** brand: **cyan** primary on a **near-black ink** canvas (`--background` ≈
`oklch(0.07 0.012 260)`), with **violet / emerald / amber** as fixed persona accents and a
**Spectral serif** display face (`--font-display`) on headings. Body text is **Geist**.

## Setup
- **No provider is required** for the primitives. Color comes entirely from CSS custom
  properties defined on `:root` in `styles.css` — the system is **dark-only** (there is no
  light theme; the `.dark` class only sets `color-scheme`). Render on a dark surface
  (`background: var(--background)`); components built for that canvas (Input, Select,
  Separator borders) look washed out on a white background.
- Import components from the bundle global, e.g. `import { Button, Card } from "<this DS>"`.
  All exports are also on `window.MlaiLab`.

## Styling idiom — Tailwind utility classes with semantic tokens
Components accept a `className`; compose layout with Tailwind utilities. **Prefer the
semantic token utilities over raw colors** so new UI stays on-brand:

| Concern | Utilities |
|---|---|
| Surfaces | `bg-background`, `bg-card`, `bg-muted`, `bg-popover` |
| Text | `text-foreground`, `text-muted-foreground`, `text-primary` |
| Primary action | `bg-primary` + `text-primary-foreground` (primary is **light cyan**, so its foreground is **dark**) |
| Borders / focus | `border-border`, `border-input`, `ring-ring` |
| Status | `text-destructive`, and the `cyan-500` / `yellow-500` ramps for success / warning |
| Persona accents | `cyan` (Abbey), `violet`, `emerald`, `amber` Tailwind ramps |
| Radius / type | `rounded-md` (token `--radius`), `font-display` (Spectral) for headings |

Don't hardcode hex; reach for `bg-primary`/`text-muted-foreground`/`border-border` etc.

## Where the truth lives
- `styles.css` (imports `_ds_bundle.css`) — the full token set and compiled utilities.
- `<Name>.d.ts` — the prop contract; `<Name>.prompt.md` — per-component usage.

## Idiomatic snippet
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from "<this DS>";

<Card className="max-w-sm">
  <CardHeader>
    <CardTitle>WDBX store</CardTitle>
    <CardDescription>Durable vector / block memory.</CardDescription>
  </CardHeader>
  <CardContent className="flex items-center gap-2">
    <Badge variant="success">healthy</Badge>
    <span className="text-sm text-muted-foreground">1,204 vectors</span>
  </CardContent>
  <CardFooter className="gap-2">
    <Button size="sm">Open</Button>
    <Button size="sm" variant="outline">Compact</Button>
  </CardFooter>
</Card>
```

## Notes
- **Compound components** (Card, Alert, Dialog, Select, Tabs, Accordion, DropdownMenu) are
  composed from named parts (`CardHeader`, `AlertTitle`, `SelectItem`, `TabsTrigger`, …) —
  all exported. Overlay parts (Dialog/DropdownMenu/Tooltip) use Base UI and render their
  open state in a portal.
- Button variants: `default | secondary | outline | ghost | destructive | link`;
  Badge adds `success`; Alert adds `success | warning | destructive`.

## Two layers: primitives and section blocks

The primitives above are the `general` group. There is a second layer — the `site` group —
of **section-level blocks** for marketing and documentation pages. Build page sections from
these rather than re-deriving them from primitives:

| Purpose | Components |
|---|---|
| Page structure | `Section` (eyebrow + title + lead + children), `SplitSection` (sticky heading, prose right), `Eyebrow`, `Prose` |
| Cards & grids | `FeatureCard`, `DeepDive`, `IndexCard`, `PersonaCard`, `ThroughputCard` |
| Figures & data | `StatBlock`, `DataTable`, `SpecList`, `StepList`, `Glossary` |
| Editorial | `Callout`, `PullQuote`, `FAQList`, `NextUp`, `PublicationIndex` |
| Chrome & decoration | `AccentGlow`, `HeroBench`, `LogoMark`, `ProvTag`, `ProvLegend` |

### The product accent axis

Most `site` components take `accent?: "wdbx" | "abi" | "abbey"` (default `"wdbx"`), which
selects a ramp: **wdbx → cyan**, **abi → violet**, **abbey → emerald**.

**This is not the persona color axis.** Personas are fixed and different: Abbey is emerald,
Aviva is violet, Abi is **cyan**. The *product* named "abi" is violet; the *persona* named
"Abi" is cyan. Pick the axis that matches what you are labeling — `PersonaCard` takes
`personas` keyed `abbey | aviva | abi` and applies the persona colors, not the accents.

### Provenance is mandatory on figures

Every published metric carries one of three classes — `measured` (reproduced on MLAI
hardware), `target` (an engineering goal, not achieved), `reported` (a cited figure) — and
they are **never conflated**. `StatBlock` and `ThroughputCard` *require* a `tag` on each
figure; `ProvTag` renders the chip and `ProvLegend` the explainer (`variant="inline"` is the
compact footer form). Never present a target as an achievement, and never invent
performance numbers — no QPS, latency, recall, or speedup figures without a real source.

### These components hold no content

Every `site` component takes its copy and data as props; none ships sample text or figures.
Supply real content at the call site. `NextUp` and `PublicationIndex` render plain `<a>`
elements by default and accept an optional `linkComponent` for client-side routing.

### Dark-only

There is no light theme. Render these on the ink canvas (`background: var(--background)`,
≈ `#05070d`) — components built for that canvas look washed out or invisible on white.
