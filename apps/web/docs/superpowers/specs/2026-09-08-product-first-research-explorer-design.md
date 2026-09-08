# MLAI Research product-first explorer

Date: 2026-09-08
Status: Design for user review; implementation and public deployment are not yet approved.

## Intent and scope

Help customers and collaborators start with an MLAI system, identify a relevant application, and follow the supporting research and evidence. Give ABI, Abbey, WDBX, and Quasar equal top-level navigation prominence, without implying equal maturity, commercial availability, or production readiness.

Preserve the six research areas, 21 publications, seven implementation studies, existing PDFs, and their URLs. DNS, email, new databases, authentication, questionnaires, lead forms, analytics, and changes to the canonical public deployment are outside this change.

## Reader experience

The root page becomes a compact product explorer, not an oversized marketing introduction. Show four system cards in this fixed order: ABI, Abbey, WDBX, Quasar. Each has a plain-language role, two source-backed application examples, a scoped availability note, and an Explore link. Use a two-column desktop layout and a single-column narrow-screen layout.

Use these roles as editorial starting points, subject to source verification:
- ABI: coordinate AI interactions, tools, and context.
- Abbey: assist with technical work through a human-oriented interaction surface.
- WDBX: store and retrieve memory with traceable source relationships.
- Quasar: generate and inspect local application projects within a constrained filesystem.

The existing research index remains at /research. Navigation offers Systems and Research library; the brand returns to /. Preserve the established near-black, cyan/sky, Spectral/Geist identity. No new decorative imagery or social-preview generation.

Each /systems/{abi,abbey,wdbx,quasar} page answers five questions in order:
1. What is it? A short plain-language introduction.
2. Where could it help? Two or three specific application scenarios, each with a problem, relevant mechanism, and limitation.
3. What exists today? Capability-level Implemented, Experimental, or Proposed labels, each accompanied by evidence and scope.
4. What supports those claims? Explicitly curated implementation studies and publications, followed by the source ledger.
5. Where do I go next? Verified product/documentation destinations and internal research links.

Include breadcrumbs, anchored contents, and links to the other three systems. Keep evidence detail after the explanation while surfacing limitations alongside application claims. Do not use a global green maturity badge.

## Content and evidence model

Keep canonical ownership in apps/web/src/data/categories/research-systems.ts. Introduce a readonly ResearchSystem model with stable slug, name, summary, role, availabilityNote, applications, capabilities, implementationSlugs, publicationSlugs, sources, limitations, and nextSteps. Applications and capabilities carry source-reference IDs; capabilities also carry the three-value status. Every source records exact revision, path/locator, SHA-256, and access classification.

Relationships are explicitly curated by slug, not inferred solely from topic overlap. Reuse existing source references and prose where accurate rather than copying entire sibling websites. Preserve provenance when a summary combines sources. Label Git clone locators as repository locators rather than pretending they are working source-browser pages.

Initial relationship decisions:
- ABI: platform architecture and bounded tool-control research; use exact supporting AI, MCP, SEA, and operator publications.
- Abbey: executable capability ledger and relevant interaction/memory research; distinguish the Abbey product from its ABI persona relationship.
- WDBX: canonical Rust memory/retrieval evidence is primary. WDBX Specimen is explicitly labeled a separate design/conformance study, never proof of canonical WDBX capabilities.
- Quasar: bounded repository-generation study and supporting tool-boundary research. Label its documented local-development profile; do not imply a hosted service.

A related publication explains a mechanism; it does not establish that the named system implements it. State that distinction in the evidence presentation.

Next-step links must use existing, verified destinations. A public HTTP success alone does not prove a usable application: inspect the returned destination and account requirements. If a destination cannot be verified or is unavailable, omit its actionable external CTA and use the existing internal study or publication instead. Private repositories may remain source evidence with an access-required label. No Try it CTA without verified usable product access.

## Implementation boundary

Extend the existing canonical exporter and shared research renderer; do not hand-edit generated Sites HTML. Extract the system card/detail rendering into a focused reusable component so the exporter does not accumulate another long inline page template.

Generate:
- / and /systems/index.html: product explorer.
- /systems/{slug}/index.html: four system details.
- /research and all existing publication/study URLs: preserved research experience.
- systems-data.json: structured system projection, included in the complete file-hash manifest.

Keep the existing research-data.json and implementation-data.json interfaces unchanged. This is an additive static content model, not a network API or database migration. Preserve artifact-owned package scripts, README, typed filtering workflow, and .codex metadata.

Use page-specific titles and descriptions. Retain review-site noindex rules. Do not assign a false canonical URL to new system pages: omit canonical metadata for those pages until an equivalent canonical route is deployed; preserve existing valid research canonical links.

## Failure handling and acceptance

Export must fail before replacing the last complete artifact when a system slug is duplicate/unsafe, a relationship target is missing, a capability lacks evidence, a source digest/revision is malformed, or a destination link violates the source/link policy.

Tests must demonstrate:
- Exactly four system entries, fixed navigation order, all five reader sections on every detail page.
- All selected related studies/publications resolve; unrelated topic neighbors are not silently attached.
- Every capability has a scoped status and valid evidence; Specimen cannot stand in for canonical WDBX proof.
- No claims of hosted Quasar, inferred product access, unsupported benchmarks, or blanket production readiness.
- Root is product-first; /research still exposes the full 21-publication library and working combined filters.
- All existing publication, study, PDF, and asset paths remain valid.
- New structured data and rendered files are fully covered by the manifest; repeated export from the same revision/time is byte-identical.
- Invalid exports preserve the last complete output and artifact-owned scaffolding.
- Semantic headings, contents anchors, keyboard focus, readable narrow layouts, and 200% text enlargement are preserved. Automated render checks are required; live browser QA requires explicit user authorization.

Run canonical web lint, tests, and production build, then artifact tests/build and full manifest verification. Inspect final source and output for accidental private content or unsupported availability claims.

## Delivery and approval

After this design is approved, create the implementation plan through the writing-plans skill, implement in the canonical checkout, and commit only scoped work. Regenerate from a clean validated source commit into the existing selected MLAI Research Sites project.

Save the resulting update as a new unpublished version without overwriting saved version 2. Do not push the canonical public deployment branch. Recheck the selected Site's access before release. Public publication requires approval for the exact new saved version; previous DNS or version-2 questions do not authorize it.

Success is a validated, saved product-first explorer with all four systems and preserved research access. Public release is a separately approved final step; DNS recovery is independent.

