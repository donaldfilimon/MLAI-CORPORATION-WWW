# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bun-run Next.js 15 App Router site. Route entries live in `app/`, with API handlers under `app/api/*`. Client page implementations are in `src/views/` and are routed through per-route `app/<route>/client.tsx` re-exports (the "use client" boundary). Shared UI and primitives live in `src/components/`, server helpers in `src/lib/server/`, hooks in `src/hooks/`, and structured site content in `src/data/categories/*`.

Tests are in `src/__tests__/`. Static assets are in `public/`. Scripts such as sitemap generation and smoke checks live in `scripts/`. The Vite/Hono/Rust migration paths are abandoned; do not revive retired stacks.

Components come in two layers: `src/components/ui/` holds the shadcn-style primitives, and `src/components/site/` holds 24 section-level blocks built on them (Section, SplitSection, StatBlock, DataTable, SpecList, StepList, Callout, PullQuote, FAQList, Glossary, NextUp, PublicationIndex, ProvTag, ProvLegend, FeatureCard, DeepDive, Eyebrow, Prose, AccentGlow, PersonaCard, IndexCard, ThroughputCard, HeroBench). Build page sections from `site/`. Those components hold no content of their own — copy and figures arrive as props from `src/data/categories/*` — figures require a provenance tag of `measured`, `target`, or `reported`, and none of them depends on the router. Most take `accent?: "wdbx" | "abi" | "abbey"` mapping to cyan, violet, and emerald; that is the product axis, distinct from the persona colors, where Abbey is emerald, Aviva violet, and Abi cyan.

`FAQ.tsx` and `Stats.tsx` deliberately do not use `site/FAQList` and `site/StatBlock`; they overlap in subject rather than in job, and collapsing either would drop the animated accordion or the count-up and its section-level target framing. Never lift figures out of `src/data/categories/stats.ts` into a standalone card — they are publishable only inside that section's explicit target framing.

`src/components/ds.ts` is the barrel bundled for claude.ai/design by the design-sync flow. Nothing reachable from it may import `react-router-dom` or `next/*`: Next's client runtime reads `process.env.__NEXT_*` at module scope, which throws in a standalone browser bundle and takes every export down with it. `Logo` is excluded for that reason and `LogoMark` lives in its own router-free module. Check a component's transitive imports before adding it to the barrel.

The cinematic and design surfaces sit in their own top-level `src/` trees rather than under `src/components/`: `src/film/` holds the timeline engine, shared scenes, and the lazily-CDN-loaded neural-voice runtime, and `src/trailer/`, `src/mega/`, and `src/explainer/` are alternate cuts built on it; `src/design/` is the `/showcase/design` design lab. All of them are hosted by `src/components/CinematicShell.tsx`, and all are real imported source — distinct from the gitignored `ds-bundle/`.

Routing has one invariant worth preserving: every route needs a `routeMetadata` entry in `src/lib/route-meta.ts`, but it is added to `scripts/generate-sitemap.ts` only when it is not `noindex`. The six `noindex: true` routes (`/login`, `/signup`, `/console`, `/profile`, `/financial-model`, `/tf-pose-demo`) are intentionally omitted from the sitemap.

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

TailwindCSS v4 is the styling layer. Reuse existing utilities such as `.glass-card`, `.container-custom`, `.container-prose`, and `.section-y`. Brand colors are the **"Lab"** palette: cyan primary, blue/sky secondary, and violet/emerald/amber persona accents on a near-black ink canvas, with a serif (Spectral) display face. The indigo "Signal" identity is retired; do not reintroduce indigo/fuchsia for brand chrome.

## Testing Guidelines

Vitest is the test runner. Add focused tests in `src/__tests__/` using `*.test.ts` naming. At minimum, run `bun run lint` and `bun run test` before submitting. Run `bun run build` for route, metadata, sitemap, or production-impacting changes.

The suite runs in the `node` environment with no jsdom or DOM-testing setup, so it covers pure server and library logic only — one file per module, plus the policy-pinning `content.test.ts` (Zod schema, unique URL-safe slugs) and `workos-admin.test.ts` (fail-closed admin policy, MFA gating, open-redirect guard). Adding a component test means adding that environment first. Use `bunx vitest run <file>` or `bunx vitest run -t "<name>"` for a single test; do not use `bun test`, which invokes Bun's own runner instead of Vitest.

## Commit & Pull Request Guidelines

Recent history uses concise imperative summaries and Conventional Commit style where useful, for example `feat(server): ...` or `Polish Home and Showcase first impression`. Keep commits scoped and descriptive.

Pull requests should include a short summary, verification commands run, linked issues if applicable, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local setup. Do not commit secrets, local databases, or generated build folders. Admin reads require `ADMIN_EMAILS`; `ADMIN_REQUIRE_MFA=true` adds WorkOS MFA enforcement. External-facing copy must avoid unsupported benchmark, security, compliance, or scaling claims; frame unverified metrics as targets. `docs/master-reference.md` tags every metric **● measured** / **○ target** / **◆ reported** and those are never conflated — carry the tag forward when moving a figure into site copy. Apple is referenced only as "built on Apple's public frameworks," never as a partnership or endorsement.
