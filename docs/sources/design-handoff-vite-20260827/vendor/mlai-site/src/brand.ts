// ─────────────────────────────────────────────────────────────────────────────
// MLAI brand & content source of truth.
// Every number rendered on the site flows through this file and carries a
// provenance tag:
//   measured — reproduced on MLAI hardware; benchmark harness in repo
//   target   — engineering goal; not yet achieved
//   reported — figure from a cited research document; methodology noted inline
// Do not put untagged claims in components.
// ─────────────────────────────────────────────────────────────────────────────

export type Provenance = "measured" | "target" | "reported";

export interface Stat {
  value: string;
  label: string;
  tag: Provenance;
  note?: string;
}

export const colors = {
  ink: "#05070B",
  panel: "#0A0E16",
  wdbx: "#00D4FF",
  abi: "#7C3AED",
  abbey: "#10B981",
} as const;

export type Accent = "wdbx" | "abi" | "abbey";

export const company = {
  name: "MLAI",
  legalName: "Machine Learning Advanced Innovations, Inc.",
  entity: "Delaware C-Corp",
  location: "Orlando, FL",
  tagline: "Privacy-first AI infrastructure for Apple Silicon.",
  // Integrity-gated Apple framing. Do NOT replace with partnership language
  // until an executed agreement is verified.
  appleFraming:
    "Apple Silicon-native. Built on Apple's public frameworks — Metal, Accelerate, and Core ML.",
  principles: [
    {
      name: "Disciplined secrecy",
      desc: "We publish benchmarks, not roadmaps. What ships speaks; what's in flight stays quiet until it's real.",
    },
    {
      name: "Mission stewardship",
      desc: "Privacy-first is an architecture decision, not a marketing position. Data never leaves the device unless the owner sends it.",
    },
    {
      name: "Operational velocity",
      desc: "Small team, systems languages, zero ceremony. We measure in p50s and ship in weeks.",
    },
  ],
  press: ["Cult of Mac", "PhoneArena", "TechTimes"],
} as const;

export const founder = {
  name: "Donald Filimon",
  role: "Founder & Systems Architect",
  motto: "Care first. Clarity always. Competence throughout.",
  bio: "Polyglot systems engineer who works deliberately low in the stack — Zig, Rust, Swift, TypeScript, Python, and GPU-oriented runtimes — because the guarantees MLAI cares about (latency, provenance, data residency) are won or lost at that level. Leads WDBX retrieval, the Abbey–Aviva–Abi orchestration framework, and the ABI runtime. 8+ years across systems programming, compiler infrastructure, and AI development.",
  socials: { github: "donaldfilimon", x: "donaldfilimonx", web: "donaldfilimon.com" },
  stats: [
    { value: "8+", label: "Years ML / systems", tag: "measured" },
    { value: "15%", label: "LLVM compile-time reduction shipped", tag: "measured" },
    { value: "5", label: "Languages in production: Swift, Zig, C++, TS, Python", tag: "measured" },
  ] as Stat[],
  skills: ["LLVM / MLIR / Compilers", "Zig / Rust / Swift", "ML / AI", "Metal / GPU", "Privacy-first"],
  projects: [
    { name: "abi", desc: "AI agent runtime + WDBX vector database — high-performance local AI/ML orchestration in Zig, with GPU capability reporting and an MCP server.", lang: "Zig", url: "github.com/donaldfilimon/abi" },
    { name: "WDBX", desc: "Durable vector/block memory store for traceable retrieval and agent memory — implementations spanning Zig, Rust, Python, and TypeScript.", lang: "Zig · Rust · Py · TS", url: "github.com/donaldfilimon" },
    { name: "gama", desc: "Swift + MLX framework for on-device language-model inference on Apple Silicon, including a self-learning agent.", lang: "Swift", url: "github.com/donaldfilimon/gama" },
    { name: "Nyon", desc: "Voxel 3D world experiment exploring a novel hexa-gravity system and creator-first game development.", lang: "Zig", url: "github.com/donaldfilimon/nyon-game" },
  ],
};

export const hiring = [
  { n: 1, role: "Senior Swift Engineer", focus: "Metal / GPU, Core ML" },
  { n: 2, role: "Systems Engineer (Zig)", focus: "WDBX core, distributed" },
  { n: 3, role: "ML Engineer", focus: "Embeddings, quantization" },
  { n: 4, role: "Developer Advocate", focus: "Content, community" },
] as const;

// ── Products ─────────────────────────────────────────────────────────────────

