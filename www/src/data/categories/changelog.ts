import { ChangelogSchema, type Changelog } from '../schemas';

/**
 * Release history, ported from the mlai-vite iteration. Versions/dates are
 * presentation-layer markers aligned to the project's documented milestones
 * (Zig migrations, WDBX storage engine, Abbey training stack) — the page
 * states this framing explicitly; edit freely as releases formalize.
 */
export const changelog: Changelog = ChangelogSchema.parse([
  {
    version: "v0.9.0",
    date: "2026-05-14",
    title: "Zig 0.17-dev migration begins",
    items: [
      { cat: "changed", text: "Runtime migration to Zig 0.17.0-dev started: std.process.Init entry-point pattern, argsAlloc removal, allowlist-only environString." },
      { cat: "added", text: "Framework spec pages published on the docs site, including the canonical Abbey–Aviva–Abi specification." },
      { cat: "fixed", text: "JSON-RPC envelope generation corrected in protocol tooling — responses now always emit complete closing frames." },
    ],
  },
  {
    version: "v0.8.0",
    date: "2026-04-08",
    title: "Abbey training pipeline",
    items: [
      { cat: "added", text: "Full Zig + MLX training stack: GQA transformer (LLaMA-style, 22 layers, 16Q/4KV heads), BPE tokenizer with fill-in-middle." },
      { cat: "added", text: "LoRA fine-tuning, speculative decoding, sliding-window KV cache, streaming data loader, HuggingFace export, inference REPL." },
      { cat: "changed", text: "AdamW with cosine-warmup learning rate schedule standardized across training configs." },
      { cat: "fixed", text: "Known pending: mlx_value_and_grad hookup awaits a stable C gradient ABI in MLX ≥ 0.23." },
    ],
  },
  {
    version: "v0.7.0",
    date: "2026-03-12",
    title: "Production infrastructure expansion",
    items: [
      { cat: "added", text: "Auth, middleware, and hosted-operation work moved onto the verification roadmap instead of public claims copy." },
      { cat: "changed", text: "Deployment language now separates local-first implementation from future managed-service direction." },
      { cat: "fixed", text: "Public collateral no longer presents security or disaster-recovery behavior without linked evidence." },
    ],
  },
  {
    version: "v0.6.0",
    date: "2026-02-10",
    title: "Performance tooling & test milestone",
    items: [
      { cat: "perf", text: "SIMD CPU detection selects AVX-512 / NEON paths at startup; memory pooling and profiling hooks land in runtime/." },
      { cat: "added", text: "Evidence tracking introduced for benchmarks, source links, and verification gaps." },
      { cat: "changed", text: "Scheduler and allocator language now points readers back to source-backed status." },
    ],
  },
  {
    version: "v0.5.0",
    date: "2026-01-08",
    title: "Zig 0.16 — the Writergate migration",
    items: [
      { cat: "changed", text: "Migrated 95 files to the vtable-based std.io.Reader / Writer interfaces; explicit buffer ownership throughout." },
      { cat: "changed", text: "Standardized ArrayListUnmanaged.empty initialization and explicit allocator passing at every call site." },
      { cat: "added", text: "CI toolchain pinning with a fail-fast version gate mirroring build.zig.zon." },
    ],
  },
  {
    version: "v0.4.0",
    date: "2025-12-04",
    title: "WDBX verification track",
    items: [
      { cat: "changed", text: "Distributed coordination language moved from shipped-feature copy to roadmap/evidence language." },
      { cat: "added", text: "Query routing remains visible in the browser demo as a miniature, not a production cluster claim." },
      { cat: "perf", text: "Performance language now requires repeatable benchmark scripts before exact public numbers." },
    ],
  },
  {
    version: "v0.3.0",
    date: "2025-11-06",
    title: "GPU backend matrix",
    items: [
      { cat: "changed", text: "Metal, CUDA, Vulkan, WebGPU, and FPGA are presented as targets unless implementation evidence is linked." },
      { cat: "added", text: "CPU/SIMD remains the portable baseline for public-facing language." },
      { cat: "perf", text: "Transfer and kernel speedups require source-backed measurements before publication." },
    ],
  },
  {
    version: "v0.2.0",
    date: "2025-10-02",
    title: "Storage engine core",
    items: [
      { cat: "added", text: "HNSW approximate nearest-neighbor index tuned for cache locality." },
      { cat: "added", text: "MVCC snapshot reads — writers never block readers; block-chained WAL for tamper-evident history." },
      { cat: "changed", text: "Security language now describes verification requirements rather than unsupported guarantees." },
    ],
  },
  {
    version: "v0.1.0",
    date: "2025-09-10",
    title: "Initial public release",
    items: [
      { cat: "added", text: "ABI Agent + WDBX database open-sourced under Apache-2.0 — Zig core, persona scaffolding, vector storage." },
      { cat: "added", text: "Multi-provider LLM module: OpenAI, Anthropic, and local Ollama endpoints." },
    ],
  },
]);
