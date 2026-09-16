import type { Accent } from "./theme";

/* ──────────────────────────────────────────────────────────────────────────
   Facts source of truth for the mobile app. Mirrors the web lib/brand.ts.
   Every metric carries provenance: "measured" (reproduced on MLAI hardware),
   "target" (engineering goal), or "reported" (cited research figure). The
   three are never conflated, and the only Apple framing permitted is
   "Built on Apple's public frameworks — Metal, Accelerate, Core ML."
   ────────────────────────────────────────────────────────────────────────── */

export type Provenance = "measured" | "target" | "reported";

export type Stat = {
  value: string;
  label: string;
  provenance: Provenance;
};

export const company = {
  name: "Machine Learning Advanced Innovations, Inc.",
  short: "MLAI",
  tagline: "Privacy-first AI infrastructure for Apple Silicon.",
  appleFraming: "Built on Apple's public frameworks — Metal, Accelerate, Core ML.",
  location: "Orlando, FL",
  entity: "Delaware C-Corp",
  founder: "Donald Filimon",
  founderRole: "Founder & Systems Architect",
  principles: [
    { title: "Disciplined secrecy", body: "Build quietly, ship deliberately, say only what is true." },
    { title: "Mission stewardship", body: "Privacy is the product, not the marketing." },
    { title: "Operational velocity", body: "A small team with the right tools, moving fast." },
  ],
} as const;

export const heroStats: Stat[] = [
  { value: "2.3ms", label: "p50 search latency", provenance: "measured" },
  { value: "98.2%", label: "Recall@10", provenance: "measured" },
  { value: "16.5K", label: "QPS — stress objective", provenance: "target" },
  { value: "0.8ms", label: "p50 @ 1M vectors", provenance: "target" },
];

export type Product = {
  slug: Accent;
  name: string;
  kicker: string;
  accent: Accent;
  blurb: string;
  intro: string[];
  features: { title: string; desc: string }[];
  stats: Stat[];
};

export const products: Record<Accent, Product> = {
  wdbx: {
    slug: "wdbx",
    name: "WDBX",
    kicker: "Storage",
    accent: "wdbx",
    blurb: "A privacy-first vector database that runs where the data lives.",
    intro: [
      "A vector database has one job: given a query vector, find the nearest stored vectors fast, and keep doing it correctly as the data grows. Most systems solve this in the cloud. WDBX solves it on the device.",
      "Written in Zig for control without a runtime — no garbage collector in the hot path, SIMD as a language feature, and a single static binary. The same distance kernel compiles to AVX-512 on a server and NEON on Apple Silicon.",
    ],
    features: [
      { title: "HNSW indexing", desc: "Hierarchical Navigable Small World graphs — logarithmic search, tunable recall (M=16, efC=200)." },
      { title: "Memory-mapped persistence", desc: "mmap + write-ahead log. Near-instant cold starts; durable, checksummed writes." },
      { title: "Quantization", desc: "Product & scalar quantization for large datasets that fit in unified memory." },
      { title: "Metal GPU", desc: "Distance calculations on Apple GPU via the ABI Framework. App Store-shippable." },
      { title: "MVCC", desc: "Readers never block writers; writers never block readers." },
      { title: "Hash-chained WAL", desc: "Tamper-evident audit trail at the log level — integrity without taxing search." },
    ],
    stats: [
      { value: "2.3ms", label: "p50 search latency", provenance: "measured" },
      { value: "98.2%", label: "Recall@10", provenance: "measured" },
      { value: "16.5K", label: "QPS — stress objective", provenance: "target" },
      { value: "0.8ms", label: "p50 @ 1M vectors", provenance: "target" },
    ],
  },
  abi: {
    slug: "abi",
    name: "ABI Framework",
    kicker: "Compute",
    accent: "abi",
    blurb: "The GPU compute layer — tensors and Metal kernels on Apple Silicon.",
    intro: [
      "ABI is the compute layer that runs the math. WDBX needs distance calculations and embeddings; Abbey needs inference. ABI spends the GPU to make both fast.",
      "On Apple Silicon the CPU and GPU share one pool of memory, so a tensor produced by one stage is visible to the next without moving a byte. ABI is written around that fact — pipelines are zero-copy by construction.",
    ],
    features: [
      { title: "N-dimensional tensors", desc: "Automatic differentiation, SIMD CPU paths, and Metal GPU kernels." },
      { title: "Neural-network layers", desc: "Dense, Conv2D, LSTM, Attention with full backpropagation." },
      { title: "Zero-copy pipelines", desc: "Unified memory means no host↔device copy between stages." },
      { title: "Capability reporting", desc: "Adapts to the GPU it runs on across M-series generations." },
    ],
    stats: [
      { value: "5×", label: "GPU matmul, 128²", provenance: "measured" },
      { value: "84×", label: "GPU matmul, 1024²", provenance: "measured" },
      { value: "295×", label: "GPU matmul, 4096²", provenance: "target" },
      { value: "13×", label: "10-layer NN forward", provenance: "measured" },
    ],
  },
  abbey: {
    slug: "abbey",
    name: "Abbey",
    kicker: "Application",
    accent: "abbey",
    blurb: "A private, emotionally aware assistant with local vector memory.",
    intro: [
      "Abbey is the layer people talk to. Underneath it is WDBX for memory and ABI for compute; on the surface it is an assistant with a personality, a memory, and a strong opinion about where your data lives — on your hardware.",
      "It is not one assistant but three personas over one core, because a model tuned to be warm is bad at being blunt. So the system splits the job and routes between them.",
    ],
    features: [
      { title: "Three personas", desc: "Abbey (empathetic), Aviva (unfiltered expert), Abi (the router) — one core." },
      { title: "Local memory", desc: "Conversations embedded and stored in WDBX, on-device. Recall is a vector lookup." },
      { title: "Neural backtracking", desc: "Hash-chained interaction blocks rewind to the divergence point on drift." },
      { title: "Multi-provider", desc: "OpenAI, Anthropic, or a local model via Ollama — the model is pluggable." },
    ],
    stats: [
      { value: "0.92", label: "Abbey empathy score", provenance: "reported" },
      { value: "90.5%", label: "Abbey technical accuracy", provenance: "reported" },
      { value: "30%", label: "Aviva latency reduction", provenance: "reported" },
      { value: "40%", label: "Aviva density gain", provenance: "reported" },
    ],
  },
};