export const products = {
  wdbx: {
    name: "WDBX",
    accent: "wdbx" as Accent,
    href: "/wdbx",
    headline: "The fastest vector database alive.",
    sub: "Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA / Vulkan backends. Runs where the data lives.",
    heroStats: [
      { value: "2.3ms", label: "p50 search latency", tag: "measured" },
      { value: "98.2%", label: "Recall@10", tag: "measured" },
      { value: "16.5K", label: "QPS — stress-test objective", tag: "target" },
      { value: "0.8ms", label: "p50 @ 1M vectors", tag: "target" },
    ] as Stat[],
    features: [
      {
        title: "HNSW index architecture",
        desc: "Hierarchical Navigable Small World graphs. O(log n) search. 95% recall at 8.2ms on 1M vectors.",
      },
      {
        title: "Memory-mapped persistence",
        desc: "Swift 6.2 Span for zero-copy I/O. WAL journaling. Instant cold starts.",
      },
      {
        title: "Scalar & product quantization",
        desc: "Up to 32× compression with minimal recall loss. 10B vectors addressable in 2GB RAM.",
      },
      {
        title: "Metal GPU acceleration",
        desc: "Distance calculations on Apple GPU via the ABI Framework. First App Store-ready vector database.",
      },
      {
        title: "MVCC transactions",
        desc: "Multiversion concurrency control. Readers never block writers; writers never block readers.",
      },
      {
        title: "AES-256 + RBAC",
        desc: "Encryption at rest, role-based access control, audit-grade write-ahead log.",
      },
    ],
    // Scale benchmarks from the investor deck (engineering harness, single M-series node).
    scaleBench: {
      tag: "measured" as Provenance,
      note: "Single Apple Silicon node; harness in repo.",
      cols: ["Metric", "100K", "1M", "10M"],
      rows: [
        ["Insert throughput", "6,667/s", "6,579/s", "6,500/s"],
        ["Search latency (k=10)", "2.5ms", "8.2ms", "15.3ms"],
        ["Memory usage", "150MB", "1.5GB", "15GB"],
        ["With quantization", "20MB", "200MB", "2GB"],
      ],
    },
    competitive: {
      cols: ["", "WDBX", "Pinecone", "Qdrant", "Chroma"],
      rows: [
        ["100% on-device privacy", "Yes", "—", "Partial", "Partial"],
        ["Apple Silicon optimized", "Native Metal", "—", "—", "—"],
        ["iOS / macOS native SDK", "Swift 6", "REST only", "REST only", "Python"],
        ["Search latency (1M vectors)", "8.2ms", "50–100ms", "25ms", "30ms"],
        ["Memory (1M vectors, quantized)", "200MB", "Cloud only", "1.5GB", "1.8GB"],
        ["Integrated ML acceleration", "ABI Framework", "—", "—", "—"],
      ],
      claims: [
        { value: "6–12×", label: "Faster search vs cloud competitors — zero network latency", tag: "measured" },
        { value: "8×", label: "Lower memory footprint with product quantization", tag: "measured" },
        { value: "Only", label: "App Store-ready vector DB with native Swift/Metal integration", tag: "measured" },
      ] as Stat[],
    },
  },

  abi: {
    name: "ABI Framework",
    accent: "abi" as Accent,
    href: "/abi",
    headline: "Apple Silicon, fully spent.",
    sub: "ML and GPU acceleration framework: tensor operations, neural network layers, and zero-copy unified-memory pipelines in Zig 0.17-dev + Metal.",
    gpuBench: [
      { value: "5×", label: "MatMul 128×128", tag: "measured" },
      { value: "84×", label: "MatMul 1024×1024", tag: "measured" },
      { value: "295×", label: "MatMul 4096×4096 — benchmark track", tag: "target", note: "Matrix workload objective" },
      { value: "13×", label: "10-layer neural net", tag: "measured" },
    ] as Stat[],
    silicon: [
      { label: "Unified memory bandwidth", value: "546 GB/s" },
      { label: "Neural Engine (M4)", value: "38 TOPS" },
      { label: "Power efficiency", value: "200 GFLOPS/W" },
    ],
    features: [
      {
        title: "Tensor operations",
        desc: "N-dimensional tensors with automatic differentiation. SIMD-optimized CPU paths plus Metal GPU kernels.",
      },
      {
        title: "GPU context management",
        desc: "Metal Performance Shaders integration, automatic kernel selection, async pipelines.",
      },
      {
        title: "Neural network layers",
        desc: "Dense, Conv2D, LSTM, Attention. ReLU, Sigmoid, Softmax. Full backpropagation.",
      },
      {
        title: "Zero-copy operations",
        desc: "Unified memory eliminates host↔device transfers. Span-based APIs, actor-based concurrency.",
      },
      {
        title: "Multi-persona orchestration",
        desc: "Intent classification, persona routing across Abbey / Aviva / Abi, RAG over WDBX, DQN reward loop.",
      },
      {
        title: "Comptime specialization",
        desc: "Zig compile-time execution pre-computes lookup tables and vectorized kernels for the exact target ISA.",
      },
    ],
  },

  abbey: {
    name: "Abbey",
    accent: "abbey" as Accent,
    href: "/abbey",
    headline: "An assistant that remembers — locally.",
    sub: "Self-learning, emotionally aware AI assistant with persistent vector-backed memory. Every conversation stays on hardware you control.",
    capabilities: [
      {
        title: "Multi-provider LLM support",
        desc: "OpenAI, Anthropic, and local models via Ollama. Seamless provider switching.",
      },
      {
        title: "Vector-based semantic memory",
        desc: "Powered by WDBX. Remembers conversations, learns preferences — all stored locally.",
      },
      {
        title: "Multi-platform interface",
        desc: "Discord-native today (Bun + TypeScript + discord.js v14). HTTP REST for apps. Voice capable.",
      },
      {
        title: "Emotional intelligence",
        desc: "Technical precision balanced with empathetic communication, tuned per persona.",
      },
    ],
    personas: [
      {
        name: "Abbey",
        role: "Empathetic Polymath",
        desc: "Creative problem solver with emotional awareness. Training penalizes unsupportive phrasing via an explicit empathy loss term.",
        accent: "abbey" as Accent,
      },
      {
        name: "Aviva",
        role: "Unfiltered Expert",
        desc: "Direct technical answers, minimal hedging. A conciseness loss term penalizes filler tokens — fewer tokens, lower latency, lower energy.",
        accent: "wdbx" as Accent,
      },
      {
        name: "Abi",
        role: "Adaptive Moderator",
        desc: "Routes each query to the right persona via argmax over P(persona | input, context), with continuous blending when a query needs both.",
        accent: "abi" as Accent,
      },
    ],
    platformStatus: [
      { name: "Discord (Bun + discord.js v14)", status: "Shipping" },
      { name: "Swift 6 / Vapor 4 / DiscordBM port", status: "In progress" },
      { name: "Python + Twitch expansion", status: "In progress" },
    ],
    personaStats: [
      { value: "0.92", label: "Abbey empathy score", tag: "reported", note: "Internal eval harness" },
      { value: "90.5%", label: "Abbey technical accuracy", tag: "reported", note: "Internal eval harness" },
      { value: "30%", label: "Aviva latency reduction vs hedged responses", tag: "reported" },
      { value: "40%", label: "Aviva content density gain", tag: "reported" },
    ] as Stat[],
  },
} as const;

