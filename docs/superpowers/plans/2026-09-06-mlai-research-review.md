# MLAI Research Website and Private Sites Review

Approved implementation: extend the canonical Next website for partners/customers with the complete source-audited MLAI/ABI ecosystem corpus; publish a generated owner-only Sites companion. Do not push the canonical deployment branch or change public hosting.

## Requirements

- Preserve 12 existing article slugs and both original PDF URLs; audit against current source.
- Six areas: AI/Abbey, WDBX, SEA, GPU/runtime, MCP/integration, operator interfaces.
- Practical explanations first; research/guide/overview document types; Implemented/Experimental/Proposed capability status; explicit citations, revision, reviewed date, limitations, attachments.
- Inventory every scoped research source and record incorporated/cited/archived/excluded disposition.
- Historical PDFs remain identifiable; corrected editions derive from corrected content.
- Shared structured content and router-free article components; deterministic static export with source/content/asset hashes and export time.
- All approved articles in canonical research and the private Sites companion; no new runtime APIs or auth flows.
- Existing brand, routes, generated surfaces and filters retained; legacy Zig docs labeled historical.
- Validate topology, TypeScript, Vitest, production build, browser crawl, responsive/keyboard/text enlargement, export equivalence and owner-only deployment.

## Ownership and progress

- Content/schema/PDF/inventory: research_inventory agent.
- Canonical research UI/shared renderer/Docs corrections: research_ui agent.
- Exporter, integration, validation and Sites lifecycle: root.
- Independent review after integration; no worker may invoke Sites tools.

## Decisions

- Work in the canonical default branch with nonoverlapping file ownership, per machine/user instruction. No topic branch or worktree.
- Only a separate generated Sites artifact is pushed to its private Sites source repository. Canonical source is committed locally and is not pushed, so its production workflow cannot run.
- Existing content is the source of truth for both presentations. Static generation uses plain shared React sections and synchronous KaTeX; no motion-dependent SSR or unhydrated raw TeX.
- Existing six ABI skills are capability routing guidance; current implementation/test source resolves contradictory historical prose.
- No new external literature review or live Discord evidence publication.

## Implementation checkpoint

The canonical corpus contains 21 publications (12 preserved notes, six overviews and three guides), immutable source citations, and two corrected PDF editions alongside the unchanged historical originals. Original slugs, dates and tags are retained. The source/disposition inventory is `apps/web/docs/research-inventory.md`.

Topology, app-local TypeScript, 30 Vitest files / 261 tests, and the production build passed. Focused Chromium acceptance passed 64 checks across canonical and generated static presentations, including all article routes, tag filters, keyboard operation, mobile layout, 200% text reflow, equations, code and PDF responses. Canonical metadata, 21 social images, feed, sitemap and llms.txt were verified from the local production build. All 26 distinct public source URLs returned 200. Independent content/source and export-safety review found no remaining material issues.

Full-site crawl and hosted owner-only verification receipts are delivered separately with the generated review manifest. Public rollout remains explicitly deferred.