export const productOrder: Accent[] = ["wdbx", "abi", "abbey"];

export const platformLayers = [
  { title: "Trace Layer", body: "Retrieval paths, policy checks, tool calls — captured as inspectable events.", meta: "what the agent saw" },
  { title: "Control Plane", body: "Which agents may plan, review, execute, escalate, or abstain. Capability is a grant.", meta: "what it was allowed to do" },
  { title: "Evaluation Mesh", body: "Regression scenarios across faithfulness, latency, safety, and prompt injection.", meta: "how it was tested" },
  { title: "Private Runtime", body: "Cloud, VPC, on-premise, and offline-first. The boundary is your choice.", meta: "where it runs" },
] as const;

export const whyNow = [
  { title: "Hardware crossed the line", body: "The M4 Neural Engine makes 7B–13B models interactive on-device, on hundreds of millions of shipped devices." },
  { title: "Regulation rewards locality", body: "GDPR and the EU AI Act make on-device processing a compliance posture, not a preference." },
  { title: "Cloud economics inverted", body: "On-device inference carries zero marginal cost; the cloud's per-query cost compounds." },
  { title: "Open models matured", body: "Llama, Mistral, and Phi are capable at on-device sizes. The model stopped being the moat." },
] as const;

export const investorHighlights: Stat[] = [
  { value: "$1.5M", label: "Pre-seed raise", provenance: "reported" },
  { value: "18mo", label: "Runway to Series A", provenance: "reported" },
  { value: "$2.88B", label: "Vector-DB market 2026", provenance: "reported" },
  { value: "200M+", label: "Apple Silicon devices", provenance: "reported" },
];

export const links = {
  github: "https://github.com/donaldfilimon/abi",
  site: "https://mlai.dev",
  founder: "https://donaldfilimon.com",
  x: "https://x.com/donaldfilimonx",
} as const;

export const provenanceMeta: Record<Provenance, { glyph: string; label: string; color: Accent | "warn" }> = {
  measured: { glyph: "●", label: "measured", color: "abbey" },
  target: { glyph: "○", label: "target", color: "warn" },
  reported: { glyph: "◆", label: "reported", color: "abi" },
};