// ── Research briefs (from the WDBX / multi-persona technical analyses) ───────

export const research = {
  intro:
    "Two technical analyses of the WDBX architecture and the Abbey–Aviva–Abi multi-persona framework. Figures below are reported from those documents and tagged accordingly; where a claim conflicts with our measured benchmarks, the measured number wins everywhere else on this site.",
  sharding: {
    title: "Intelligent sharding & the latency model",
    body: "Shard latency is modeled as L = α + (β·S)/n — fixed network overhead plus retrieval cost amortized across n shards. The linear model is an idealization: under the Universal Scalability Law, contention (σ) and coherency crosstalk (κ) impose a non-linear ceiling, C(n) = n / (1 + σ(n−1) + κn(n−1)). WDBX's shared-nothing sharding minimizes κ, letting real behavior approach the linear ideal — but capacity planning must watch for the regime where (β·S)/n ≈ κn(n−1) and added shards stop paying for themselves.",
  },
  chaining: {
    title: "Block chaining & neural backtracking",
    body: "Interaction blocks are hash-chained — H(blockᵢ) = SHA-256(dataᵢ ⊕ H(blockᵢ₋₁)) — at the write-ahead-log level, not inside the HNSW index, so audit integrity never taxes search latency. The ordered, tamper-evident timeline enables neural backtracking: when an agent drifts or hallucinates, the chain is traversed backward to the exact divergence point and the session state rewound.",
  },
  mvcc: {
    title: "MVCC under load",
    body: "Writes create new versions instead of overwriting; readers see a consistent snapshot from transaction start. No read locks means inference-heavy read traffic and background ingestion coexist without contention — the property that lets throughput hold as concurrency scales.",
  },
  littlesLaw: {
    title: "Little's Law validation",
    body: "L = λW. At the reported 110ms latency and 90 req/s throughput, steady-state concurrency is just L ≈ 9.9 in-flight requests. A 2-second-latency system would need ~180 concurrent threads for the same throughput. Low latency is the hardware-footprint multiplier.",
    stats: [
      { value: "110ms", label: "End-to-end latency", tag: "reported" },
      { value: "90 req/s", label: "Throughput per node config", tag: "reported" },
      { value: "≈9.9", label: "Derived steady-state concurrency (L = λW)", tag: "reported" },
    ] as Stat[],
  },
  benchmarks: {
    title: "Reported framework benchmarks",
    note: "From the comparative study; conditions and baselines as documented there.",
    rows: [
      { metric: "Latency", system: "110ms", gpt4: "180ms", claude: "170ms", palm: "200ms" },
      { metric: "Throughput", system: "90 req/s", gpt4: "60", claude: "62", palm: "55" },
      { metric: "Empathy score", system: "0.95", gpt4: "0.78", claude: "0.81", palm: "0.75" },
      { metric: "Factual accuracy", system: "91.0%", gpt4: "88.0%", claude: "87.5%", palm: "88.0%" },
      { metric: "GLUE", system: "86.0", gpt4: "82.5", claude: "—", palm: "—" },
      { metric: "SQuAD 1.1 (F1)", system: "90.7", gpt4: "85.0", claude: "—", palm: "88.0" },
      { metric: "CodeSearchNet (MRR)", system: "0.85", gpt4: "0.78", claude: "—", palm: "—" },
    ],
  },
  energy: {
    title: "Energy accounting, honestly",
    body: "The study reports 15 kWh per 1,000 inferences — 15 Wh per task, roughly 44× a simple GPT-4 chat query (~0.34 Wh). The discrepancy is the unit: these are agentic tasks (routing → retrieval → generation → verification → formatting, ~40–50 internal sub-inferences), not single replies. Under identical conditions the study measured comparable agentic stacks at 20–21 kWh/1k — a ~25% efficiency gain attributed to surgical vector retrieval and Aviva's token-frugal generation.",
    stats: [
      { value: "15 Wh", label: "Per agentic task", tag: "reported", note: "vs ~0.34 Wh for a simple chat query" },
      { value: "~25%", label: "Efficiency gain vs comparable agentic stacks", tag: "reported" },
    ] as Stat[],
  },
  infraTable: {
    title: "Infrastructure component matrix",
    cols: ["Component", "Layer", "Stack", "Reported metric"],
    rows: [
      ["WDBX", "Storage", "Zig, Swift 6, Metal, Swift 6.2 Span", "12,000 QPS · 8.2ms @ 1M vectors · 20–30% lower latency vs traditional DBs"],
      ["ABI Framework", "Compute", "Zig 0.17-dev, Swift, Metal API, LLVM", "295× GPU speedup (MatMul 4096²) · 13× on 10-layer net"],
      ["Abbey", "Application", "Multi-provider LLM, WDBX", "0.92 empathy · 90.5% technical accuracy"],
      ["Aviva", "Application", "Persona runtime", "30% faster than hedged responses · 40% denser"],
      ["Abi", "Orchestration", "Service mesh", "Routing, ethical policy enforcement, persona blending"],
    ],
  },
} as const;

