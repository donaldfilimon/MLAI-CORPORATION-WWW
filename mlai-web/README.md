# MLAI website

Next.js 16 · React 19 · Tailwind v4 · static export to `docs/` for GitHub Pages.

    bun install
    bun run dev        # http://localhost:3000
    bun run build      # -> docs/ + docs/.nojekyll
    bun run lint       # eslint (typescript-eslint, react-hooks, jsx-a11y)
    bun run typecheck  # tsc --noEmit
    bun run serve      # preview the built output

`lint`, `typecheck` and `build` are what CI runs — `.github/workflows/mlai-web.yml`
at the repository root, filtered to `mlai-web/**`. Note that `next lint` no longer
exists in Next 16; ESLint runs directly from `eslint.config.js`.

## Structure

    src/lib/brand.ts        facts — every metric carries provenance
    src/lib/content.ts      prose — introduces zero new numbers
    src/lib/tokens.ts       runtime token values (CSS mirrors in globals.css)
    src/components/ui/      primitives — Surface, Eyebrow, ProvTag, FAQ, CodeBlock
    src/components/viz/     ChipDiagram, ConventionalDiagram, LayerStack, FlowStrip
    src/components/         Nav, Footer, Palette, Mark
    src/app/                routes

Client components are exactly five: Nav, Palette, LayerStack, FlowStrip,
CodeBlock. Everything else renders on the server.

See NOTES.md before deploying.
