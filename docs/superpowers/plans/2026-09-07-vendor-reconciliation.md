# Vendored Site Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the two payloads under `vendor/` that carry real work — five documentation subjects and the projects directory — into `apps/web`, then delete `vendor/`.

**Architecture:** TypeScript-to-TypeScript. `vendor/mlai-review/lib/content.ts` is already typed content; its `articles[]` and `projects[]` become zod-validated data modules under `apps/web/src/data/categories/`, served by App Router routes modelled on the existing `app/blog/[slug]/`. No MDX toolchain is added — the `.mdx` files in the vendored tree are generated artifacts and say so in their own header.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), zod, vitest, bun.

**Spec:** `docs/superpowers/specs/2026-09-07-vendor-reconciliation-design.md`

## Global Constraints

- All commands run from `apps/web/` unless stated otherwise.
- The gate is three commands, all of which CI runs: `bun run lint` (`tsc --noEmit`, strict), `bun run test` (`vitest run`), `bun run build` (`bun scripts/generate-sitemap.ts && next build`).
- **Do not modify** `src/views/Docs.tsx`, `src/data/categories/docs-nav.ts`, `src/components/DocsSearch.tsx`, or `src/lib/docs-search.ts`. The existing `/docs` page carries ~34,808 characters of prose and its search landed in `0e2af60`; this work is additive to both.
- **Do not add dependencies.** No `@next/mdx`, `remark`, `rehype`, `gray-matter`, contentlayer or fumadocs.
- `react-router-dom` is a `tsconfig.json` path alias to `src/lib/router-compat.tsx`, not a missing package. New components import from `react-router-dom` exactly as the file they are modelled on does.
- Port from `vendor/mlai-review/lib/content.ts`. Never from `vendor/mlai-review/content/docs/*.mdx` — those are generated.
- Prose is ported verbatim except for the four self-referential sentences named in Task 1 Step 3. Do not otherwise rewrite copy.
- `vendor/` must not be imported at runtime by anything in `apps/web`. Content is copied into `src/data`, not referenced.

---

### Task 1: Doc schema and data module

**Files:**
- Modify: `apps/web/src/data/schemas.ts`
- Create: `apps/web/src/data/categories/docs.ts`
- Modify: `apps/web/src/data/index.ts`
- Test: `apps/web/src/__tests__/docs-data.test.ts`

**Interfaces:**
- Consumes: `BlogSectionSchema` from `src/data/schemas.ts`.
- Produces: `DocSectionSchema`, `DocsSchema`, `type Doc`, `type Docs` in `src/data/schemas.ts`; `export const docs: Docs` in `src/data/categories/docs.ts`, re-exported from `src/data/index.ts` as `docs`.

- [ ] **Step 1: Establish the baseline is green before changing anything**

This is a fresh clone with no `node_modules`. A regression cannot be attributed without a known-good starting point.

```bash
cd apps/web && bun install
bun run lint && bun run test
```
Expected: both exit 0. If either fails, STOP and report — the failure is pre-existing and is not yours to absorb.

- [ ] **Step 2: Add the schemas**

In `apps/web/src/data/schemas.ts`, after `BlogSchema`:

```ts
export const DocSectionSchema = BlogSectionSchema.extend({
  /** Vendored Section.note — an aside the blog shape has no home for. */
  note: z.string().optional(),
});

export const DocsSchema = z.array(z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  group: z.string(),
  body: z.array(DocSectionSchema).default([]),
  sources: z.array(z.string()).default([]),
}));

export type DocSection = z.infer<typeof DocSectionSchema>;
export type Docs = z.infer<typeof DocsSchema>;
export type Doc = Docs[number];
```

- [ ] **Step 3: Write the failing test**

