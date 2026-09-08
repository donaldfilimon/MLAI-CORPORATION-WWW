# Vendored site reconciliation — design

Date: 2026-09-07
Status: approved (design), not yet planned

## Why

`vendor/` landed in `f5743ff` (PR #63) as the reconciled remains of seven
archives. It is staging, not product: nothing under it is built, linted,
tested, or deployed. This design folds the parts that carry real work into
`apps/web` and then deletes `vendor/` entirely. Git history keeps the
provenance; the manifest in `vendor/README.md` records where each payload came
from.

## Scope, and what was measured to fix it

Two payloads are in scope. The measurements that put them there:

- **Docs.** `vendor/mlai-review/content/docs/` holds 8 `.mdx` files totalling
  **18,929 characters** of prose. `apps/web`'s `/docs` renders from
  `src/data/categories/docs-nav.ts`, whose 9 `body` fields total **594
  characters**, median 61 — orientation blurbs, not documentation. The gap is
  the content itself, not the presentation.
- **Projects.** `vendor/mlai-review` serves `projects` and `projects/[slug]`
  from `lib/content.ts` (23,640 characters). `apps/web` has no `projects`
  route.

Two are deliberately out of scope:

- **`trust`** duplicates what `apps/web` already serves across `/security`
  (a 2,173-character view), `/privacy` and `/terms`. Porting it would add a
  fourth overlapping surface.
- **`brief`** is not a page. Its own metadata reads "Draft and export an idea
  locally. Nothing is submitted." — an interactive client-side tool with its
  own product and privacy implications. It is a feature request, and it is
  not this one.

`vendor/mlai-site` is superseded entirely: both its routes are catch-alls
(`[[...route]]`, `docs/[[...slug]]`) and it carries nothing
`vendor/mlai-review` does not, beyond an `.env.example`.

## Content model

**Convert the MDX to a TypeScript data module. Do not add an MDX toolchain.**

`apps/web` has no MDX pipeline — no `@next/mdx`, no `remark`/`rehype`, no
`gray-matter`, no contentlayer, no fumadocs. Every long-form surface in this
app already stores prose as structured TypeScript: `src/data/categories/blog.ts`
is 46,367 characters of `body: [{ heading?, paragraphs[] }]` validated by a zod
schema in `src/data/schemas.ts`. Adding an MDX build path to serve eight
documents would make the docs the only content in the app that works
differently.

So: a new `src/data/categories/docs.ts` exporting a `Docs`-typed array, with a
`DocSchema` added to `src/data/schemas.ts` beside `BlogSchema`:

```
slug        string          // "architecture", "wdbx", …
title       string
description string          // carried over from docs-nav's blurb
group       string          // "Start" | "Architecture" | "Operations" | …
body        DocSection[]    // { heading?: string; paragraphs: string[] }
```

`DocSection` mirrors `BlogSectionSchema`. Reuse it if it fits unchanged; add a
sibling only if the docs need a field blog does not.

**`docs-nav.ts` collapses into this module.** It exists today as a second
source of truth for the same eight subjects, and its header comment states the
descriptions are "not a parallel research/product corpus" — which this change
deliberately supersedes, because now they are. The nav becomes a projection
over `docs.ts` (group → items), so the sidebar, mobile contents, and search all
derive from one array. Note `docs-nav.ts` uses plain interfaces while `blog.ts`
uses zod; the new module follows the zod convention, since it is content.

## Routing

Add `app/docs/[slug]/page.tsx` and `app/docs/[slug]/client.tsx`, following
`app/blog/[slug]/` exactly rather than inventing a shape:

- `generateMetadata` delegating to a new `docMeta(slug)` in `src/lib/route-meta.ts`,
  beside the existing `blogMeta` and `researchMeta`.
- Structured data via `src/lib/structured-data.ts`.
- `generateStaticParams` over the eight slugs, so the docs prerender.

`/docs` remains, as an index over the corpus rather than the whole corpus
inlined. `src/views/Docs.tsx` is reworked to list documents and link out.

New routes register in `src/lib/route-meta.ts` and in
`scripts/generate-sitemap.ts` — `build` runs the sitemap generator before
`next build`, so an unregistered route ships without a sitemap entry and
nothing fails.

**Links use the existing `react-router-dom` shim.** That import is not a
missing dependency: `apps/web/tsconfig.json` aliases `react-router-dom` to
`src/lib/router-compat.tsx`, a deliberate compatibility layer from the
react-router → App Router migration, and ten components already import it.
New components follow the file they are modelled on. Migrating the app off the
shim is a separate job and must not be smuggled into this one.

## Search

`src/lib/docs-index.ts` builds `SearchRecord[]` from `docNav` + `research`
today, emitting `href: /docs#<id>`. It gets repointed at `docs.ts` and emits
`href: /docs/<slug>`. Research records are untouched.

`src/lib/docs-search.ts` and `src/components/DocsSearch.tsx` keep their
interfaces — the search UI and mobile nav ported in `0e2af60` survive this
change; they index real documents instead of blurbs. `src/__tests__/docs-search.test.ts`
extends to assert per-document hrefs and that every doc in the corpus is
reachable from the index.

This is the one place where the port adjusts work that landed hours earlier
rather than adding beside it. That is intended, and it is the cost the
per-document-URL decision buys.

## Projects

Port `vendor/mlai-review/lib/content.ts`'s project records into
`src/data/categories/projects.ts` under a zod `ProjectsSchema`, then add
`app/projects/page.tsx` and `app/projects/[slug]/{page,client}.tsx` on the same
pattern as docs above, registered in `route-meta.ts` and the sitemap.

`projects` is distinct from the existing `products/[slug]` and `showcase`
routes. If porting reveals that a project record duplicates a product or
showcase entry, the duplicate is dropped rather than served twice, and the
decision is recorded in the implementation ledger.

## Removal

The final task deletes `vendor/` — the whole directory, including
`vendor/README.md` and `vendor/.gitignore`. Nothing in the app may import from
`vendor/` before that point; the port copies content into `src/data`, it does
not reference the vendored trees at runtime.

## Verification

Per task, the three commands CI runs, from `apps/web`:

- `bun run lint` — `tsc --noEmit`, strict
- `bun run test` — `vitest run`
- `bun run build` — `bun scripts/generate-sitemap.ts && next build`

Acceptance for the whole change:

1. All eight documents render at `/docs/<slug>` and prerender via
   `generateStaticParams`.
2. `/docs` lists them; no document's prose is inlined there.
3. Search returns per-document hrefs, and a test asserts every doc in the
   corpus is reachable from the index.
4. `projects` and `projects/[slug]` render, and both appear in the generated
   sitemap.
5. `vendor/` does not exist.
6. `check:topology` and all three `apps/web` commands exit 0.

`scripts/crawl-links.mjs` exists and should be run once before the final
review; it catches routes that link to nothing.

## Known risk

The baseline gate has not been run in this checkout — it is a fresh clone with
no `node_modules`, so `bun install` must come first and the pre-change state
must be confirmed green before any task claims a regression. CI was green on
`f5743ff`, which is evidence for the branch point but not for this working
tree.
