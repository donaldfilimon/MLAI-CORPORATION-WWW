/**
 * brand.ts — the only place facts live.
 *
 * Provenance contract:
 *   measured — named dataset + runnable harness + hardware/software spec +
 *              >=3 trials, all linked from the figure. Missing one => target.
 *   target   — a design goal. Not achieved, or not reproduced under control.
 *   reported — third-party figure, cited, not independently verified.
 */
import { T } from "./tokens";

export type Prov = "measured" | "target" | "reported";

export const PROV: Record<Prov, { mark: string; label: string; color: string; def: string }> = {
  measured: {
    mark: "●", label: "Measured", color: T.signal,
    def: "Named dataset, runnable harness, hardware and software spec, at least three trials — all linked from the figure. Missing any one and it is a target.",
  },
  target: {
    mark: "○", label: "Target", color: "#A1A1AA",
    def: "A design goal. Not yet achieved, or not yet reproduced under controlled conditions.",
  },
  reported: {
    mark: "◆", label: "Reported", color: T.aviva,
    def: "Sourced from a third party. Cited, not independently verified. Never used for our own numbers.",
  },
};

export interface Metric { label: string; value: string; prov: Prov; note: string }

export const org = {
  name: "MLAI",
  builder: "Donald Filimon",
  tagline: "The inference, the index, and the data live on the same chip.",
  thesis:
    "Everything else is the engineering that makes that true without giving up speed, scale, or correctness.",
  email: "hello@mlai.dev",
  repo: "https://github.com/donaldfilimon/abi",
  licence: "Apache-2.0",
  url: "https://mlai.dev",
} as const;

/** Persona colours are fixed by the three nodes in the brand mark. Do not remap. */
export const personas = [
  {
    key: "abbey", name: "Abbey", role: "Empathetic polymath", color: T.abbey,
    blurb: "Broad-domain reasoning with affective grounding. The default profile and the neutral-route winner.",
    traits: ["Affective grounding", "Cross-domain synthesis", "Default route"],
  },
  {
    key: "aviva", name: "Aviva", role: "Direct precision expert", color: T.aviva,
    blurb: "Terse, citation-dense, low-variance. Selected on direct or urgent cues. Refuses rather than confabulates.",
    traits: ["Citation density", "Low variance", "Calibrated refusal"],
  },
  {
    key: "abi", name: "Abi", role: "Moderator / router", color: T.abiPersona,
    blurb: "Scores each turn, then routes to Abbey, Aviva, or a blend. Deterministic today; a learned policy is the target.",
    traits: ["Keyword-weighted", "EMA state", "Blend arbitration"],
  },
] as const;

export const products = [
  { key: "wdbx", href: "/wdbx", name: "WDBX", tag: "Vector storage", color: T.wdbx, lang: "Zig",
    summary: "In-process HNSW store. Hash-chained write-ahead log, snapshot iteration, no garbage collector." },
  { key: "abi", href: "/abi", name: "ABI", tag: "Compute + routing", color: T.abi, lang: "Zig",
    summary: "Tensors, Metal kernels, zero-copy pipelines — and the persona router that sits on top." },
  { key: "abbey", href: "/abbey", name: "Abbey", tag: "Assistant", color: T.abbey, lang: "TS · Swift",
    summary: "Personas, routing, local memory. A Discord bot today; a Swift/Vapor port underway." },
] as const;

export const layers = [
  { n: "01", name: "Silicon", role: "Hardware substrate", color: T.faint,
    detail: "Apple Silicon. Unified memory, Neural Engine reached through Core ML.",
    why: "One address space for CPU and GPU. A tensor written by one is readable by the other with no transfer. This is the property everything above is designed to exploit." },
  { n: "02", name: "ABI", role: "GPU compute", color: T.abi,
    detail: "Tensors · Metal kernels · zero-copy unified-memory pipelines.",
    why: "Built around unified memory rather than around a host/device split it would have to hide. A live Metal dot kernel on macOS; CPU SIMD fallback everywhere else." },
  { n: "03", name: "WDBX", role: "Vector storage", color: T.wdbx,
    detail: "HNSW (M=16, efConstruction=200) · snapshot iteration · hash-chained WAL.",
    why: "In-process, single-node by design. Integrity lives at the write-ahead log so tamper-evidence costs nothing on the read path." },
  { n: "04", name: "Abbey", role: "Assistant layer", color: T.abbey,
    detail: "Personas (Abbey, Aviva, Abi) · routing · local memory.",
    why: "The stack pointed at a person. Recall is a vector search against the same store — memory is not a separate service to keep in sync." },
] as const;