// ── Architecture page (pure-Zig web server guide) ────────────────────────────

export const architecture = {
  intro:
    "WDBX serves itself. The full stack — HTTP, routing, templating, vector math — is pure Zig 0.17-dev, cross-compiled to static binaries for every major platform from a single `zig build`.",
  serverOptions: [
    {
      name: "std.http.Server",
      perf: "~32K req/s",
      note: "Post-Writergate std.Io.Reader/Writer interfaces. Adequate for moderate traffic; the baseline.",
    },
    {
      name: "http.zig",
      perf: "~140K req/s",
      note: "Pure Zig HTTP/1.1 with routing, JSON, WebSockets, CORS, static files. dev branch tracks master.",
    },
    {
      name: "Jetzig",
      perf: "http.zig core",
      note: "Rails-like batteries: file routing, Zmpl templates, sessions, CSRF, jobs, HTMX. Most 0.16-forward-compatible.",
    },
    {
      name: "zzz",
      perf: "within 2% of gnet",
      note: "io_uring / epoll / kqueue. Native TLS. Alpha quality, extraordinary ceiling — 66% faster than Zap.",
    },
  ],
  decisions: [
    {
      title: "TLS termination",
      body: "std.crypto.tls.Server doesn't exist yet (zig#14171). Production terminates TLS at a reverse proxy (Caddy + Let's Encrypt) or uses zzz's native TLS; tls.zig is the third-party fallback.",
    },
    {
      title: "SSR without a framework tax",
      body: "ArrayList(u8) writer for dynamic HTML, direct response-writer streaming for large pages, comptime concatenation for static fragments — zero runtime cost for anything known at compile time.",
    },
    {
      title: "SIMD-native vector math",
      body: "@Vector builtins compile distance kernels to the exact target ISA — AVX-512 on x86, NEON on Apple Silicon — with the same source. The database and the server share one binary.",
    },
    {
      title: "One build, every platform",
      body: "zig build cross-compiles static binaries for macOS arm64/x86_64, Linux, and Windows. No container, no runtime, no GC — deterministic p99s because nothing pauses.",
    },
  ],
  codeSample: `const std = @import("std");

pub fn main() !void {
    const address = try std.net.Address.parseIp4("127.0.0.1", 8080);
    var server = try address.listen(.{});
    defer server.deinit();

    while (true) {
        const conn = try server.accept();
        defer conn.stream.close();
        var read_buf: [8192]u8 = undefined;
        var write_buf: [8192]u8 = undefined;
        var http = std.http.Server.init(
            &conn.stream.reader(&read_buf).file_reader.interface,
            &conn.stream.writer(&write_buf).file_writer.interface,
        );
        var req = try http.receiveHead();
        try req.respond("WDBX online", .{ .extra_headers = &.{
            .{ .name = "Content-Type", .value = "text/html" },
        } });
    }
}`,
} as const;

