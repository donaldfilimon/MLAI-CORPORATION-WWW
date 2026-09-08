# MLAI — Marketing & Documentation Review

A working, independent review website and an accompanying Next.js/React source candidate. Created September 7, 2026. **Not deployed, not merged, and not a replacement for the existing Quesar website.**

## Open the working preview

Open **`MLAI-preview.html`** in a browser. It contains its styles, pages, search index, and interactions in one file; no package installation, account, or API key is required. Navigation uses fragment routes, so the file works without a hosting rewrite.

The `review/` directory also contains **18 pre-rendered routes and a 404 page**. To inspect that multi-page version with Node:

```sh
node scripts/serve-review.cjs
# Open http://127.0.0.1:8765
```

This loopback-only server serves a review export, not Next.js. It has no backend operations. Marketing and documentation remain readable without JavaScript in the multi-page export; enhancements and the single-file router require JavaScript.

## What is included

The site has a complete homepage, a searchable/filterable directory, ABI/WDBX/Abbey/Gama detail pages, nine documentation pages, an evidence ledger, an about page, and a local project-brief composer. Documentation includes local keyboard search, section anchors, copy controls, source references, and adjacent-page navigation. The brief can be generated, copied, and downloaded as actual plain text. Nothing is submitted.

The visual system uses a white editorial layout, graphite technical surfaces, restrained green actions, and a separate violet ABI product accent. It has responsive layouts, dark mode, reduced-motion behavior, visible focus styles, and keyboard-managed dialogs. No stock photos, font files, fabricated metrics, fake integrations, lead submissions, or analytics are included.

## Two different verification boundaries

**The HTML review works now.** It is exported from shared, pure TSX markup using a small review-only serializer, then enhanced with the same browser interaction module used by the Next source. The serializer is not React, and passing its tests does not verify hydration, React Server Components, Tailwind compilation, or Next routing.

**The Next.js application is an unbuilt integration candidate.** `app/` contains App Router pages, async route parameters, metadata, a 404/error path, no-index defaults, and an MDX-backed docs route. Fumadocs Core/MDX is used headlessly with the configuration/entry API and a custom documentation shell. CSS-first Tailwind tokens are in `app/globals.css`; the shared stylesheet is `app/site.css`.

This implementation uses native HTML controls. It does **not** claim an installed shadcn/Base UI, Motion, or Geist integration. Adding a headless-control library should be a small, separately verified change in the existing application, not an untested dependency badge.

The package manifest targets Next 16.3.4, React 19.2.6, Tailwind 4.3.3, Fumadocs Core 16.11.4, and Fumadocs MDX 15.0.7. These are explicit candidate versions informed by official documentation/manifests, **not a combination installed or security-audited in this environment**. No lockfile has been fabricated. The registry was unreachable here.

## Install and verify the Next candidate

Use an isolated checkout with Node 22.16 or newer and Bun. Review dependency changes and install-script permissions before running them. This does not run inside or modify the existing MLAI repository.

```sh
bun install
bun run content:check
bun run test
bun run lint
bun run typecheck
bun run build
bun run dev
```

Installation generates the `.source` entry files through Fumadocs. Review and commit the resulting lockfile only after compatibility/security review. Use a frozen install in CI **after** a real lockfile exists. A blocked lifecycle script may require rerunning the declared `postinstall` script after approval.

The production framework build, full type-check, ESLint run, real MDX compilation, RSC/hydration behavior, and deployment still need verification. Do not call this production-ready based on the review export.

## Content and source structure

```text
app/                     Next routes, metadata, error states, CSS
components/              Shared pure TSX layouts, pages, and primitives
components/enhance.tsx   Small Next client boundary
lib/content.ts           Canonical typed projects, articles, sources, claims
lib/logic.ts             Search, filters, brief validation/formatting
lib/enhance.ts           Abortable browser interaction lifecycle
lib/source.ts            Fumadocs server content adapter
content/docs/            Generated MDX; edit lib/content.ts instead
scripts/                 Review exporter, local server, content/syntax checks
tests/                   Node contracts and Chromium review checks
review/                  Pre-rendered, no-index review export
```

To edit content, change `lib/content.ts`, then run `bun run content:generate` and `bun run review:build`. Search, page text, navigation, and generated MDX share that source. Keep evidence scope and provenance intact. An upstream README describes a project; it is not an independently rerun benchmark.

## Data and indexing

The only optional stored preference is `mlai-theme`. Brief text remains in memory until explicitly copied or downloaded. Local search sends no queries. External source links leave this site and are governed by their destination. The preview does not connect to ABI, WDBX, model providers, WorkOS, Cloud SQL, GitHub writes, or a customer account.

Indexing defaults off. Set `SITE_INDEXABLE=true` and an explicitly reviewed `SITE_URL` only during an authorized production rollout. No unverified canonical domain is supplied. This flag is a deployment setting, not permission to publish.

## Verification and next integration step

See **`docs/VERIFICATION.md`** for the executed checks and limitations, and **`docs/INTEGRATION.md`** for a conservative integration path into the existing `apps/web` application. Browser evidence is supplied separately from source. No user's repository, machine, credentials, deployment, or DNS settings were changed.