export const wdbxMetrics: Metric[] = [
  { label: "Index", value: "HNSW", prov: "measured", note: "M=16 · efConstruction=200 · SIMD cosine" },
  { label: "Concurrency", value: "Snapshot", prov: "measured", note: "Append-only · readers never block" },
  { label: "Durability", value: "WAL", prov: "measured", note: "Replay · corruption detection · epoch recovery" },
  { label: "Integrity", value: "SHA-256", prov: "measured", note: "Chained at the log, not the index" },
];

export const abiMetrics: Metric[] = [
  { label: "GPU dispatch", value: "Metal", prov: "measured", note: "Live kernel on macOS · CPU SIMD fallback" },
  { label: "Router", value: "Deterministic", prov: "measured", note: "Keyword-weighted + optional EMA" },
  { label: "Retrieval", value: "In-process", prov: "measured", note: "WDBX-backed · no network hop" },
  { label: "Moderation", value: "In-path", prov: "measured", note: "Runs before generation" },
];

export const abbeyMetrics: Metric[] = [
  { label: "Runtime", value: "Bun", prov: "measured", note: "discord.js v14 · TypeScript" },
  { label: "Memory", value: "WDBX", prov: "measured", note: "Recall over the same store" },
  { label: "Swift port", value: "In progress", prov: "target", note: "Swift 6 · Vapor 4" },
  { label: "Model", value: "~1B params", prov: "target", note: "MLX pipeline · in progress" },
];

/** Values stay em-dash until a reproducible harness exists. */
export const benchmarks = [
  { sys: "WDBX", metric: "Index type", value: "HNSW", prov: "measured" as Prov, cond: "M=16 · efConstruction=200" },
  { sys: "WDBX", metric: "GPU dispatch", value: "Metal", prov: "measured" as Prov, cond: "macOS dot kernel" },
  { sys: "WDBX", metric: "Query latency p99", value: "—", prov: "target" as Prov, cond: "Harness not yet published" },
  { sys: "WDBX", metric: "Throughput", value: "—", prov: "target" as Prov, cond: "Harness not yet published" },
  { sys: "ABI", metric: "Routing latency", value: "—", prov: "target" as Prov, cond: "Harness not yet published" },
  { sys: "Abbey", metric: "Quality evals", value: "—", prov: "target" as Prov, cond: "No external benchmark run yet" },
];

/** Design specifications. None is a performance claim. */
export const formalModel = [
  { name: "Hash-chained WAL", expr: "Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ),  H₀ = 0",
    note: "Integrity at the log, so the audit trail is tamper-evident without taxing search latency." },
  { name: "Composite retrieval score", expr: "sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ",
    note: "Similarity × recency × causal-hop × source authority." },
  { name: "Persona routing", expr: "argmax P(persona | input, context)",
    note: "Deterministic keyword-weighted estimate today. A learned policy is the target." },
];

export const principles = [
  { title: "One architecture, deeply", color: T.wdbx,
    body: "Targeting Apple Silicon first means using Metal, Accelerate, and Core ML directly instead of abstracting across platforms and losing the unified-memory advantage that makes on-device viable." },
  { title: "Zig for the hot paths", color: T.abi,
    body: "No garbage collection, no hidden allocations, SIMD as a language primitive, single-binary cross-compilation. WDBX and ABI share one numeric lowering." },
  { title: "Integrity at the log", color: T.abbey,
    body: "Hash-chaining lives at the write-ahead-log level, so tamper-evidence costs nothing on the read path." },
  { title: "Provenance first-class", color: T.signal,
    body: "The data model refuses to let a target be presented as a result. Every figure carries its own tag." },
];

export const APPLE_DISCLAIMER =
  "MLAI is independent. It is not affiliated with, endorsed by, or sponsored by Apple Inc. References to Metal, Accelerate, and Core ML describe publicly documented Apple frameworks that MLAI software targets. Apple, Metal, Accelerate, Core ML, and Apple Silicon are trademarks of Apple Inc.";