// ── Investors page ────────────────────────────────────────────────────────────

export const investors = {
  raise: {
    amount: "$1.5M",
    stage: "Pre-Seed",
    runway: "18-month runway to Series A",
    date: "2026",
  },
  thesis:
    "MLAI delivers privacy-first AI infrastructure purpose-built for Apple Silicon's unified memory architecture. 200M+ Apple Silicon devices, zero native vector database solutions, and 73% of enterprises moving to edge AI for privacy — positioned against the $2.88B vector database market through proven open-core monetization (GitLab, MongoDB, Elastic).",
  market: {
    tam: { label: "TAM", value: "$127B", desc: "Global AI infrastructure", width: 100 },
    sam: { label: "SAM", value: "$45B", desc: "Edge AI + privacy-first", width: 70 },
    som: { label: "SOM", value: "$2.5B", desc: "Apple ecosystem (Year 5)", width: 25 },
    growth: [
      { value: "35%", label: "Vector DB CAGR" },
      { value: "42%", label: "Edge AI CAGR" },
      { value: "2B+", label: "Active Apple devices" },
    ],
  },
  whyNow: [
    {
      metric: "M4 @ 38 TOPS",
      title: "Hardware readiness",
      desc: "Neural Engine at 38 TOPS — 60× faster than A11 Bionic. 200M+ Apple Silicon devices run 7B–13B models on-device; unified memory up to 128GB.",
    },
    {
      metric: "€6.2B fines",
      title: "Regulatory wave",
      desc: "GDPR fines exceed €6.2B since 2018, 60% imposed since 2023. EU AI Act enforcement underway. On-device processing becomes a compliance posture, not a preference.",
    },
    {
      metric: "10× cost rise",
      title: "Cloud cost inflection",
      desc: "H100 hours at $2–7. On-device inference carries zero marginal cost; hybrid edge cuts infrastructure spend 60–80% vs pure cloud.",
    },
    {
      metric: "Llama 3 era",
      title: "Model ecosystem maturity",
      desc: "Llama 3, Mistral, Phi competitive at 7B–13B. Apple Intelligence validates on-device viability and kills cloud lock-in.",
    },
    {
      metric: "73% moving",
      title: "Enterprise edge adoption",
      desc: "73% of enterprises moving to edge AI for privacy and real-time processing. Apple Intelligence hit 68–76% adoption on iOS 18.",
    },
  ],
  pricing: [
    { tier: "Open Source Core", price: "Free", desc: "Full WDBX and ABI functionality. Apache-2.0 licensed. The developer-adoption flywheel." },
    { tier: "WDBX Pro", price: "$99/mo", desc: "Distributed clustering, advanced quantization, priority support, commercial license." },
    { tier: "Enterprise", price: "$50K–250K", desc: "SSO/RBAC, audit logging, dedicated support, custom integrations, SLA guarantees." },
    { tier: "WDBX Cloud", price: "Usage-based", desc: "Fully managed. Pay-per-query. Hybrid cloud/edge deployment." },
  ],
  unitTargets: [
    { value: "$50K+", label: "Target enterprise ACV", tag: "target" },
    { value: "85%+", label: "Target gross margin", tag: "target" },
    { value: "5:1", label: "Target LTV:CAC", tag: "target" },
    { value: "120%", label: "NRR target", tag: "target" },
  ] as Stat[],
  useOfFunds: [
    { bucket: "Engineering", pct: 60, amount: "$900K", desc: "2 senior engineers, infrastructure, security audits" },
    { bucket: "Go-to-market", pct: 25, amount: "$375K", desc: "Developer relations, content, community" },
    { bucket: "Operations", pct: 15, amount: "$225K", desc: "Legal, compliance, admin" },
  ],
  milestones18mo: [
    { metric: "ARR", target: "$240K" },
    { metric: "Enterprise customers", target: "5–10" },
    { metric: "Open source stars", target: "5,000+" },
    { metric: "Community developers", target: "1,000+" },
  ],
  roadmap: [
    {
      phase: "Q1 2026",
      name: "Foundation",
      items: ["Team hiring (2 engineers)", "WDBX 1.0 GA release", "Swift SDK beta", "Developer documentation"],
      state: "current" as const,
      accent: "wdbx" as Accent,
    },
    {
      phase: "Q2–Q3 2026",
      name: "Growth",
      items: ["Enterprise pilot programs", "WDBX Cloud alpha", "Abbey 1.0 release", "Conference presence"],
      state: "future" as const,
      accent: "abi" as Accent,
    },
    {
      phase: "Q4 2026",
      name: "Scale",
      items: ["First enterprise contracts", "WDBX 2.0 (distributed)", "iOS SDK App Store ready", "Partner integrations"],
      state: "future" as const,
      accent: "abbey" as Accent,
    },
    {
      phase: "2027",
      name: "Expand",
      items: ["Series A raise", "Team expansion (8–10)", "Multi-platform support", "Enterprise sales team"],
      state: "future" as const,
      accent: "wdbx" as Accent,
    },
  ],
  arr: [
    { year: "2026", value: 0.24 },
    { year: "2027", value: 1.8 },
    { year: "2028", value: 6.5 },
    { year: "2029", value: 18 },
    { year: "2030", value: 45 },
  ],
} as const;

