/**
 * MLAI knowledge base — founder repositories and what each one honestly claims.
 * Sourced from repository READMEs (read 2026-09-05). Status vocabulary:
 * Current · Partial · Proposed · Not claimed.
 * No benchmarks here; performance figures live only where provenance exists.
 */
export type ClaimStatus = "current" | "partial" | "proposed" | "not-claimed";

export interface Claim {
  text: string;
  status: ClaimStatus;
}

export interface Repo {
  slug: string;
  name: string;
  org: string;
  url: string;
  language: string;
  license?: string;
  accent: "wdbx" | "abi" | "abbey";
  role: string;
  oneLiner: string;
  summary: string[];
  claims: Claim[];
  gate?: string;
  related: string[];
}

export const repos: Repo[] = [
  {
    slug: "abi",
    name: "abi",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/abi",
    language: "Rust (nightly)",
    license: "Apache-2.0",
    accent: "abi",
    role: "Runtime · orchestration · MCP",
    oneLiner:
      "Intelligence Without Limits — local runtime. Agent orchestration, WDBX semantic storage, and claim-honest capability reporting, inspectable on your machine.",
    summary: [
      "ABI is the canonical cognitive and governance runtime. It plans queries, routes the Abbey / Aviva / Abi personas deterministically, and appends every turn to the WDBX substrate. Cloud backends are optional; browser autonomy is not Current.",
      "The Zig tree has been removed — the framework is nightly Rust across 17 workspace crates (abi-cli, abi-mcp, abi-ai, abi-sea, abi-agent-runtime, abi-agent-host, abi-models, abi-model-runtime, abi-worker, abi-plugins, xtask …). The five substrate crates are path dependencies from the sibling wdbx repository.",
      "13 top-level CLI commands and 12 MCP tools are frozen contracts pinned by golden tests. MCP stdio is primary; the loopback HTTP listener is a compatibility surface, not a spec-conforming HTTP+SSE channel.",
    ],
    claims: [
      {
        text: "Deterministic persona identity and routing (abi-ai) with no WDBX or I/O dependency",
        status: "current",
      },
      {
        text: "12 MCP tools: ai_run, ai_complete, ai_train, ai_learn, wdbx_query, scheduler_stats, scheduler_info, connector_test, gpu_status, plugin_list, wdbx_stats, plugin_run",
        status: "current",
      },
      {
        text: "GPU capability table with honest accelerated=false when native kernels are not linked; CPU SIMD fallback",
        status: "current",
      },
      {
        text: "Sixteen bundled plugins with compile-time parity assertions",
        status: "current",
      },
      {
        text: "Tiny abi-bigram-v1 Candle model path on CPU and locally exercised Metal — runtime-foundation evidence only",
        status: "partial",
      },
      {
        text: "Cluster RPC and secure demos are single-host / reference-scoped",
        status: "partial",
      },
      {
        text: "CUDA / Vulkan / ANE kernel execution, production multi-host deployment, QPS / latency / accuracy figures",
        status: "not-claimed",
      },
    ],
    gate: "./tools/check.sh — policy tests, xtask ci verify, Abbey corpus, size limits, fmt, clippy -D warnings, workspace tests, docs",
    related: ["wdbx", "abbey", "abbey-bot"],
  },
  {
    slug: "wdbx",
    name: "wdbx",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/wdbx",
    language: "Rust",
    accent: "wdbx",
    role: "Provenance-aware episodic substrate",
    oneLiner:
      "The memory and evidence substrate beneath ABI — extracted from abi on 2026-08-22 with history preserved.",
    summary: [
      "Five crates: abi-foundation (primitives), abi-telemetry (bounded counters), abi-compute (deterministic CPU SIMD + the Accelerator contract), abi-core (config, scheduler, memory accounting, plugin registry), and abi-wdbx — the substrate itself.",
      "The distinction the substrate enforces: memory ≠ database lookup. A vector database retrieves similar content; an episodic substrate must also preserve context, causal dependencies, outcomes, versions, constraints, and evidence.",
      "The repo states its own gap analysis: most of the structural half is implemented, little of the evidence half. Closing that is Program 4 (canonical-wdbx-episodes-claims).",
    ],
    claims: [
      {
        text: "Multi-parent causal audit DAG; SHA-256 content addressing; Ed25519 signing over transactions and segments",
        status: "current",
      },
      {
        text: "MVCC with conflict sets; CRC-framed WAL + segments; checkpoint publication and salvage",
        status: "current",
      },
      {
        text: "Exact and layered-HNSW search; 3-D spatial index; cluster replication with read repair",
        status: "current",
      },
      {
        text: "Reference quantization / Huffman / rANS / autoencoder codecs; optional FHE reference paths",
        status: "current",
      },
      {
        text: "Deterministic-CBOR episode envelope (abbey-cbor-episode-v1) with golden vectors; single-writer EpisodeStore that fails closed on policy / consent drift",
        status: "partial",
      },
      {
        text: "Evidence-weighted retrieval — ranking today is semantic × temporal × causal × persona affinity, the opaque collapse the constitution's invariant I3 forbids",
        status: "proposed",
      },
      {
        text: "Hosted database, production authority, block-level retention / redaction / deletion, distributed sharding",
        status: "not-claimed",
      },
    ],
    gate: "cargo fmt --all --check · cargo clippy --workspace --all-targets · cargo test --workspace (workspace denies unsafe_code)",
    related: ["abi", "abbey"],
  },
  {
    slug: "abbey",
    name: "abbey",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/abbey",
    language: "Rust (nightly-2026-09-01, edition 2024)",
    accent: "abbey",
    role: "Companion CLI / TUI with a claims ledger",
    oneLiner:
      "Intelligence Without Limits — with a claims ledger. Personas, skills, parallel peers, and verbs that refuse what isn't Current.",
    summary: [
      "A hybrid CLI/TUI companion for coding and ops (v2.6). Its README carries a generated ledger: 40 Current · 3 Partial · 8 Proposed · 1 Blocked · 5 Out of scope, digested from src/claims.rs. Verbs that are not Current exit 2 rather than pretend.",
      "Backends are pluggable and never required: cursor-agent, Grok Build, Apple Foundation Models (on-device, macOS 26+), the sibling abi CLI, and Claude Code. Ollama with a local Gemma is the preferred default when present.",
      "Memory is a 3-D map on interpretable axes — topic, recency, consolidation (activity → stm → ltm → train_candidate). It is a deterministic layout, not a learned embedding space; semantic embeddings are a separate opt-in provider surface. Memories are never silently deleted — they are invalidated or superseded so provenance survives.",
    ],
    claims: [
      {
        text: "Personas, Max/Gemma bindings, memory, hybrid-loop, fm backend, and the 3-D map",
        status: "current",
      },
      {
        text: "Authenticated owner-only Unix daemon (abbeyd) with protocol v1 reads, v2 bounded runs, v3 strict envelope",
        status: "current",
      },
      {
        text: "In-process WDBX memory backend (abi-wdbx DurableStore) behind --features wdbx, with an fs4 cross-process lock",
        status: "current",
      },
      {
        text: "Routing audit: persona, role, model, confidence, alternate, fallback — audit-only, no auto second agent",
        status: "current",
      },
      {
        text: "Windows installer naming proved by parser test only; no Windows host has run it",
        status: "partial",
      },
      {
        text: "Local production weights and LoRA; Abbey-owned accelerator runtimes; provider-neutral agent/tool runtime",
        status: "proposed",
      },
      {
        text: "Reimplementing Grok / Codex / Claude runtimes; embedded vision or generation weights; /cost",
        status: "not-claimed",
      },
    ],
    gate: "./check.sh — Rust nightly gate; claims summary regenerated by tools/check_claims_sync.py",
    related: ["abi", "wdbx", "abbey-bot"],
  },
  {
    slug: "abbey-bot",
    name: "abbey-bot",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/abbey-bot",
    language: "Rust (serenity 0.12 + poise 0.6)",
    accent: "abbey",
    role: "Discord operational layer",
    oneLiner:
      "Abbey's Discord companion for routing, memory, and calm ops help — personas that say what they know and what they don't.",
    summary: [
      "Persona routing mirrors ABI: an explicit leading Abbey / Aviva / ABI name wins; otherwise canonical keyword weights are added to the 0.40 / 0.30 / 0.30 prior and ties favor Abbey. The route and normalized weights stay visible through /profile.",
      "Decision logic is separated from Discord: persona, permission, moderation, learning, memory, and tool decisions are plain Rust modules with no gateway dependency, so the decision suite runs offline. Every command defers before touching the network. Generated text can never ping anyone.",
      "Live voice is explicit, consent-gated, and audio-only: each member agrees once per disclosure version and processing mode; any unknown speaker closes the media gate. /server emits a plan and creates nothing; /modcall recommends and never acts.",
      "Semantic memory is projected into WDBX with the same n-gram embedding abi uses, in a segment abi's tooling can read; canonical facts live in an atomic JSON state document. Recall is scoped by server and user.",
    ],
    claims: [
      {
        text: "Source gate: 904 Rust tests, clippy, locked release build, Swift audio-tap tests, strict WDBX parity (2026-09-03)",
        status: "current",
      },
      {
        text: "Adaptive learning loop: 18-dimensional state → [18,64,32,3] DQN choosing stay / reply / react, rewards from reactions and replies, inspectable via /admin brain",
        status: "current",
      },
      {
        text: "Seven model-callable tools (remember_fact, lookup_reputation, recall, switch_persona, recent_messages, inspect_status, list_facts) — none post, moderate, or change configuration",
        status: "current",
      },
      {
        text: "Provider qualification: self-test implemented; MLX-VLM tool-continuation and FM vision/OCR fail",
        status: "partial",
      },
      {
        text: "Installed artifact identity, live two-guild Discord acceptance, consented voice 8/8 lifecycle, managed service, Windows runtime",
        status: "proposed",
      },
      {
        text: "A green source gate as proof of deployment, provider qualification, or live behavior",
        status: "not-claimed",
      },
    ],
    gate: "./check.sh (Ubuntu / macOS / Windows CI); nine separate evidence layers in docs/live-test-protocol.md",
    related: ["abbey", "abi", "wdbx"],
  },
  {
    slug: "gama",
    name: "gama",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/gama",
    language: "Swift (6.5-dev snapshot)",
    accent: "abi",
    role: "Declarative UI framework",
    oneLiner:
      "A modular declarative UI framework in Swift: one retained render tree drives terminal, CoreGraphics, WebAssembly, C/Android, MLIR, and Embedded Swift.",
    summary: [
      "App → scenes → RenderNode → LayoutEngine → CellPainter → DrawList → TUI | Apple | WASM | C/Android | MLIR. GamaCore imports no Foundation, platform UI, POSIX, or WinSDK; each FrameHost owns actions, focus, dirty state, and subscriptions — there is no process-global registry.",
      "Evidence policy: implementation presence is not platform proof. A backend is Current only when its declared compile/runtime gate passes. Embedded Swift is experimental; GamaMLIR emits a textual custom dialect and is not a Swift MLIR frontend.",
    ],
    claims: [
      {
        text: "GamaCore, GamaDraw, GamaTUI (POSIX + Windows), GamaAppleUI / AppleShell, GamaWASM, GamaEmbed C ABI (versioned DrawList, little-endian, 'GAMA' v1)",
        status: "current",
      },
      {
        text: "Deployment floors macOS 14, iOS 17, tvOS 17, visionOS 1",
        status: "current",
      },
      {
        text: "Embedded Swift backend",
        status: "partial",
      },
      {
        text: "gama-bench reports numbers, asserts no threshold, and is not a gate",
        status: "current",
      },
    ],
    gate: "./scripts/check.sh — fails when an exact pinned prerequisite or runtime proof is unavailable",
    related: ["abi"],
  },
  {
    slug: "nyon-game",
    name: "Nyon",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/nyon-game",
    language: "Zig 0.16",
    accent: "wdbx",
    role: "Game engine experiment",
    oneLiner:
      "A minimal Zig game engine with raylib integration, a node-based geometry editor, and a plugin system; desktop and WebAssembly targets.",
    summary: [
      "Entity-component scene graph, material-based rendering, immediate-mode UI with persistent JSON layouts (F1 edit mode), undo/redo with full serialization, hot-reloadable textures.",
      "Roadmap items (WebGPU backend, headless CI, models/audio, plugin API docs) are open. The README's marketing register is the one place in this portfolio that does not follow the claims ledger — treat feature lines as design intent.",
    ],
    claims: [
      {
        text: "Undo/redo serialization",
        status: "current",
      },
      {
        text: "WebGPU backend, CI/CD with headless testing, additional asset types, plugin API documentation",
        status: "proposed",
      },
    ],
    related: [],
  },
  {
    slug: "mlai-corporation-www",
    name: "MLAI-CORPORATION-WWW",
    org: "donaldfilimon",
    url: "https://github.com/donaldfilimon/MLAI-CORPORATION-WWW",
    language: "TypeScript · Next 15 · React 19 · Tailwind v4 · Bun",
    accent: "wdbx",
    role: "Canonical web, mobile, and Quasar monorepo",
    oneLiner:
      "The integration home for MLAI's public surfaces: apps/web (site, API routes, private console), apps/mobile (Expo + CloudKit), apps/quasar, and shared contracts / design tokens.",
    summary: [
      "Public figures are always classified measured / target / reported and never interchanged. Product accents and persona colors are different axes: the ABI product is violet, the Abi persona is cyan.",
      "Brand split (architecture freeze 2026-09-02): Quesar — private AI operations — never carries 'Intelligence Without Limits'; Abbey Bot, Abbey, and ABI own it, gated by the claims ledger.",
    ],
    claims: [
      {
        text: "Web gate bun run check:web; mobile, Quasar, and topology gates are separate and independent",
        status: "current",
      },
      {
        text: "A green web gate as mobile evidence, or a green Expo export as a signed CloudKit run",
        status: "not-claimed",
      },
    ],
    gate: "bun run check — topology, web, mobile, quasar in order",
    related: ["abi", "wdbx", "abbey"],
  },
];

