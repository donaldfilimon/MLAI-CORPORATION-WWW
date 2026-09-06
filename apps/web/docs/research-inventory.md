# MLAI public research inventory

Reviewed 2026-09-06. Audience: partners and customers. Scope: existing MLAI notes and bounded ABI/WDBX source, not an external literature review. The status Implemented describes a source capability, not production deployment or empirical benefit.

## Source revisions and authority

- MLAI input corpus `55a4149c8acda650eb03cbd5927d88f0a3a0b40b`: `apps/web/src/data/categories/research.ts` (all 12 notes) and both original `apps/web/public/research/*.pdf` files. Original display dates, slugs and category tags are preserved.
- ABI `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee`; source paths below were clean against this revision during inspection.
- WDBX public `14cb1341cb454bd3f887c4e54a83f8c42775a91d`; local inspected HEAD was `b82a7d3e26db9a00ce57b98efd24719683466eb1` (a local documentation change). All cited source/test files were byte-identical to origin/main; public citations use the available public revision.
- Current executable source outranks older architectural prose. No private logs, runtime stores, credentials or operational receipts were imported.

## Existing note dispositions

| Existing slug | Topic | Status | Disposition |
|---|---|---|---|
| wdbx-weighted-backtrace-memory-store | wdbx | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| sparse-evidence-attention-context-assembly | sea | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| wdbx-graph-weights-traceable-retrieval | wdbx | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| policy-locked-tool-use-multi-agent | ai | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| latency-budgets-real-time-orchestration | gpu | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| backtrace-confidence-signals-hallucination | sea | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| vector-index-maintenance-continuous-ingestion | wdbx | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| human-approval-gates-operators-use | ai | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| chunk-provenance-long-context-retrieval | sea | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| offline-first-ai-sensitive-data | ai | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| prompt-injection-drills-agentic-systems | ai | Proposed | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |
| multi-persona-routing-policy-weights | ai | Implemented | Retained URL; replaced unsupported general claims with bounded source account or explicit proposed study. |

All 12 original display dates are retained as archive dates; reviewedAt records the revision date. No original prose is represented as a newly completed empirical study. Six overviews and three implementation guides (GPU, MCP, TUI) were added.

## PDF comparison and disposition

Both original PDFs retain their original bytes and URLs. They are superseded historical editions. `pdftotext` found article headers and footer text but no substantial selectable article body, so text parity could not be established. Their headlines and abstracts repeat superseded architecture/routing claims; neither is current implementation evidence. Corrected dated editions are generated from the exact content records, including status, limitations and source URLs. Historical June dates identify the edition month; the exact original publication day is unknown (attachment dates normalize the month to its first day).

## Bounded source map and SHA-256