export const nav = [
  { label: "WDBX", href: "/wdbx", accent: "wdbx" as Accent },
  { label: "ABI", href: "/abi", accent: "abi" as Accent },
  { label: "Abbey", href: "/abbey", accent: "abbey" as Accent },
  { label: "Platform", href: "/platform" },
  { label: "Services", href: "/services" },
  { label: "Research", href: "/research" },
  { label: "Architecture", href: "/architecture" },
  { label: "Company", href: "/company" },
  { label: "Investors", href: "/investors" },
] as const;

// ── Merged from github.com/donaldfilimon/abi (verified repo facts) ───────────

export const github = {
  repo: "github.com/donaldfilimon/abi",
  docs: "donaldfilimon.github.io/abi",
  license: "Apache-2.0",
  zig: "0.17.0-dev.304+9787df942",
  stars: "16",
  commits: "670+",
  description:
    "ABI Agent + WDBX Database: a high-speed, fully optimized AI and ML training stack — AI services, semantic vector storage, GPU acceleration, and distributed runtime.",
  quickstart: ["./build.sh --bootstrap  # toolchain + build", "./build.sh check        # full validation gate"],
  facets: [
    { title: "MCP server in-repo", desc: "First-class Model Context Protocol server so agent tooling can drive the runtime directly." },
    { title: "OpenAI-compatible streaming", desc: "Drop-in streaming inference endpoint (src/features/ai/streaming) for existing client SDKs." },
    { title: "Generated CLI registry", desc: "Commands, options, risk levels, and completions derive from one metadata source — zig build refresh-cli-registry." },
    { title: "Validation gate in CI", desc: "build.sh check runs the full gate: format, tests, registry snapshots, task-marker enforcement." },
  ],
} as const;

// ── Merged from MLAI-CORPORATION-WWW (corporate positioning) ─────────────────

export const corpStats = [
  { value: "295×", label: "GPU speedup", tag: "target", note: "Matrix workload benchmark track" },
  { value: "0.8ms", label: "Search latency", tag: "target", note: "1M-vector local retrieval" },
  { value: "16.5K", label: "Throughput (QPS)", tag: "target", note: "WDBX stress-test objective" },
  { value: "3", label: "Agent control roles", tag: "measured", note: "Planning, review, execution" },
  { value: "90d", label: "Pilot window", tag: "measured", note: "Audit-to-production roadmap" },
  { value: "SOC 2", label: "Readiness track", tag: "target", note: "Controls designed for audit evidence" },
] as Stat[];

export const platform = {
  intro:
    "The MLAI platform wraps orchestration in four layers that make autonomy inspectable: what the agent saw, what it was allowed to do, how it was tested, and where it runs.",
  layers: [
    {
      title: "Trace Layer",
      desc: "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events.",
      detail: "Useful for debugging, compliance review, incident response, and customer-facing explanations.",
    },
    {
      title: "Control Plane",
      desc: "Defines which agents can plan, review, execute, escalate, or abstain under each workflow condition.",
      detail: "Keeps risky actions behind explicit approval gates and measurable release criteria.",
    },
    {
      title: "Evaluation Mesh",
      desc: "Runs regression scenarios across retrieval faithfulness, latency, safety behavior, prompt injection, and human-review burden.",
      detail: "Turns AI quality into a release gate instead of an after-the-fact dashboard.",
    },
    {
      title: "Private Runtime",
      desc: "Packages LLM orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.",
      detail: "Designed for teams that cannot send sensitive context to unmanaged infrastructure.",
    },
  ],
} as const;