Create `apps/web/src/__tests__/docs-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { docs } from "@/data/categories/docs";
import { DocsSchema } from "@/data/schemas";

const EXPECTED_SLUGS = [
  "getting-started",
  "architecture",
  "identity",
  "gama",
  "evidence",
] as const;

describe("docs corpus", () => {
  it("validates against DocsSchema", () => {
    expect(() => DocsSchema.parse(docs)).not.toThrow();
  });

  it("contains exactly the five ported subjects", () => {
    expect(docs.map((d) => d.slug).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("does not port runtime or wdbx, which /docs already covers", () => {
    const slugs = docs.map((d) => d.slug);
    expect(slugs).not.toContain("runtime");
    expect(slugs).not.toContain("wdbx");
  });

  it("carries no review-site self-reference", () => {
    const prose = docs
      .flatMap((d) => [d.title, d.description, ...d.body.flatMap((s) => [s.heading ?? "", ...s.paragraphs, s.note ?? ""])])
      .join(" ");
    expect(prose).not.toMatch(/this review|review site|this website/i);
  });

  it("gives every section a heading and at least one paragraph", () => {
    for (const doc of docs) {
      for (const section of doc.body) {
        expect(section.heading, `${doc.slug} section heading`).toBeTruthy();
        expect(section.paragraphs.length, `${doc.slug} paragraphs`).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 4: Run it to make sure it fails**

Run: `bun run test -- docs-data`
Expected: FAIL — cannot resolve `@/data/categories/docs`.

- [ ] **Step 5: Create the data module**

Create `apps/web/src/data/categories/docs.ts`. Port these five articles from `vendor/mlai-review/lib/content.ts`'s `articles[]` array, in this order, mapping each field:

| vendored | ported |
|----------|--------|
| `Article.slug` | `slug` |
| `Article.title` | `title` |
| `Article.description` | `description` |
| `Article.group` | `group` |
| `Article.sections[].title` | `body[].heading` |
| `Article.sections[].paragraphs` | `body[].paragraphs` |
| `Article.sections[].code` (a string) | `body[].code` as `[{ lang: "bash", file: undefined, ...}]` — match `BlogSectionSchema`'s code entry shape by reading it |
| `Article.sections[].note` | `body[].note` |
| `Article.sources` | `sources` |

Drop `Article.sections[].id` — the App Router page derives anchors from headings.

The five, with their groups:

- `getting-started` — group `Start here`, 3 sections
- `architecture` — group `Start here`, 3 sections
- `identity` — group `Systems`, 3 sections
- `gama` — group `Systems`
- `evidence` — group `Principles`

**Apply exactly these four copy fixes, and no others.** Each replaces review-site voice that would be false published on MLAI's own site:

1. `getting-started`, section "Use the project's validation gate", final paragraph — replace `The commands below come from documentation; they were not executed as part of this website build.` with `The commands below come from upstream documentation and were not executed in preparing this page.`
2. `identity`, section "Follow the evidence", final paragraph — replace `Its current build was not independently assessed in preparing this review.` with `Its current build was not independently assessed here.`
3. `evidence`, the section titled `What this review can establish` — retitle to `What source review can establish`.
4. `evidence`, the sentence `Testing this website can establish whether its own links, search, controls and layouts work in the tested browser.` — replace `this website` with `a website`.

Prefix the file with the standard data-module header comment used by `blog.ts`, and end with:

```ts
export const docs: Docs = DocsSchema.parse(raw);
```
where `raw` is the literal array. Parsing at module load means a malformed record fails the build, not a page request.

- [ ] **Step 6: Wire it into the data index**

In `apps/web/src/data/index.ts`, mirror how `blog` is handled: add `import { docs } from './categories/docs';`, add `export * from './categories/docs';`, and add `docs` to the exported `content` object.

- [ ] **Step 7: Run the tests**

Run: `bun run test -- docs-data`
Expected: PASS, 5 tests.

- [ ] **Step 8: Run the full gate**

Run: `bun run lint && bun run test`
Expected: both exit 0.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/data/schemas.ts apps/web/src/data/categories/docs.ts apps/web/src/data/index.ts apps/web/src/__tests__/docs-data.test.ts
git commit -m "feat(web): add the ported docs corpus as a validated data module"
```

---

### Task 2: Per-document routes and sitemap

**Files:**
- Modify: `apps/web/src/lib/route-meta.ts`
- Create: `apps/web/app/docs/[slug]/page.tsx`
- Create: `apps/web/app/docs/[slug]/client.tsx`
- Modify: `apps/web/scripts/generate-sitemap.ts`
- Test: `apps/web/src/__tests__/docs-routes.test.ts`

