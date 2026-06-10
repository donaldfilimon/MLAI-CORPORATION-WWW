# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bun-run Next.js 15 App Router site. Route entries live in `app/`, with API handlers under `app/api/*`. Client page implementations are in `src/views/` and are routed through `app/pages-client.tsx`. Shared UI and primitives live in `src/components/`, server helpers in `src/lib/server/`, hooks in `src/hooks/`, and structured site content in `src/data/categories/*`.

Tests are in `src/__tests__/`. Static assets are in `public/`. Scripts such as sitemap generation and smoke checks live in `scripts/`. The Vite/Hono/Rust migration paths are abandoned; do not revive retired stacks.

## Build, Test, and Development Commands

- `bun install` - install dependencies using the checked-in `bun.lock`.
- `bun run dev` - start the Next.js dev server on port `3000`.
- `bun run lint` - run TypeScript checking via `tsc --noEmit`.
- `bun run test` - run Vitest once.
- `bun run build` - regenerate the sitemap, then run `next build`.
- `bun run start` - serve the production build on port `3000`.
- `bun run crawl` / `bun run smoke` - run link crawl and API smoke scripts.

## Coding Style & Naming Conventions

Use TypeScript and React 19 patterns already present in the codebase. Prefer Bun tooling over Node/npm/pnpm. Keep components in PascalCase (`HeroScene.tsx`), hooks in camelCase with `use` prefixes, and data modules as lowercase domain files such as `blog.ts` or `products.ts`.

TailwindCSS v4 is the styling layer. Reuse existing utilities such as `.glass-card`, `.container-custom`, `.container-prose`, and `.section-y`. Brand colors are the Signal/Indigo palette; avoid reintroducing emerald/teal/cyan brand accents in site chrome.

## Testing Guidelines

Vitest is the test runner. Add focused tests in `src/__tests__/` using `*.test.ts` naming. At minimum, run `bun run lint` and `bun run test` before submitting. Run `bun run build` for route, metadata, sitemap, or production-impacting changes.

## Commit & Pull Request Guidelines

Recent history uses concise imperative summaries and Conventional Commit style where useful, for example `feat(server): ...` or `Polish Home and Showcase first impression`. Keep commits scoped and descriptive.

Pull requests should include a short summary, verification commands run, linked issues if applicable, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local setup. Do not commit secrets, local databases, or generated build folders. Admin reads require `ADMIN_EMAILS`; `ADMIN_REQUIRE_MFA=true` adds WorkOS MFA enforcement. External-facing copy must avoid unsupported benchmark, security, compliance, or scaling claims; frame unverified metrics as targets.