export const services = [
  { title: "Autonomy Readiness Audit", desc: "Map workflows, prompt surfaces, data paths, and approval gates to determine which tasks are safe to automate and which need human review.", outcomes: ["Risk register", "Control map", "90-day rollout plan"] },
  { title: "WDBX Retrieval Architecture", desc: "Design weighted backtrace retrieval pipelines that preserve source context, reduce hallucination surfaces, and support fast vector search at scale.", outcomes: ["Index strategy", "Recall benchmarks", "Trace schema"] },
  { title: "Multi-Agent Orchestration", desc: "Implement agent roles, tool permissions, task handoffs, and conflict-resolution policies for complex operational workflows.", outcomes: ["Agent graph", "Tool policy", "Evaluation harness"] },
  { title: "Model & Runtime Optimization", desc: "Profile inference paths, memory pressure, GPU kernels, batching behavior, and edge constraints to improve real-world latency and cost.", outcomes: ["Latency profile", "Optimization backlog", "Capacity model"] },
  { title: "Safety & Compliance Layering", desc: "Embed policy checks, audit trails, red-team scenarios, and evidence capture into AI systems that operate in regulated or high-trust contexts.", outcomes: ["Policy matrix", "Audit events", "Red-team scripts"] },
  { title: "Private AI Deployment", desc: "Package AI workflows for VPC, on-premise, offline, and hybrid environments with secret management, observability, and update paths.", outcomes: ["Deployment topology", "Runbook", "Rollback plan"] },
  { title: "Research Translation", desc: "Turn promising papers, prototypes, and notebooks into constrained, documented, production-aware services your engineers can maintain.", outcomes: ["Prototype hardening", "API contract", "Test plan"] },
  { title: "Executive & Engineering Workshops", desc: "Align leadership, security, product, and engineering teams around practical autonomy strategy, risk boundaries, and delivery milestones.", outcomes: ["Decision memo", "Team training", "Architecture review"] },
  { title: "Continuous Evaluation Systems", desc: "Build test suites that evaluate tool use, retrieval faithfulness, safety behavior, regression drift, and user-facing quality over time.", outcomes: ["Eval suite", "Scorecards", "Release gates"] },
] as const;

export const industries = [
  "Regulated software teams shipping AI copilots into customer workflows.",
  "Research organizations that need private retrieval over sensitive technical corpora.",
  "Security and compliance teams evaluating tool-using autonomous agents.",
  "Infrastructure teams deploying AI near edge devices, private clouds, or constrained networks.",
] as const;

export const faq = [
  { q: "What is the WDBX Engine?", a: "The Weighted Directed Backtrace eXecution engine is a retrieval and orchestration pattern that keeps context as weighted paths. It is designed to help teams inspect why a result was produced, which sources were used, and where confidence dropped." },
  { q: "How does the Abbey–Aviva–Abi framework differ from traditional agents?", a: "Instead of giving one agent every responsibility, the framework separates creative planning, safety review, and technical execution. That separation makes permissions easier to reason about and gives operators clearer intervention points." },
  { q: "Can MLAI systems run in private infrastructure?", a: "Yes. We design for VPC, on-premise, hybrid, and offline-first deployment paths when data residency, network isolation, or customer policy requires it." },
  { q: "Do you replace existing LLMs?", a: "Usually no. MLAI focuses on orchestration, retrieval, evaluation, and safety layers that can sit around existing model providers or self-hosted models." },
  { q: "What does an initial engagement include?", a: "Most teams begin with a readiness audit: workflow mapping, data and tool inventory, failure-mode analysis, latency targets, and a staged rollout plan with measurable acceptance criteria." },
  { q: "How do you test safety behavior?", a: "We build scenario suites for prompt injection, source poisoning, permission escalation, contradictory context, low-confidence retrieval, and human-approval bypass attempts." },
] as const;

export const values = [
  { title: "Safety Before Scale", desc: "We design autonomy around bounded execution, explicit approvals, and measurable failure modes before expanding capability or throughput." },
  { title: "Observable Reasoning", desc: "Every orchestration layer is built to expose provenance, retrieval context, decision checkpoints, and the operator actions that changed state." },
  { title: "Performance With Proof", desc: "Latency, recall quality, and GPU utilization are benchmarked against repeatable workloads instead of optimistic demos or synthetic-only claims." },
  { title: "Private Deployment Paths", desc: "Architectures are shaped for on-premise, VPC, hybrid, and edge deployments where data residency and auditability cannot be compromised." },
  { title: "Human-Centered Control", desc: "MLAI systems keep escalation, review, and override flows visible so subject-matter experts remain in control of critical outcomes." },
  { title: "Research-To-Runtime Discipline", desc: "Novel techniques are packaged with integration notes, safety constraints, and operational guidance so research can survive production pressure." },
] as const;

export const operatingPrinciples = [
  "No autonomous write action without an observable policy boundary.",
  "No retrieval claim without a traceable source or confidence signal.",
  "No benchmark without environment notes, workload shape, and reproducibility context.",
  "No deployment plan that ignores rollback, incident review, and human escalation.",
] as const;