| Source | Revision | SHA-256 | Disposition |
|---|---|---|---|
| abi/crates/abi-ai/src/completion.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `9b4d8275497dfcf7e4665d6c6695cb00baa6e4d3ed935ec84872e0c1b7449189` | Cited and incorporated: Local completion and adaptive routing; bounded source behavior only. |
| abi/crates/abi-ai/src/router.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `3327d6ce72476f482f47513e186ae24089038628eccf36fa1d35140fb687112a` | Cited and incorporated: Deterministic persona router; bounded source behavior only. |
| abi/crates/abi-ai/src/constitution.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `0246ca3b2ba7ca64f3ff52e9d8a5123d629ddc9e81279c0977ef6c291f07441e` | Cited and incorporated: Constitutional checks and veto rules; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/durable.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `1dfaa1a6d191616b070661c1a18e49cbb9ecb82b2f0deef429f1c3d6936eafcd` | Cited and incorporated: Durable store and writer ownership; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/hnsw.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `0f6dc3f69891b4c122856a90c515593e0e477bcc7666709faa637cfa69538ae9` | Cited and incorporated: Layered HNSW index; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/retrieval.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `27382274ac9c488d63af2ac79d6205df7de667b99cbb5cdc5a1cd87626234a15` | Cited and incorporated: Hybrid retrieval and observable score factors; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/v3/episode/store.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `81834196404c285bcd4530ca59e7ecc1c50e8ebaa631d038330f42499598b401` | Cited and incorporated: Canonical episode persistence; bounded source behavior only. |
| wdbx/crates/abi-wdbx/tests/v3_episode_store.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `45fb4ec465111e9d0494b7c8b7053dcfebfc9c7b50a705e6b65df73992fc8a4a` | Cited and incorporated: Episode persistence and replay tests; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/cluster_rpc.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `de9d36e3fe9f2a44da2a87fd688b0ddd5b34ea01d8f70c91b3f7a7584977e906` | Cited and incorporated: Reference cluster protocol boundaries; bounded source behavior only. |
| abi/crates/abi-sea/src/evidence.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `c6b4036a76fd9f1577ae38fa8e300684af3c3bdc1d88c4a4a576724cb4ba46c4` | Cited and incorporated: Bounded evidence recall and prompt assembly; bounded source behavior only. |
| abi/crates/abi-sea/src/scorer.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `07a60597a4fecf266865296329eb9cfd87f0d41c8e07c7fbf0ca58a3d6e4e650` | Cited and incorporated: Eight-signal selection and task weights; bounded source behavior only. |
| abi/crates/abi-sea/src/learn_loop.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `8204d96af655927657286310460db55e2bbcafef9337be1b022bbaca9f923023` | Cited and incorporated: Learning loop and persisted router weights; bounded source behavior only. |
| abi/crates/abi-gpu/src/lib.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `02fe78cf6105c0e8bfcd6d6d6cba1904d3dc22872633d3188b2766349514a2f2` | Cited and incorporated: GPU capability reporting and vector operations; bounded source behavior only. |
| abi/crates/abi-gpu/src/metal_kernels.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `37567c7c1829bc0d1adcc0c2f7ed5052ce5a1d307006e493c0a77407cad33c2b` | Cited and incorporated: Optional Metal DOT kernel; bounded source behavior only. |
| abi/crates/abi-mcp/src/handlers.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `38cc7b51c46a0cfed0ea44bfa75009ae52aecb0881fdd439cc52ba6f523f4245` | Cited and incorporated: Twelve-tool MCP contract; bounded source behavior only. |
| abi/crates/abi-mcp/src/http.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `0373b1b4d49101a9bb0ce4b0b65ddbd5d1f7d99e412990513181d373e7625249` | Cited and incorporated: Loopback HTTP compatibility boundary; bounded source behavior only. |
| abi/crates/abi-cli/src/repl.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `0a18fa199bea6d6cef04adcda658b845bc74ebfc619f030da485b312381bb4a8` | Cited and incorporated: Agent REPL commands and session state; bounded source behavior only. |
| abi/crates/abi-cli/src/dashboard.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `f2db39be7a3bc4b94d5e4f9efec6101753b392aa406fbf02a5fde5892b6bdd92` | Cited and incorporated: Diagnostics dashboard and one-shot output; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/store.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `36ed6dae59df09cfc45e904d77947a09b1742003826b481f16ba0a6d2fa1676d` | Cited and incorporated: Snapshot chain verification; bounded source behavior only. |
| wdbx/crates/abi-wdbx/src/temporal.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `d942a248dbf672c8268695956bc476626eaf79fdb34d6861d8fb5e7dec0f7a0e` | Cited and incorporated: Temporal and causal ranking functions; bounded source behavior only. |
| wdbx/crates/abi-compute/src/cpu.rs | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `6e66e45b396d3c791fffa013ba53e7fb2d71a583eade3181ef3a2de0c590db66` | Cited and incorporated: CPU cosine reference and vector edge cases; bounded source behavior only. |
| abi/crates/abi-sea/src/query_plan.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `2e205fc337cb6afd31f2c6fcf3416a4318217d439d8c389d1c825bcde0d57cf1` | Cited and incorporated: Keyword-based task classification; bounded source behavior only. |
| abi/crates/abi-wdbx-gateway/src/episodes.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `22962eaf03939a4882d2ca6d012ff711096144e25ec83c32374ed9e77b91425e` | Cited and incorporated: Gateway episode admission implementation; bounded source behavior only. |
| abi/crates/abi-ai/src/modulator.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `f9e1ea76446958f21127db70c762c707bdcd12a8fe68d6407a5ab500fd6abbef` | Cited and incorporated: EMA update and state validation; bounded source behavior only. |
| abi/crates/abi-ai/src/identity.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `cadb694ed0e4866069f60633d2fa30c98a92252cf5cc94375d67cd26c5990ac6` | Cited and incorporated: Canonical persona priors; bounded source behavior only. |
| abi/crates/abi-cli/src/terminal.rs | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `27f08c6f431f13fc69039262c43bf09f8d76079841e0d7ace5028411ef364b00` | Cited and incorporated: Terminal modes, input and restoration; bounded source behavior only. |

