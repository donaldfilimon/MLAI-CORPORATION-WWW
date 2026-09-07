# MLAI and MLAI Research consolidation

Audience: Donald Filimon and application reviewers. Date: 2026-09-06.

## Direct answer and scope

Consolidate the research collection into the independent `mlai-website-app` as native Next.js App Router pages and custom React TSX components. Keep its local SQLite/Better Auth/worker architecture and existing product interface. The reference MLAI repository and the linked Sites publication contain the same 21 structured publications and six research tracks (deep equality verified), so importing both separately would duplicate the corpus. Retain the destination's three original application notes. Copy the four publication PDFs with their original edition labels and SHA-256 hashes.

The requested destination spelling `mai-website-app` is interpreted as the current `mlai-website-app` checkout. “Merge all” covers this application's MLAI experience and the complete selected research publication. It does not imply migrating unrelated mobile/desktop products or replacing the application's persistence and authentication with the reference site's hosted backend.

## Evidence and reconciliation

The [selected MLAI Research publication](https://mlai-research-review.underswitch.chatgpt.site) was verified through Sites project metadata, which identifies the appgprj_6a9d484ec5a881919dc02a7a3ee7934e project, version 1, title MLAI Research, active status, and public access. Its description calls it a private review, but actual access configuration is public. No sharing or deployment changes were made. Web retrieval of the live page was unavailable; this is not recorded as live page-content acceptance. The locally available export's `.openai/hosting.json` matches the selected project. Its README and provenance manifest identify source revision `0a516a84f3b2d8f6f0c96491b8ac4f3e4307cefb` and generation time `2026-09-06T11:26:48.950Z`.

The imported content hash is `1bac66896aa58c1c97813cdf7ff9ac80f94285abb6e3b183d901620a352ecaa4`. Both the full parsed corpus and every individual publication were verified against the original manifest, and the local current MLAI structured collection matched by deep equality. Byte-level PDF checks verified all four editions. Source data remains unchanged; a separate typed adapter handles application routes, search summaries, and related guides. The retained source manifest describes the original exported artifact, not this application's generated HTML.

Twenty-six unique pinned source files support 66 article-source references. Each Git object was retrieved locally at its exact cited revision and its bytes hashed in `source-verification.json`. Critical claim spot checks confirmed that [ABI local completion](https://github.com/donaldfilimon/abi/blob/6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee/crates/abi-ai/src/completion.rs) renders a persona template and treats a requested model identifier as metadata on that path; [WDBX cluster transport](https://github.com/donaldfilimon/wdbx/blob/14cb1341cb454bd3f887c4e54a83f8c42775a91d/crates/abi-wdbx/src/cluster_rpc.rs) explicitly excludes production multi-host Raft and sharding. These dated reference statements must not be confused with this app's separately configured model-generation path. Existing source-review claims were preserved, not promoted to current deployment or benchmark claims.

## Implementation decision

Use a dedicated research renderer alongside the existing public catch-all route. The server renders full publication bodies, evidence, code, sources, and equations. A small client component owns URL-backed topic/type filtering and reuses the custom shared React search component. This follows the [Next.js server/client component boundary](https://nextjs.org/docs/app/getting-started/server-and-client-components). React [static rendering](https://react.dev/reference/react-dom/server/renderToStaticMarkup) supports structural renderer checks, but is not browser interaction proof.

Every imported article has static parameters, a title and description, sitemap inclusion, related research, and a link to relevant application documentation and the Abbey workspace. All legacy note routes remain. The homepage highlights a bounded selection while the research library lists the entire collection. Four downloads retain current versus superseded status. Fourteen equation blocks use server-side KaTeX with `trust: false`; no user TeX is accepted and no raw exported HTML is embedded.

## Gaps and limits

| Claim or gap | Evidence and confidence | Remaining boundary |
| --- | --- | --- |
| Selected collection fully incorporated | Original manifest, exact parsed-corpus hash, 21 per-publication hashes, four PDF hashes; high | The remote publication's individual content bytes were not fetched |
| Reference and exported collection agree | Deep equality of current MLAI research data and saved export; high | Does not mean either reference repo is deployed |
| Pinned sources exist | All 26 Git objects retrieved and hashed; high | This is not a fresh full scientific or performance evaluation |
| Native Next.js/React integration | Existing package manifest plus new TSX routes/components and fresh gates; verified in implementation ledger | Auth/model/service acceptance is separate |
| Dependency review | `dependency-reviewer` package-risk routing attempted for KaTeX 0.18.7 | Endor CLI lacks `agent` command and no risk MCP was available; risk posture unknown, no affirmative security verdict |
| Application release readiness | Public content work retains existing authorization and data boundaries | This merge does not resolve pre-existing runtime acceptance gaps or deploy the application |

## Search and stopping record

Discovery examined destination architecture, current Git status, source content/navigation/routes, Sites project metadata, the linked local export and manifest, and current MLAI research records. Follow-up compared complete structured content, validated attachments, resolved all cited source objects, spot-checked high-impact implementation limitations, and consulted primary Next.js/React documentation. Abbey independently reviewed app boundaries and validation scope. Research stopped once collection completeness and provenance were verified, the consequential limitations were supported, and another broad search would not change the integration choice. The final delivery is the working native research interface; verification results live in `docs/IMPLEMENTATION.md`.

## Claim-to-source ledger

- **MLAI Research source export**; MLAI Research; generated September 6, 2026; [selected publication](https://mlai-research-review.underswitch.chatgpt.site); local source at `../mlai-research-sites/public/research-data.json`, original manifest retained here. Connector metadata verified; web page unavailable.
- **MLAI canonical research records**; MLAI; reviewed September 6, 2026; `../mlai/apps/web/src/data/categories/research-records.ts`; read locally and deep-compared with export.
- **Pinned implementation evidence**; Donald Filimon / ABI and WDBX projects; dated by each publication's review; 26 exact source URLs, titles, revisions and retrieved hashes in `source-verification.json`; all objects available locally. Full article-to-source association retained in `src/content/research-data.json`.
- **Server and Client Components**; Next.js documentation; accessed September 6, 2026; https://nextjs.org/docs/app/getting-started/server-and-client-components; primary documentation retrieved.
- **renderToStaticMarkup**; React documentation; accessed September 6, 2026; https://react.dev/reference/react-dom/server/renderToStaticMarkup; primary documentation retrieved.
