import type { Accent } from "./theme";
import type { Provenance } from "@mlai/contracts";

/* ──────────────────────────────────────────────────────────────────────────
   Facts source of truth for the mobile app. Mirrors the web lib/brand.ts.
   Every metric carries provenance: "measured" (reproduced on MLAI hardware),
   "target" (engineering goal), or "reported" (cited research figure). The
   three are never conflated, and the only Apple framing permitted is
   "Built on Apple's public frameworks — Metal, Accelerate, Core ML."
   ────────────────────────────────────────────────────────────────────────── */

export type { Provenance } from "@mlai/contracts";

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

export type Product = {
  slug: Accent;
  name: string;
  kicker: string;
  accent: Accent;
  blurb: string;
  intro: string[];
  features: { title: string; desc: string }[];
};

export const products: Record<Accent, Product> = {
  wdbx: {
    slug: "wdbx",
    name: "WDBX",
    kicker: "Storage",
    accent: "wdbx",
    blurb: "A local-first Rust vector store that keeps retrieval inspectable.",
    intro: [
      "A vector database has one job: given a query vector, find the nearest stored vectors fast, and keep doing it correctly as the data grows. Most systems solve this in the cloud. WDBX solves it on the device.",
      "The active Rust substrate combines a dimension-checked store, layered HNSW retrieval, durable snapshots and WAL recovery, MVCC history, and reference vector codecs. Optional accelerator paths retain a deterministic CPU oracle.",
    ],
    features: [
      { title: "Layered HNSW", desc: "Dimension-checked graph search with M=16, EF_CONSTRUCTION=40, and EF_SEARCH=32." },
      { title: "Durable recovery", desc: "Snapshots and a write-ahead log rebuild the store and HNSW graph after restart." },
      { title: "Reference codecs", desc: "Deterministic scalar, product-quantization, Huffman, rANS, and autoencoder artifact paths." },
      { title: "Optional Metal path", desc: "Supported macOS builds verify vector execution against the deterministic CPU oracle." },
      { title: "MVCC", desc: "Append-only versions preserve inspectable transaction history and conflicts." },
      { title: "Chained audit history", desc: "Immutable blocks make the local history independently checkable." },
    ],
  },
  abi: {
    slug: "abi",
    name: "ABI Framework",
    kicker: "Compute",
    accent: "abi",
    blurb: "Rust accelerator contracts with deterministic CPU and optional Metal execution.",
    intro: [
      "ABI owns the compute and orchestration contracts shared by the stack. Its deterministic CPU SIMD implementation is the correctness baseline.",
      "On supported macOS builds, optional Metal dot, cosine, norm, and batch-cosine paths are called runtime-verified only after they match the CPU oracle. Availability alone is not reported as execution.",
    ],
    features: [
      { title: "Typed accelerator contracts", desc: "Object-safe backends expose one explicit execution boundary." },
      { title: "Deterministic CPU SIMD", desc: "Stable CPU results remain the oracle for optional accelerators." },
      { title: "Optional Metal kernels", desc: "macOS vector kernels are scoped to the operations actually exercised." },
      { title: "Evidence ladder", desc: "Compiled, available, initialized, executed, and runtime-verified are distinct states." },
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