## Conflicting or excluded material

- ABI identity document: useful normative context, but its telemetry-only constitutional-audit prose is stale relative to completion.rs hard-veto substitution. Public copy follows executable source.
- WDBX claim ledger: contains older gateway/canonicalization limits that can drift; do not copy the ledger wholesale into current capability copy.
- public/docs/wdbx: frozen Zig-era mirror, retained only as historical documentation; current Rust source controls architecture claims.
- docs/master-reference.md: historical/internal reported persona and efficiency figures are excluded from public research outcomes.
- ABI hardware-acceleration-fpga-asic.md: research scaffold, excluded as current capability evidence.
- ABI federation/admission specifications and local receipts: excluded from public content; no production Discord acceptance claim.
- Existing PDFs and archive dates are historical artifacts, not proof of peer review, authorship verification, published benchmark methodology or current deployment.

## Reproduction and remaining limits

The PDF generator reads the public TypeScript corpus through Bun, writes only the two dated editions, and updates their attachment hashes/page counts. Run `python3 scripts/generate-research-pdfs.py` with ReportLab and Matplotlib available. The verified editions used ReportLab 4.4.9 and Matplotlib 3.11.1; equations are rendered from the article LaTeX at 180 DPI. Text extraction verifies article body coverage; visual review verifies legibility. Source links pin immutable revisions rather than mutable main links. This inventory validates what was inspected locally; remote link accessibility and public deployment require separate checks.

## Input corpus and PDF integrity

Original research.ts SHA-256 before revision: `5e081dd5f41d210558e3b15d41d54685b8b61f13e8c3fa9056f2967e2636a12b`. The original contains 12 notes; all original slugs remain.

| PDF | Edition | SHA-256 | Pages |
|---|---|---|---|
| /research/wdbx-weighted-backtrace-memory-store-2026-09-06.pdf | current | `294a7906391b064273691eff60a0f83242cbbb78e2a894321285e993f31f3fa2` | 3 |
| /research/wdbx-weighted-backtrace-memory-store.pdf | historical | `1030bd50a64ab2426ba6558aee26398cfea1a7b7de39e527db0685bf54a853cf` | 5 |
| /research/multi-persona-routing-policy-weights-2026-09-06.pdf | current | `38be0dfe5661e90d593e767c7a50c3030bb3daccf94b97ef5e64a3a8f70a0f37` | 3 |
| /research/multi-persona-routing-policy-weights.pdf | historical | `3e0163af561bfd28e2c0c3544b5108478f87433e838e7d8a8acd94ca0303d5b8` | 4 |

Current edition validation: every paragraph in each of the two article bodies was found in pdftotext extraction. Rendered sample pages were inspected for legibility; sources are placed on a dedicated page with clickable pinned links. Re-running the generator should preserve hashes for unchanged inputs (ReportLab invariant output).

## Technical-depth revision