**Interfaces:**
- Consumes: `docs` from `@/data/categories/docs` (Task 1); `toNextMetadata`, `NOT_FOUND_META`, `RouteMeta` from `src/lib/route-meta.ts`.
- Produces: `docMeta(slug: string): RouteMeta` in `src/lib/route-meta.ts`; routes `/docs/<slug>` for the five slugs.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/__tests__/docs-routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { docs } from "@/data/categories/docs";
import { docMeta, routeMetadata, NOT_FOUND_META } from "@/lib/route-meta";

describe("doc routes", () => {
  it("gives every doc a title and description", () => {
    for (const doc of docs) {
      const meta = docMeta(doc.slug);
      expect(meta.title, doc.slug).toBeTruthy();
      expect(meta.description, doc.slug).toBeTruthy();
    }
  });

  it("returns the not-found meta for an unknown slug", () => {
    expect(docMeta("no-such-doc")).toEqual(NOT_FOUND_META);
  });

  it("leaves the static /docs route registered", () => {
    expect(routeMetadata["/docs"]).toBeTruthy();
  });
});
```

`NOT_FOUND_META` must be imported from `src/lib/route-meta.ts`. If it is not currently exported, export it — do not weaken the assertion to work around a missing export, and do not add a fallback expression to the `expect`. An assertion with a `?? <the value under test>` fallback passes unconditionally and is a defect.

- [ ] **Step 2: Run it to make sure it fails**

Run: `bun run test -- docs-routes`
Expected: FAIL — `docMeta` is not exported.

- [ ] **Step 3: Add docMeta**

In `apps/web/src/lib/route-meta.ts`, beside `blogMeta` (line ~235), following its exact shape:

```ts
export function docMeta(slug: string): RouteMeta {
  const doc = content.docs.find((d) => d.slug === slug);
  if (!doc) return NOT_FOUND_META;
  return {
    title: `${doc.title} | Quesar Documentation`,
    description: doc.description,
    ogType: "article",
  };
}
```

- [ ] **Step 4: Add the route**

Create `apps/web/app/docs/[slug]/page.tsx`, mirroring `app/blog/[slug]/page.tsx`:

```tsx
import { DocPage } from "./client";
import { docMeta, toNextMetadata } from "@/lib/route-meta";
import { content } from "@/data";

