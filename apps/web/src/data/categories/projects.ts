import { ProjectsSchema, type Projects } from '../schemas';

/**
 * Ported from `vendor/mlai-review/lib/content.ts`'s `projects[]` (task 4 of
 * the vendor-reconciliation plan —
 * `.superpowers/sdd/2026-09-07-vendor-reconciliation/task-4-brief.md`). The
 * vendored `id` is renamed `slug`; every other field is carried verbatim
 * (curly apostrophes included) with two exceptions:
 *
 * Ruling A — `docsHref`: the vendored `docs` field was a bare article slug.
 * `abbey`/`gama` ported cleanly to `/docs/identity` and `/docs/gama`, but
 * `abi`/`wdbx` pointed at slugs (`runtime`, `wdbx`) this app never ported as
 * standalone doc routes — the existing `/docs` page already covers both
 * subjects (see `src/data/categories/docs-nav.ts`, whose `docNav` ids are
 * exactly `runtime` and `wdbx`). Those two resolve to the `/docs` page's own
 * anchors instead of a dead `/docs/<slug>` link.
 *
 * Ruling B — `source`: the vendored `source` field was a key into a separate
 * `sources` lookup map (`vendor/mlai-review/lib/content.ts`'s `sources`).
 * Resolved and inlined here as `{ title, url }` rather than porting a second
 * module — unlike the docs corpus's bare-string `sources` (no URLs, so
 * nothing to link), these ARE real repository URLs and are rendered as
 * links.
 *
 * Ruling C — `wdbx.limit`: the vendored text read "This website is not a
 * connected database and shows no live retrieval results," written about
 * the vendored review site and false when published on MLAI's own site.
 * Rewritten below to keep the disclaimer's substance without the
 * review-site framing. The other three `limit` fields are verbatim.
 */
const raw = [
  {
    slug: 'abi',
    name: 'ABI',
    kind: 'Local AI runtime',
    tagline: 'A runtime you can inspect.',
    description:
      'Nightly Rust foundations for local AI orchestration, semantic storage, and explicit capability reporting.',
    scope: [
      'Local AI service orchestration and runtime primitives.',
      'CLI and MCP interfaces described in the source.',
      'Capability reporting that distinguishes a fallback from native acceleration.',
    ],
    limit:
      'The README describes a nightly Rust workspace. It does not establish production LLM quality, autonomous browser execution, or blanket GPU acceleration. Its site benchmark samples are synthetic.',
    source: {
      title: 'ABI README',
      url: 'https://github.com/donaldfilimon/abi/blob/main/README.md',
    },
    docsHref: '/docs#runtime',
    glyph: 'layers',
  },
  {
    slug: 'wdbx',
    name: 'WDBX',
    kind: 'Semantic storage',
    tagline: 'Give retrieval a foundation.',
    description:
      'The semantic-storage work associated with ABI, with source-documented retrieval and persistence contracts.',
    scope: [
      'Ordered vector search and hybrid ranking described upstream.',
      'Repository-reported metadata, recovery and compaction contracts.',
      'Temporal graph snapshot restoration described in the README.',
    ],
    // Ruling C: rewritten to drop the review-site self-reference; substance
    // (no live retrieval results, not a connected database) preserved.
    limit:
      'The cited coverage is reported by the repository, not rerun here. Persistence may be skipped or fail. No live retrieval results are shown here; this is not a connected database.',
    source: {
      title: 'ABI README',
      url: 'https://github.com/donaldfilimon/abi/blob/main/README.md',
    },
    docsHref: '/docs#wdbx',
    glyph: 'database',
  },
  {
    slug: 'abbey',
    name: 'Abbey',
    kind: 'Companion & identity',
    tagline: 'A more thoughtful interface.',
    description:
      'The companion identity described in ABI’s source, with distinct interaction and governance roles.',
    scope: [
      'Abbey is described as the primary empathetic-polymath profile.',
      'Aviva is the direct expert mode, not a separately verified product.',
      'ABI supplies the orchestration and governance role in that description.',
    ],
    limit:
      'An identity specification is not evidence of a deployed model, independent intelligence, or consciousness. The companion repository is referenced by ABI; its current build was not independently assessed here.',
    source: {
      title: 'Abbey identity specification',
      url: 'https://github.com/donaldfilimon/abi/blob/main/docs/spec/abbey-core-identity.mdx',
    },
    docsHref: '/docs/identity',
    glyph: 'spark',
  },
  {
    slug: 'gama',
    name: 'Gama',
    kind: 'Swift UI framework',
    tagline: 'One tree. Many surfaces.',
    description:
      'A modular declarative UI framework in Swift, organized around scenes and a retained render tree.',
    scope: [
      'GamaCore organizes scenes, state, layout and events.',
      'The README describes terminal, Apple, WASM and C/Android integrations.',
      'MLIR and Embedded Swift are documented integration tracks.',
    ],
    limit:
      'These are documented integrations, not a blanket platform-support guarantee. Check the current source prerequisites and acceptance evidence for your target. Gama is separate from ABI’s Rust runtime.',
    source: {
      title: 'Gama README',
      url: 'https://github.com/donaldfilimon/gama/blob/main/README.md',
    },
    docsHref: '/docs/gama',
    glyph: 'command',
  },
];

export const projects: Projects = ProjectsSchema.parse(raw);
