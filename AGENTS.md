# AGENTS.md — MLAI Corporation WWW

## Project Context
Production-grade website for MLAI Corporation. Built with React 19, Vite, and TailwindCSS (v4).
Server is a Bun-native Hono app handling WorkOS AuthKit and static file serving.

## Essential Commands
- `bun install` — Install dependencies
- `bun run dev` — Start Vite dev server (frontend, port 3000)
- `bun run build` — Build production SPA
- `bun server.ts` — Start Bun-native production server (port 3001)
- `./start_dev.sh` — Run both frontend and backend together (recommended for development)

## Critical Setup
- Copy `.env.example` to `.env` and fill in WorkOS credentials and session secret
- Type checking: `bun run lint` (runs `tsc --noEmit`)
- Environment: Requires Bun 1.1+ (preferred over Node.js)

## Architecture Overview
- **Frontend**: React 19 SPA in `src/` using `react-router-dom`
- **Backend**: `server.ts` (Hono/Bun) + `server/` (session management with iron-session)
- **Styling**: TailwindCSS v4 (via `@tailwindcss/vite`) + custom glassmorphism and utility classes (`.glass-card`, `.container-custom`, `.section-title`, etc.)
- **Auth**: WorkOS AuthKit integration via `src/lib/auth.tsx`
- **State**: `UIProvider` in `src/lib/ui-context.tsx` for global modals

## Development Notes
- Uses React 19 features including `useActionState` and Server Actions
- Global UI state managed through `UIProvider` component
- Design system upgraded (Phase 2) with `.glass-card` components replacing shadcn/ui Card wrappers, modular typography scale (--text-h0 through --text-h5), and consistent glassmorphism across all pages
- Benchmark charts use custom Canvas rendering (`src/components/wdbx-benchmark/`)
- SVG icons from Lucide React
- Animation via Framer Motion
- UI quirks: `Button` supports `asChild` prop to avoid nesting bugs; `Card`, `Dialog`, `Select`, `Input` use `min-w-0` and safe text wrapping for responsive scaling; dark theme set via `:root` tokens; `.dark` class only sets `color-scheme: dark` to avoid overriding MLAI palette
- Content: single source of truth at `src/data/content.ts` (services, research, blog, team, FAQ, platform, industries)

## Modernization Standards
- **Zig 0.17**: WDBX benchmarks in `src/components/wdbx-benchmark/charts.ts` should reflect latest engine performance
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics
- **Bun**: Always prefer Bun APIs (`Bun.file`, `Bun.serve`) over Node.js polyfills

## Verification
- Run `bun run lint` to verify no type errors
- Run `bun run build` to verify successful production bundling
- Note: Build still shows Node `[DEP0205] module.register()` deprecation warning from Vite/tooling; does not fail build