Existing technical notes retain substantive derivations, worked examples and reproducible evaluation methods. Unsupported old softmax/blended-answer and scaling equations were replaced rather than presented as implementations. Cosine, hybrid ranking, SEA weighted scoring and token packing, and actual additive/EMA persona routing are source-backed. Proposed notes describe study design and acceptance rather than implying completed experiments. Reading times are calculated from body words plus equation/code allowance at 200 words per minute.

## Reviewed documentation and archive dispositions

| Exact path | Revision | SHA-256 | Disposition / reason |
|---|---|---|---|
| abi/docs/spec/abbey-core-identity.mdx | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `a9fca5dc5f82993ecf8945ad731304b088d21b4fb5ebd6622fc5a24a879d8188` | Reviewed; normative context only. Telemetry-only audit description superseded by current hard-veto implementation. |
| wdbx/docs/claims.md | `14cb1341cb454bd3f887c4e54a83f8c42775a91d` | `d1ab931b2703e1aec39e9009da836c922b2a963b4fbc466c01c67f00ec270347` | Reviewed; excluded as current public claim register because gateway/canonicalization statements are stale. |
| abi/docs/research/hardware-acceleration-fpga-asic.md | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `f987cf8f3a2a5bc84e86c5e59d7a63e2e98cfd269f8f2dd14a9dfb52080e5b8d` | Excluded from shipped capability evidence; document labels itself a research scaffold. |
| abi/docs/spec/sea-design-extract.mdx | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `34c2fe5c0b96cb4b823e4b829eddb0b231395e1982e0978f8da52d3a407f87c2` | Design context only; current scorer/evidence source controls exact arithmetic and trust handling. |
| abi/docs/superpowers/specs/2026-09-06-spec-memory-candidate-episodes.md | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `ea1fc6fc22ded23e4f3b704d0119a5582e88e3df875824d580f30a5c3d51e660` | Excluded from public corpus; internal admission design is not a customer deployment result. |
| abi/docs/superpowers/specs/2026-08-22-spec-application-federation.md | `6321a47bf4c48a5f58caf2df0eb631b5a2ecdcee` | `e80a40f204ee83b06536470a5324ad0bf38c562a5cf662db95e17d7be6b7d6df` | Excluded from public corpus; federation design does not establish integrated deployment. |
| mlai/apps/web/docs/master-reference.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `77f78dc6c27a8c17c45c5ccc530cfd75c2056c86cb403c2b19925e864b02707c` | Excluded metrics and historical copy; internal or reported numbers lack selected reproducible publication evidence. |
| mlai/apps/web/public/docs/wdbx/acceleration.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `e6719152d612d75ea69c88b946b471b9f3e23a0afbd74b64a23237a2f2e1dd13` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/api.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `dc3f1f9012b785ffcefd8869e97438dcfe77fe8e49a2dbaac6d6998442ed29b9` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/architecture.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `ad4e522315cb298c5b51f72b98f5ab2b6daa08059bb153630b340914585adf6f` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/cli.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `b01c9c013009076afdd62e5fcf4963b4e5dd9b42c7c744d77b8ce67f7e9f496f` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/getting-started.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `1abdc6de016a2b86c81fe676a9445497a953c73ddf0405ec55e811fc78abf2dc` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/index.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `babf97b9110b10f58663df8dead229fdf205d3b90988eccc34561804b0a17b62` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/limitations.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `8ccdb7286ee7f00ca78ec9375ec8f6f74f1ac7c7748729d66898cab3d213256e` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/persistence.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `1350ba8ccd55d110ec79b68e5e4153ea4909fc40c123648955569436853a6c3e` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
| mlai/apps/web/public/docs/wdbx/protocols.md | `55a4149c8acda650eb03cbd5927d88f0a3a0b40b` | `b74f470b4842f309db6e9784a725abb92e5ade0b522970acc8b60205dfe64d06` | Archived existing file; frozen Zig-era mirror excluded from current Rust capability evidence. |
