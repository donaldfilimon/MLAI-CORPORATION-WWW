/**
 * content.ts — all long-form prose, grounded in brand.ts.
 * Rule: introduces zero new numbers. A figure belongs in brand.ts with a tag.
 */

export const home = {
  heroLead:
    "Everything else is the engineering that makes that true without giving up speed, scale, or correctness. A vector store in Zig, a compute framework beneath it, an assistant on top.",
  contrastSub:
    "A retrieval-augmented turn touches inference, an index, and stored data. Conventional stacks put a network between each pair. Unified memory removes the boundary rather than optimising the crossing.",
  stackSub: "Each is usable on its own. Composed, not fused.",
  personaSub:
    "Abi scores each turn and routes it. You get the temperament the question needs, not an average of all of them.",
};

export const architecture = {
  intro:
    "Four layers. The bottom one is hardware we did not build; the other three are the engineering that makes its advantage usable without giving anything up.",
  flowNote:
    "Every step above happens inside one process, in one address space. There is no serialization boundary between the index and the model.",
  measuredNote:
    "Vector-search figures will be published against a named public dataset with the full HNSW parameter set, machine spec, toolchain version, commit hash, and raw trial data — alongside an established library on the same hardware. Quality figures will use named external benchmarks rather than a private harness. Self-reported scores on self-built harnesses are not evidence, and we will not publish any.",
};

export const wdbx = {
  tagline: "Vectors without a runtime.",
  body: "An in-process vector store written in Zig with no garbage collector and no hidden allocations. HNSW indexing with SIMD cosine distance, append-only blocks chained with SHA-256, a durable write-ahead log with replay and corruption detection, and epoch-gated crash recovery. Deliberately single-node.",
  notes: [
    { title: "Snapshot iteration", body: "Blocks are written once and iterated as snapshots. Readers see a consistent view without a global lock. Full transactional MVCC is a target, not the shipped model." },
    { title: "Integrity at the log", body: "Each commit extends a SHA-256 chain over the WAL. Altering history invalidates every subsequent link. Tamper-evidence for a local audit trail — not a witnessed transparency log." },
    { title: "Compute dispatch", body: "A Metal dot kernel is live on macOS. Other backends are detected but not yet dispatched to. CPU SIMD is the fallback everywhere." },
    { title: "Explicit allocation", body: "Every allocating call takes an allocator. Arena, fixed-buffer, or your own — WDBX does not care which." },
  ],
  faq: [
    { q: "Why single-node?", a: "Because the thesis is that inference, index, and data share a chip. Distribution reintroduces the network hop the design exists to remove. Single-node is the point, not a limitation being worked around." },
    { q: "Is the hash chain a blockchain?", a: "No. It is a linear SHA-256 chain over a local log. It proves the log has not been altered since a digest you hold. It provides no distributed consensus and does not try to." },
    { q: "How large a corpus?", a: "Bounded by unified memory on the target machine. Measured limits will be published alongside the benchmark harness rather than estimated here." },
  ],
};

export const abi = {
  tagline: "Compute and routing as first-class primitives.",
  body: "ABI is the compute framework — tensors, Metal kernels, zero-copy unified-memory pipelines — and the orchestration layer on top of it. It scores each turn with deterministic keyword-weighted heuristics and optional EMA state, selects a persona, and grounds the response in a WDBX-backed retrieval pass.",
  notes: [
    { title: "Zero-copy pipelines", body: "A tensor written by the CPU is readable by the GPU with no transfer. The framework is built around that rather than around a host/device split it would have to hide." },
    { title: "Deterministic routing", body: "Keyword-weighted scoring on affect, directness, and urgency cues picks the persona. Predictable, inspectable, cheap. A learned policy is the target once there is data worth training on." },
    { title: "Retrieval without a hop", body: "Retrieval hits the same in-process store. There is no network boundary between the index and the model." },
    { title: "Moderation in-path", body: "Content moderation runs before generation, not as a post-hoc filter that can be forgotten." },
  ],
  faq: [
    { q: "Is the router a neural model?", a: "Not today. It is deterministic keyword-weighted scoring with optional exponential-moving-average state. A learned policy is on the roadmap and is labelled as a target wherever it appears." },
    { q: "What does blending mean?", a: "The router can weight two profiles for a single turn. It is a scoring blend over deterministic profiles, not neural output interpolation." },
  ],
};

export const abbey = {
  tagline: "The stack, pointed at a person.",
  body: "Abbey is what the platform looks like when a human is on the other end: personas, routing, and local memory. Deployed today as a self-learning Discord bot on Bun and discord.js v14, with a Swift 6 / Vapor 4 port underway and an MLX training pipeline in progress.",
  notes: [
    { title: "Memory is not a bolt-on", body: "Recall is a vector search against the same store the rest of the stack uses. There is no separate memory service to keep in sync." },
    { title: "Consent before voice", body: "Voice activation requires the caller to be present in the channel. The presence and consent requirements are controls, not obstacles to route around." },
    { title: "Swift 6 / Vapor 4 port", body: "A native port for teams that want Abbey inside an Apple-platform service rather than a Node-shaped runtime. In progress, not in the current repository." },
    { title: "MLX training pipeline", body: "An on-device transformer training path. Target, not a shipped artifact — see the provenance tag on the model figure." },
  ],
  faq: [
    { q: "Where can I try it?", a: "In the MLAI Discord, in #abbey. Start with text; voice is optional and requires the published consent flow." },
    { q: "Does it send my conversation anywhere?", a: "The design intent is local-first: inference and recall run on your hardware. Deployment-specific behaviour is documented per deployment rather than asserted globally here." },
  ],
};

export const docs = {
  intro:
    "Structured on Diátaxis. Tutorials teach, how-tos solve, reference describes, explanation justifies. Mixing them is why most documentation fails.",
  buildNote:
    "Pre-release. No tagged releases yet; the main branch tracks a development toolchain and will break on other versions. Integration tests are partial — see the repository backlog.",
  sections: [
    { key: "tutorials", title: "Tutorials", kind: "Learning-oriented",
      body: "Start here if you have never built against WDBX. A working index, end to end.",
      links: ["Your first index", "Adding a retrieval pass", "Wiring the personas"] },
    { key: "howto", title: "How-to guides", kind: "Goal-oriented",
      body: "Recipes for problems you already know you have.",
      links: ["Enable the Metal kernel", "Tune HNSW parameters", "Toolchain migration"] },
    { key: "reference", title: "Reference", kind: "Information-oriented",
      body: "Exhaustive API surface, generated from source.",
      links: ["wdbx.Db", "abi.Runtime", "REST endpoints"] },
    { key: "explanation", title: "Explanation", kind: "Understanding-oriented",
      body: "Why the system is shaped the way it is.",
      links: ["Why Zig", "Integrity at the log", "Why routing is deterministic"] },
  ],
};

export const company = {
  intro:
    "Building privacy-first AI infrastructure for teams that are latency-bound or cannot send data off-device. Open core, Apache-2.0, developed in the open.",
  approach: [
    { title: "Publish the audit", body: "The repository carries a claims audit that disowns anything the code does not prove. That document governs this website too." },
    { title: "Open core, honestly", body: "The engine is Apache-2.0. Any commercial layer will be delineated up front rather than carved out of what people already depend on." },
    { title: "Stewardship with teeth", body: "High-risk deployments face an actual gate, not an advisory note." },
  ],
  contact:
    "We are talking to a small number of teams before the engine goes fully public. If your workload is latency-bound or you cannot send data off-device, we would like to hear about it.",
};