export function generateStaticParams() {
  return content.docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(docMeta(slug), `/docs/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DocPage slug={slug} />;
}
```

Create `apps/web/app/docs/[slug]/client.tsx`. Read `app/blog/[slug]/client.tsx` first and follow its conventions for the "use client" directive, not-found handling, and link imports. It renders one doc: title, description, then each `body` section as a heading, its paragraphs, its optional `list`, its optional `code` blocks and its optional `note`, then the `sources` list.

- [ ] **Step 5: Register in the sitemap**

`apps/web/scripts/generate-sitemap.ts` builds from a static route list and filters on `routeMetadata[...]?.noindex`. Add the five `/docs/<slug>` paths by mapping over the docs corpus rather than hardcoding them, so a sixth doc is picked up automatically.

- [ ] **Step 6: Run the tests and the build**

```bash
bun run test -- docs-routes
bun run build
```
Expected: tests PASS; build exits 0. Then confirm the sitemap actually gained the routes:

```bash
grep -c '/docs/' public/sitemap.xml
```
Expected: at least 5.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/route-meta.ts apps/web/app/docs apps/web/scripts/generate-sitemap.ts apps/web/src/__tests__/docs-routes.test.ts
git commit -m "feat(web): serve the ported docs at per-document URLs"
```

---

### Task 3: Extend the search index

**Files:**
- Modify: `apps/web/src/lib/docs-index.ts`
- Test: `apps/web/src/__tests__/docs-search.test.ts`

**Interfaces:**
- Consumes: `docs` (Task 1); `SearchRecord` from `src/lib/docs-search.ts`.
- Produces: no new exports — `buildDocsSearchIndex()` gains a third record source.

- [ ] **Step 1: Write the failing test**

Append to `apps/web/src/__tests__/docs-search.test.ts` (do not rewrite the existing tests):

```ts
import { docs } from "@/data/categories/docs";

describe("ported docs in the search index", () => {
  it("indexes every ported doc with a path href", () => {
    const index = buildDocsSearchIndex();
    for (const doc of docs) {
      const record = index.find((r) => r.href === `/docs/${doc.slug}`);
      expect(record, doc.slug).toBeTruthy();
      expect(record!.title).toBe(doc.title);
    }
  });

  it("still indexes the existing docs-nav sections as hash hrefs", () => {
    const index = buildDocsSearchIndex();
    expect(index.some((r) => r.href.startsWith("/docs#"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `bun run test -- docs-search`
Expected: the two new tests FAIL; the pre-existing tests still PASS.

- [ ] **Step 3: Extend the index builder**

In `apps/web/src/lib/docs-index.ts`, add a third source alongside the existing `docs` (from `docNav`) and `papers` arrays, and include it in the returned array:

```ts
const ported: SearchRecord[] = content.docs.map((doc) => ({
  slug: `docs:${doc.slug}`,
  title: doc.title,
  description: doc.description,
  group: doc.group,
  body: doc.body.flatMap((s) => [s.heading ?? "", ...s.paragraphs]).join(" "),
  href: `/docs/${doc.slug}`,
}));
```

Do not change the shape of the existing two sources.

- [ ] **Step 4: Run the tests**

Run: `bun run test -- docs-search`
Expected: PASS, including every pre-existing test in the file.

- [ ] **Step 5: Run the full gate and commit**

```bash
bun run lint && bun run test
git add apps/web/src/lib/docs-index.ts apps/web/src/__tests__/docs-search.test.ts
git commit -m "feat(web): index the ported docs alongside the existing sections"
```

---

### Task 4: Projects directory

**Files:**
- Modify: `apps/web/src/data/schemas.ts`
- Create: `apps/web/src/data/categories/projects.ts`
- Modify: `apps/web/src/data/index.ts`
- Modify: `apps/web/src/lib/route-meta.ts`
- Create: `apps/web/app/projects/page.tsx`, `apps/web/app/projects/client.tsx`
- Create: `apps/web/app/projects/[slug]/page.tsx`, `apps/web/app/projects/[slug]/client.tsx`
- Modify: `apps/web/scripts/generate-sitemap.ts`
- Test: `apps/web/src/__tests__/projects.test.ts`

**Interfaces:**
- Consumes: the same `toNextMetadata` / `NOT_FOUND_META` / `RouteMeta` used in Task 2.
- Produces: `ProjectsSchema`, `type Projects`, `type Project` in schemas; `export const projects: Projects`; `projectMeta(slug: string): RouteMeta`.

- [ ] **Step 1: Add the schema**

The vendored type is:

```ts
type Project = { id: string; name: string; kind: string; category: string;
  tagline: string; description: string; scope: string[]; limit: string;
  source: string; docs: string; glyph: string };
```

Add to `apps/web/src/data/schemas.ts`, renaming `id` to `slug` for consistency with every other route in this app:

```ts
export const ProjectsSchema = z.array(z.object({
  slug: z.string(),
  name: z.string(),
  kind: z.string(),
  category: z.string(),
  tagline: z.string(),
  description: z.string(),
  scope: z.array(z.string()).default([]),
  limit: z.string(),
  source: z.string(),
  docs: z.string(),
  glyph: z.string(),
}));
export type Projects = z.infer<typeof ProjectsSchema>;
export type Project = Projects[number];
```

- [ ] **Step 2: Write the failing test**

Create `apps/web/src/__tests__/projects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { projects } from "@/data/categories/projects";
import { ProjectsSchema } from "@/data/schemas";
import { projectMeta } from "@/lib/route-meta";

describe("projects corpus", () => {
  it("validates against ProjectsSchema", () => {
    expect(() => ProjectsSchema.parse(projects)).not.toThrow();
  });

  it("contains the four ported projects", () => {
    expect(projects.map((p) => p.slug).sort()).toEqual(["abbey", "abi", "gama", "wdbx"]);
  });

  it("states a limit for every project", () => {
    for (const p of projects) expect(p.limit, p.slug).toBeTruthy();
  });

  it("gives every project route metadata", () => {
    for (const p of projects) expect(projectMeta(p.slug).title, p.slug).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `bun run test -- projects`
Expected: FAIL — cannot resolve `@/data/categories/projects`.

- [ ] **Step 4: Port the data**

Create `apps/web/src/data/categories/projects.ts` from `vendor/mlai-review/lib/content.ts`'s `projects[]` — four records: `abi`, `wdbx`, `abbey`, `gama`. Map `id` → `slug`; carry every other field verbatim. End with `export const projects: Projects = ProjectsSchema.parse(raw);` and wire into `src/data/index.ts` as in Task 1 Step 6.

The `limit` field is a stated scope limitation on each project. Port it and render it — dropping it would turn a hedged claim into an unhedged one, which this repository's content rules forbid.

- [ ] **Step 5: Add routes and metadata**

Add `projectMeta(slug)` to `src/lib/route-meta.ts` following `docMeta` from Task 2. Add `"/projects"` to the `routeMetadata` map with a title and description. Create the index and detail routes following Task 2's structure, with `generateStaticParams` over the four slugs. Register `/projects` and the four `/projects/<slug>` paths in `scripts/generate-sitemap.ts`.

- [ ] **Step 6: Run the tests and the build**

```bash
bun run test -- projects
bun run build
grep -c '/projects' public/sitemap.xml
```
Expected: tests PASS; build exits 0; at least 5 sitemap hits.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/data apps/web/src/lib/route-meta.ts apps/web/app/projects apps/web/scripts/generate-sitemap.ts apps/web/src/__tests__/projects.test.ts
git commit -m "feat(web): add the projects directory"
```

---

### Task 5: Remove vendor/ and verify the whole change

**Files:**
- Delete: `vendor/` (entire directory)

**Interfaces:**
- Consumes: everything from Tasks 1-4.
- Produces: nothing.

- [ ] **Step 1: Prove nothing IMPORTS from vendor/**

The check is for a dependency, not a mention. Provenance comments naming
`vendor/mlai-review/lib/content.ts` are expected and must be kept — they are the
record of where the ported content came from, and git history resolves the path
once the directory is gone.

```bash
cd .. && grep -rnE "(from|require\()\s*['\"][^'\"]*vendor" apps packages --include='*.ts' --include='*.tsx' --include='*.mjs' | grep -v node_modules
```
Expected: no output. If anything matches, STOP — the port left a real runtime
dependency on staging.

Then confirm the mentions that DO remain are comments only, and say so in your
report:

```bash
cd .. && grep -rn "vendor/" apps packages --include='*.ts' --include='*.tsx' | grep -v node_modules
```
Expected at the time of writing: exactly three lines, all inside `/** */` blocks
— `apps/web/src/data/categories/projects.ts` (two) and
`apps/web/src/data/schemas.ts` (one). Do not delete them.

- [ ] **Step 2: Delete it**

```bash
git rm -r --quiet vendor
```

- [ ] **Step 3: Run the whole gate from the repository root**

```bash
bun run check:topology
cd apps/web && bun run lint && bun run test && bun run build
```
Expected: all exit 0.

- [ ] **Step 4: Check for dead links**

```bash
bun run crawl
```
Expected: no dead links to `/docs/*` or `/projects/*`. This script exists (`scripts/crawl-links.mjs`); if it needs a running server, start one per its own header comment.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove vendor/ now that its payloads are ported"
```

---

## Self-Review

**Spec coverage:** content model → Task 1; routing → Task 2; search → Task 3; projects → Task 4; removal → Task 5; verification → every task's gate step plus Task 5 Steps 3-4. The spec's "Known risk" (unverified baseline in a fresh clone) is Task 1 Step 1.

**Placeholders:** none. Every code step carries code; the two places an implementer must read an existing file first (`BlogSectionSchema`'s code-entry shape in Task 1 Step 5, `blog/[slug]/client.tsx` conventions in Task 2 Step 4) name the exact file and what to take from it, rather than deferring the decision.

**Type consistency:** `DocsSchema`/`Docs`/`Doc` and `ProjectsSchema`/`Projects`/`Project` are defined in Task 1 and Task 4 Step 1 and used unchanged afterwards. `docMeta` and `projectMeta` both return `RouteMeta`, matching `blogMeta`'s real signature at `route-meta.ts:235`. `SearchRecord` is unchanged, which is why Task 3 touches no interface.

**Known deviation from the spec:** the spec says `Section.code` is "a single `code` entry" without giving the shape, because `BlogSectionSchema`'s code array element was not fully read when the spec was written. Task 1 Step 5 instructs the implementer to read it. If it turns out `code` cannot represent the vendored strings, that is a real finding for the review loop, not something to work around silently.
