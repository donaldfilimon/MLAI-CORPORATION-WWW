import type { Platform, Runtime } from '../schemas';

export const platform: Platform = ([
  {
    title: "Trace Layer",
    description: "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events.",
    detail: "Useful for debugging, compliance review, incident response, and customer-facing explanations."
  },
  {
    title: "Control Plane",
    description: "Defines which agents can plan, review, execute, escalate, or abstain under each workflow condition.",
    detail: "Keeps risky actions behind explicit approval gates and measurable release criteria."
  },
  {
    title: "Evaluation Mesh",
    description: "Runs regression scenarios across retrieval faithfulness, latency, safety behavior, prompt injection, and human-review burden.",
    detail: "Turns AI quality into a release gate instead of an after-the-fact dashboard."
  },
  {
    title: "Private Runtime",
    description: "Packages LLM orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.",
    detail: "Designed for teams that cannot send sensitive context to unmanaged infrastructure."
  }
]);

/**
 * The six-layer runtime model (L6 interface down to L1 audit), ported from the
 * design-handoff Architecture page and re-grounded, layer by layer, in the
 * active sibling Rust substrate under `~/dev/active/wdbx/crates/`, which
 * outranks the frozen Zig-era documentation mirror. Architecture facts only.
 *
 * Relationship to the untiered `platform` capabilities above: the two lists are
 * complementary views of the same system, not duplicates. `platform` is the
 * product-capability framing (what teams get); `runtimeLayers` is the runtime
 * stack underneath it. The overlaps are deliberate and should stay consistent:
 * the Trace Layer capability is surfaced by the L1 audit layer, the Control
 * Plane rides on L5 orchestration, and the Private Runtime packages the whole
 * L1–L6 stack. Change a fact in one place, check the counterpart.
 *
 * Wording constraints (repo policy — do not "restore" from the handoff file):
 * no distributed-sharding, encryption/RBAC, or unsupported performance claims.
 *
 * Shape is pinned by `RuntimeSchema` and validated through `ContentSchema`
 * with the rest of the copy (content.test.ts).
 */
export const runtime: Runtime = ({
  section: {
    eyebrow: "The runtime underneath",
    title: "Six layers, each with one job.",
    lead: "Beneath the platform capabilities sits the WDBX runtime: thin interfaces over persona routing, retrieval, and acceleration, with every turn landing in chained, append-only memory.",
  },
  layers: [
  {
    tier: "L6",
    title: "Interface",
    // architecture.md Main Modules: CLI parsing, ratatui TUI, HTTP API
    // controller, MCP/LSP/ACP JSON-RPC surfaces. (Discord is deliberately not
    // listed: limitations.md records it as routing scaffolding, not a
    // connected gateway bot.)
    description: "CLI, terminal UI, HTTP API, and protocol surfaces (MCP, LSP, ACP). Thin adapters over the pipeline — no generation or policy logic lives here.",
  },
  {
    tier: "L5",
    title: "Orchestration",
    // architecture.md: "guardrails, Abi routing" in the pipeline shape;
    // "profile routing and persona behavior" under src/abi/*.
    description: "Guardrails and profile routing. Abi — the adaptive, safety-aware moderator — routes each turn across the Abbey, Aviva, and Abi personas before generation begins.",
  },
  {
    tier: "L4",
    title: "Retrieval",
    // architecture.md pipeline shape: WDBX retrieval precedes generation;
    // protocols.md: memory search is advertised as an MCP tool.
    description: "WDBX retrieval feeds generation with stored context, and the same memory search is exposed to external tools over MCP.",
  },
  {
    tier: "L3",
    title: "Acceleration",
    // acceleration.md: CPU is the authoritative backend (dot, normalize,
    // cosine, batch_cosine); WebGPU/TPU are capability reporting, not
    // production dispatch — limitations.md says to keep that honest.
    description: "Vector kernels — dot, normalize, cosine, batch cosine — on a deterministic CPU backend, with WebGPU and TPU support reported as capabilities ahead of real dispatch.",
  },
  {
    tier: "L2",
    title: "Storage",
    // abi-wdbx/src/hnsw.rs and mvcc.rs are the active implementation.
    description: "The WDBX store: layered HNSW retrieval, MVCC transactions, and inspectable history. The cluster RPC transport explicitly does not implement sharding.",
  },
  {
    tier: "L1",
    title: "Audit",
    // protocols.md: teach/note "writes append-only WDBX memory";
    // architecture.md pipeline shape ends with "memory write, and telemetry".
    description: "Append-only chained block memory plus telemetry. Every pipeline turn ends by writing memory and a telemetry record, so the layers above leave receipts.",
    },
  ],

  memorySection: {
    eyebrow: "Memory model",
    title: "Memory that keeps receipts.",
    lead: "The active Rust store pairs HNSW vector retrieval with MVCC and inspectable history. Configuration facts below come directly from the implementation.",
  },

  // Memory-model spec rows for `site/SpecList` (configuration facts, no
  // provenance tags needed). Every row is corroborated by the mirrored WDBX
  // docs; rows from the handoff that were not are dropped, not softened:
  // the docs never name the hash algorithm or a WAL, never describe MVCC or
  // lock-free concurrency (api.md documents an RwLock-guarded pipeline),
  // and never mention weighted provenance paths, per-record point-in-time
  // rollback, or on-open chain verification.
  memoryModel: [
    { k: "Index", v: "Layered HNSW" },
    { k: "Graph degree", v: "M = 16" },
    { k: "Construction breadth", v: "EF_CONSTRUCTION = 40" },
    { k: "Search breadth", v: "EF_SEARCH = 32" },
    { k: "Transactions", v: "MVCC" },
  ],
});
