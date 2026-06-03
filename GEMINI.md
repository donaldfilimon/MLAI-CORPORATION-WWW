@./skills/zig-017-modernization/SKILL.md
@./skills/swift-63-modernization/SKILL.md
@./skills/ai-tooling-sync/SKILL.md
@./skills/abi-codebase-audit/SKILL.md
@./skills/abi-refactor-architecture/SKILL.md
@./skills/abi-lsp-zig-workflow/SKILL.md
@./skills/abi-goals-roadmap/SKILL.md

# MLAI Corporation WWW

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

## Modernization Standards
- **Zig 0.17**: WDBX benchmarks in `src/components/wdbx-benchmark/charts.ts` should reflect latest engine performance
- **Swift 6.3**: Abbey AI benchmarks should reflect latest concurrency-safe framework metrics
- **Bun**: Always prefer Bun APIs (`Bun.file`, `Bun.serve`) over Node.js polyfills

## AI Tooling Sync
This project follows the global `ai-tooling-sync` skill. Durable instructions are synced via `GEMINI.md`.
Local skills are stored in `./skills/`.
