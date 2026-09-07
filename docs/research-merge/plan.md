# MLAI research consolidation plan

Audience: Donald and reviewers of the local MLAI application. Date: 2026-09-06.
Assumption: `mai-website-app` means this canonical `mlai-website-app` checkout. Merge the MLAI research collection and its Sites publication into the existing Next.js/React application; retain existing application functionality and design. Reference repositories stay read-only.

The requested update_plan tool is not available in this session (tool inventory checked). This file records the same scope and progress.

1. Complete: discover current app, Sites metadata, exported collection, canonical MLAI collection, and Abbey architecture review.
2. Complete: reconcile content and attachment hashes, verify critical pinned implementation evidence, and document scope/claim gaps.
3. Complete: implement native TSX research index/detail pages, downloads, navigation, metadata and sitemap.
4. Complete (2026-09-06 20:1x): content integrity, rendering, search, responsive browser behavior and the repository gate are all verified; evidence is in `docs/IMPLEMENTATION.md` under "MLAI research merge". Two test defects were found and fixed while verifying, both in `tests/e2e/research.spec.ts` and neither in the product: `getByLabel("Research area", { exact: true })` can never match, because the `<label>` wraps its `<select>` so the label text concatenates every option; and the evidence section renders "Evidence & limitations" with a lowercase l, so a `toContainText("Limitations")` assertion never matched.

Source classes: local source and immutable Git objects, Sites project metadata/export manifest, first-party Next.js/React documentation. No pricing or deployment recommendations. No copying private data or replacing authentication/runtime services.