export const researchTracks = [
  { name: "WDBX Core", desc: "Backtrace-aware retrieval, graph weighting, chunk provenance, and high-throughput vector search for production AI systems." },
  { name: "Agent Safety", desc: "Permissioning, policy locks, prompt-injection resistance, role separation, and human escalation protocols." },
  { name: "Runtime Performance", desc: "GPU acceleration, memory layout, low-latency search, edge deployment, and repeatable benchmark design." },
] as const;

export const publications = [
  { tag: "Core Architecture", title: "WDBX: A Weighted-Backtrace Memory Store for Traceable Retrieval", date: "Jun 2026", abstract: "The formal data model and scoring math behind WDBX — hierarchical vector search, temporal–causal reranking, authority-weighted records, and a hash-chained audit log — as implemented in the ABI runtime." },
  { tag: "Research", title: "Sparse Evidence Attention for Bounded Context Assembly", date: "Jun 2026", abstract: "SEA selects which durable records enter a context pack by scoring each candidate across eight independent criteria, then packing greedily under a hard token budget and a diversity constraint." },
  { tag: "Core Architecture", title: "WDBX Graph Weights for Traceable Neural Retrieval", date: "May 2026", abstract: "Storing retrieval context as weighted directed paths so answers preserve provenance, confidence, and rollback points." },
  { tag: "Safety", title: "Policy-Locked Tool Use in Multi-Agent Systems", date: "Apr 2026", abstract: "Separating creative planning, compliance review, and execution so agents collaborate without inheriting unrestricted tool authority." },
  { tag: "Engineering", title: "Latency Budgets for Real-Time AI Orchestration", date: "Mar 2026", abstract: "Allocating milliseconds across retrieval, model calls, safety checks, and UI feedback without hiding reliability work behind optimistic averages." },
  { tag: "Research", title: "Backtrace Confidence Signals for Hallucination Reduction", date: "Feb 2026", abstract: "Combining source coverage, graph distance, contradiction checks, and model uncertainty into operator-visible confidence signals." },
  { tag: "Scalability", title: "Vector Index Maintenance Under Continuous Ingestion", date: "Jan 2026", abstract: "Keeping high-volume indexes fresh while protecting recall quality, write latency, and audit history." },
  { tag: "Ethics & Safety", title: "Human Approval Gates That Operators Actually Use", date: "Dec 2025", abstract: "Designing approval flows that reduce risk without creating alert fatigue, rubber-stamping, or invisible escalation paths." },
  { tag: "Core Architecture", title: "Chunk Provenance in Long-Context Retrieval Systems", date: "Nov 2025", abstract: "Source segmentation, citation persistence, and drift detection for teams using large private corpora in regulated environments." },
  { tag: "Engineering", title: "Offline-First AI Workflows for Sensitive Data", date: "Oct 2025", abstract: "Packaging retrieval, inference, and audit services where cloud egress is limited or prohibited by policy." },
  { tag: "Safety", title: "Prompt Injection Drills for Agentic Systems", date: "Sep 2025", abstract: "A repeatable drill catalog for testing tool permission boundaries, source poisoning resilience, and confused-deputy failure modes." },
] as const;

// Formal model from the WDBX paper. The paper states: "Where the design names a
// target it is labelled as such; none of the equations encode measured
// benchmark results."
export const wdbxModel = {
  naming:
    "The corporate framing expands WDBX as the Weighted Directed Backtrace eXecution engine; earlier technical analyses refer to it as the Wide Distributed Block Exchange. Same store, same math.",
  authority: {
    title: "Authority-weighted records",
    body: "Every record carries the trust of its source — an inferred guess is never treated like a system-pinned fact.",
    levels: [
      ["inferred", "0.30"],
      ["user_stated", "0.78"],
      ["tool_verified", "0.86"],
      ["file_verified", "0.90"],
      ["system_pinned", "1.00"],
    ],
  },
  scoring: {
    title: "Composite retrieval score",
    formula: "sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ",
    terms: [
      ["σⱼ", "Cosine similarity over the HNSW index — SIMD path with a deterministic CPU fallback computing the same quantity"],
      ["τⱼ", "Temporal recency: exponential half-life decay, τⱼ = clamp(2^−(t₀−tⱼ)/t½)"],
      ["γⱼ", "Causal-hop weight: γⱼ = max(0.25, 0.6^hⱼ) — unrelated records are down-weighted, never erased"],
      ["πⱼ", "Source authority from the trust table"],
    ],
  },
  audit: {
    title: "Hash-chained audit log",
    formula: "Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ),  H₀ = 0",
    body: "Every write lands in a re-verifiable chain — the property that makes retrieval explainable to an auditor, not just a developer.",
  },
} as const;
