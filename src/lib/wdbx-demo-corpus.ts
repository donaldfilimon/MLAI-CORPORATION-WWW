import type { Doc } from "./wdbx-demo";

/** Demo corpus. Each entry indexes one concept from the MLAI stack.
 *  Persona/governance entries are worded to match the verified router and
 *  constitution (no aspirational mechanisms presented as shipped). */
export const CORPUS: Doc[] = [
  // ---- WDBX internals ----
  { id: "hnsw", tag: "wdbx", title: "ANN indexing", text: "Approximate nearest-neighbor indexes are the intended production path for scaling beyond the browser demo corpus." },
  { id: "mvcc", tag: "wdbx", title: "MVCC snapshots", text: "Multiversion concurrency control lets readers acquire snapshots without locks; writes create new versions so inference never blocks on ingestion." },
  { id: "shard", tag: "wdbx", title: "Query routing", text: "The demo routes queries deterministically across local shards; production routing claims should point back to source evidence." },
  { id: "chain", tag: "wdbx", title: "Block chaining", text: "Each block header carries a cryptographic hash of the previous block, making conversation history tamper-evident and strictly ordered." },
  { id: "backtrack", tag: "wdbx", title: "Neural backtracking", text: "Traverse the chain backwards to find the exact divergence point where a model began to hallucinate or drift from ground truth." },
  { id: "retention", tag: "wdbx", title: "Retention boundaries", text: "Privacy-first memory needs explicit retention and deletion semantics before hosted deployments make customer-facing promises." },
  { id: "cosine", tag: "wdbx", title: "Cosine similarity", text: "The default metric for semantic text retrieval measures vector orientation, ignoring magnitude, so meaning drives the match." },
  { id: "l2", tag: "wdbx", title: "Euclidean distance", text: "L2 norm is used where magnitude matters: clustering and anomaly detection inside the embedding space." },
  { id: "wal", tag: "wdbx", title: "Write-ahead log", text: "Durable append-only logging at the WAL level pairs with the block chain for crash recovery and audit." },
  { id: "security", tag: "wdbx", title: "Security track", text: "Encryption, access control, and auditability belong on the verification roadmap until implementation paths are linked." },
  { id: "tenancy", tag: "wdbx", title: "Namespace boundaries", text: "Namespace-scoped records are the design vocabulary for separating memory domains." },
  { id: "quant", tag: "wdbx", title: "Compression roadmap", text: "Compressed vector codes are a future scaling topic that should be measured before public claims use exact numbers." },
  { id: "coordination", tag: "wdbx", title: "Coordination roadmap", text: "Distributed coordination is a roadmap area; the public site should not imply production cluster behavior without evidence." },
  { id: "repl", tag: "wdbx", title: "Replication roadmap", text: "Replication and failover need source-backed status before they appear as shipped capabilities." },
  { id: "namespace", tag: "wdbx", title: "Namespace-scoped memory", text: "Per-channel vector memory isolates context windows by namespace — the pattern the Discord integration uses for channels." },
  { id: "dims", tag: "wdbx", title: "Embedding dimensions", text: "Dense embeddings are searched with approximate nearest-neighbor indices; this miniature uses a 256-dimension feature hash." },

  // ---- ABI framework / compute ----
  { id: "metal", tag: "abi", title: "Metal target", text: "Apple Silicon acceleration is the priority target, with exact backend status tied to source evidence." },
  { id: "cuda", tag: "abi", title: "CUDA target", text: "NVIDIA acceleration is a portability target, not a production performance claim on this public site." },
  { id: "vulkan", tag: "abi", title: "Vulkan target", text: "Cross-vendor compute is a roadmap topic for heterogeneous machines and labs." },
  { id: "webgpu", tag: "abi", title: "WebGPU target", text: "Browser-side compute should stay labeled as demo or research unless linked to implementation evidence." },
  { id: "fpga", tag: "abi", title: "FPGA research", text: "Fixed-function acceleration remains exploratory until implementation and measurement are published." },
  { id: "zerocopy", tag: "abi", title: "Tensor-transfer target", text: "Host/device transfer claims need source-backed measurements before they become marketing copy." },
  { id: "comptime", tag: "abi", title: "Comptime direction", text: "Zig compile-time execution can specialize hot paths where repository code proves it." },
  { id: "nogc", tag: "abi", title: "Explicit allocation", text: "Zig makes allocation and lifetimes visible, which is the right discipline for runtime work." },
  { id: "worksteal", tag: "abi", title: "Scheduler track", text: "Scheduler and allocator claims should be promoted only from source-backed status." },
  { id: "attention", tag: "abi", title: "Multi-head attention", text: "Standard scaled dot-product attention; softmax of query-key products over the value matrix." },
  { id: "hybrid", tag: "abi", title: "Hybrid ranking", text: "Retrieval candidates rank by a product of bounded factors — semantic, temporal, causal, and persona weight — so any weak factor sinks the score." },
  { id: "lora", tag: "abi", title: "LoRA fine-tuning", text: "Low-rank adapters specialize the base model per persona without full retraining." },
  { id: "specdec", tag: "abi", title: "Speculative decoding", text: "A draft model proposes tokens the target model verifies, cutting latency on long generations." },
  { id: "kvcache", tag: "abi", title: "Sliding-window KV cache", text: "Bounded key-value memory keeps long conversations within fixed inference budgets." },
  { id: "simd", tag: "abi", title: "SIMD everywhere", text: "Runtime CPU detection selects AVX-512 or NEON paths; vector math saturates the lanes available." },
  { id: "mlx", tag: "abi", title: "MLX training pipeline", text: "A GQA transformer training stack on Apple's MLX with BPE tokenization, fill-in-middle, and AdamW cosine warmup." },

  // ---- personas ----
  { id: "abbey", tag: "persona", title: "Abbey — empathetic polymath", text: "High-EQ tutoring and supportive technical help, explaining the why behind the what — warm, precise, never condescending." },
  { id: "aviva", tag: "persona", title: "Aviva — direct expert", text: "Uses a concise expert register for technical diagnosis, documentation, and retrieval-heavy answers. Proposes; never executes on its own." },
  { id: "abi-p", tag: "persona", title: "Abi — adaptive moderator", text: "The governance layer: policy-aware routing and execution, but only once a plan clears review." },
  { id: "routing", tag: "persona", title: "Persona routing", text: "Normalized weights over inspectable input signals decide which persona answers; the decision is a trace event, not a hidden model call." },
  { id: "blend", tag: "persona", title: "Routing strategies", text: "A clear winner answers alone; contested weights run personas in parallel; a genuinely split decision escalates to consensus." },
  { id: "ethics", tag: "persona", title: "Constitution principles", text: "Six weighted principles — truthfulness, safety, helpfulness, fairness, privacy, transparency — gate responses in the governance validator." },
  { id: "bias", tag: "persona", title: "Bias review", text: "Fairness checks belong in the moderation contract and should be verified before exact threshold claims are published." },
  { id: "scaffold", tag: "persona", title: "Scaffolding protocol", text: "Abbey answers in layers: metaphor first, precise answer second, exploration paths third." },
  { id: "empathy", tag: "persona", title: "Care register", text: "Abbey's mode emphasizes supportive explanation and technical clarity — care first, clarity always, competence throughout." },

  // ---- infra / company ----
  { id: "littles", tag: "infra", title: "Little's Law", text: "Throughput claims need measured concurrency and latency; benchmarks track that proof standard." },
  { id: "autoscale", tag: "infra", title: "Scaling roadmap", text: "Autoscaling and hosted operations are future deployment concerns, not current claims." },
  { id: "auth", tag: "infra", title: "Auth roadmap", text: "Auth and authorization need audited implementation links before appearing as shipped features." },
  { id: "lb", tag: "infra", title: "Load-balancing roadmap", text: "Traffic distribution belongs in deployment documentation once the hosted service exists." },
  { id: "dr", tag: "infra", title: "Recovery roadmap", text: "Backup and restore behavior should be proven with drills before becoming public collateral." },
  { id: "hosting", tag: "infra", title: "Hosting direction", text: "Local-first remains the default; managed hosting is a future product direction." },

  // ---- docs / dx ----
  { id: "zigbuild", tag: "docs", title: "Repo wrapper", text: "Use checked-in build scripts and current repository guidance as the source of truth." },
  { id: "bunstack", tag: "docs", title: "Bun + TypeScript services", text: "Service layers run on Bun with TypeScript; the site ships as a Next.js App Router application." },
];