/** Cross-cutting facts that recur across the repositories. */
export const knowledge = {
  motto: "Care first. Clarity always. Competence throughout.",
  taglines: [
    {
      surface: "Abbey · ABI · Abbey Bot",
      line: "Intelligence Without Limits — with a claims ledger.",
    },
    {
      surface: "Quesar (private AI ops)",
      line: "Private AI operations.",
    },
    {
      surface: "Vision deck only",
      line: "One Intelligence Platform. Infinite Possibilities.",
    },
  ],
  personas: [
    {
      name: "Abbey",
      role: "Empathic Polymath",
      accent: "abbey" as const,
      register:
        "Warm, precise, scaffolded — metaphor before precision. Onboarding, blog, explainers.",
    },
    {
      name: "Aviva",
      role: "Unfiltered Expert",
      accent: "abi" as const,
      register:
        "Direct, dense, zero hedging. Research and architecture notes.",
    },
    {
      name: "Abi",
      role: "Adaptive Moderator",
      accent: "wdbx" as const,
      register:
        "Concise, policy-aware. Routes and blends the other two; UI microcopy, console, status.",
    },
  ],
  routingPrior:
    "ABI prior 0.40 / 0.30 / 0.30 (Abbey / Aviva / Abi); explicit leading name wins; ties favor Abbey.",
  substrateInvariant:
    "memory ≠ database lookup — an episodic substrate preserves context, causal dependencies, outcomes, versions, constraints, and evidence.",
  statusVocabulary: [
    {
      key: "current" as const,
      label: "Current",
      desc: "Implemented and covered by the repository's own gate.",
    },
    {
      key: "partial" as const,
      label: "Partial",
      desc: "Implemented in part, or proved on one layer but not the next.",
    },
    {
      key: "proposed" as const,
      label: "Proposed",
      desc: "Approved direction; not implemented.",
    },
    {
      key: "not-claimed" as const,
      label: "Not claimed",
      desc: "Stated out loud as absent so nobody infers it.",
    },
  ],
  operatingPrinciples: [
    "No autonomous write action without an observable policy boundary.",
    "No retrieval claim without a traceable source or confidence signal.",
    "No benchmark without environment notes, workload shape, and reproducibility context.",
    "No deployment plan that ignores rollback, incident review, and human escalation.",
  ],
  glossary: [
    {
      term: "WDBX",
      def: "Weighted Directed Backtrace eXecution — the provenance-aware episodic substrate beneath ABI (Rust crates abi-foundation, abi-telemetry, abi-compute, abi-core, abi-wdbx).",
    },
    {
      term: "ABI",
      def: "The canonical cognitive and governance runtime: planning, deterministic persona routing, MCP, plugins, claim-honest capability reporting.",
    },
    {
      term: "IWL",
      def: "Intelligence Without Limits — product naming for the Abbey / ABI / Abbey Bot assistant surfaces, gated by the claims ledger. Never used for Quesar.",
    },
    {
      term: "SEA",
      def: "Sparse Evidence Attention — the selection layer that decides which durable records enter a context pack under a hard token budget.",
    },
    {
      term: "Claims ledger",
      def: "A generated, digested table of what a repository does and does not claim: Current · Partial · Proposed · Not claimed.",
    },
    {
      term: "HNSW",
      def: "Hierarchical Navigable Small World graph index — layered approximate nearest-neighbor search.",
    },
    {
      term: "MVCC",
      def: "Multiversion concurrency control with conflict sets. Readers see a snapshot; writers never block them.",
    },
    {
      term: "Quesar",
      def: "Private AI operations console — invite-only ops surface. Tagline is 'Private AI operations.' Never carries Intelligence Without Limits.",
    },
  ],
  faq: [
    {
      question: "What is the claims ledger?",
      answer:
        "A repository-owned vocabulary for what is Current, Partial, Proposed, or Not claimed. Verbs and marketing copy that are not Current should refuse rather than pretend.",
    },
    {
      question: "Where do performance numbers live?",
      answer:
        "Not on /knowledge or /repositories. Benchmarks and measured figures require provenance; this site omits unsourced StatBlocks, QPS, and TAM tables.",
    },
    {
      question: "Is Quesar part of IWL?",
      answer:
        "No. Quesar is private AI operations. Intelligence Without Limits belongs to Abbey, Abbey Bot, and ABI — gated by their claims ledgers.",
    },
    {
      question: "How do personas relate to product accents?",
      answer:
        "Different axes. Product ABI is violet; persona Abi is cyan (WDBX accent). Abbey product/persona share emerald; Aviva uses the violet register for dense expert copy.",
    },
  ],
} as const;

export function findRepo(slug: string): Repo | undefined {
  return repos.find((repo) => repo.slug === slug);
}
