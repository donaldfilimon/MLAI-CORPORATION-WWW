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
