# MLAI — Master Reference

Everything across the company, the three products, and the multi-persona system,
consolidated from project knowledge, the `abi` repo, and the brand data layer.

> **Sources & reconciliation.** This repo (`MLAI-CORPORATION-WWW`) sources its
> *content* from `src/data/categories/*` and its *design tokens* from
> `src/index.css`; it has **no `lib/brand.ts`** (that file belongs to the sibling
> static "bun-site" prototype). Where this doc draws on cross-project material
> (the `abi` repo, the investor deck, the bun-site prototype), facts have been
> reconciled to **this** repo's shipped state — notably the **"Lab"** design
> (serif display + cyan brand), not the prototype's Sora/Manrope + `#00D4FF`
> values. Figures with no backing data module here (e.g. §9 financials) are
> cross-source deck content, tagged accordingly.

**Provenance is preserved throughout.** Every metric is tagged:

- **● measured** — reproduced on MLAI hardware
- **○ target** — an engineering goal, not yet a measured result
- **◆ reported** — a cited or internal-eval figure

Two standing integrity rules carried through this doc:

1. **Apple** — only "Built on Apple's public frameworks (Metal, Accelerate, Core ML)"
   framing is used. No partnership, endorsement, or employer claims (unverified).
2. **Benchmarks** — measured / target / reported are never conflated.

---

## 1 · Company

| Field | Value |
|---|---|
| Name | **MLAI** |
| Legal name | Machine Learning Advanced Innovations, Inc. |
| Entity | Delaware C-Corp |
| Location | Orlando, FL |
| Tagline | *Privacy-first AI infrastructure for Apple Silicon.* |
| Positioning | The infrastructure layer for private, on-device AI — inference, index, and data on the same chip. |

**Apple framing (the only approved language):** "Built on Apple's public
frameworks — Metal, Accelerate, Core ML."

**Values:** Disciplined secrecy · Mission stewardship · Operational velocity.

**The one-line story (from the explainer film):**
> We built one model to answer them all. It buckled under the weight of everything.
> So we built three — Abbey to understand you, Aviva the truth unfiltered, Abi to
> hold them in balance. On WDBX. Private by default. Yours alone. This is MLAI.

---

## 2 · Founder

**Donald Filimon** — Founder & Systems Architect.
Motto: *"Care first. Clarity always. Competence throughout."*
Polyglot systems engineer across Zig, Rust, Swift, TypeScript, Python, and GPU runtimes.

| Stat | Provenance |
|---|---|
| 8+ years ML / systems | ● measured |
| 15% LLVM compile-time reduction shipped | ● measured |
| 5 languages in production (Swift, Zig, C++, TS, Python) | ● measured |

**Personal projects**

| Project | What it is | Lang |
|---|---|---|
| **abi** | AI agent runtime + WDBX vector DB; local AI/ML orchestration in Zig, GPU capability reporting, MCP server | Zig |
| **WDBX** | Durable vector/block memory store for traceable retrieval & agent memory | Zig · Rust · Py · TS |
| **gama** | Swift + MLX on-device LM inference on Apple Silicon; self-learning agent | Swift |
| **Nyon** | Voxel 3D world experiment; novel hexa-gravity system | Zig |

Links: github.com/donaldfilimon · x.com/donaldfilimonx · donaldfilimon.com

---

## 3 · The stack — three layers, one chip

| Layer | Product | Role | Accent (family) |
|---|---|---|---|
| **Storage** | WDBX | Zig vector store — HNSW, MVCC, Metal/CUDA/Vulkan | cyan |
| **Compute** | ABI Framework | ML + GPU acceleration, tensor ops, zero-copy unified-memory pipelines | violet |
| **Application** | Abbey (+ Aviva, Abi) | Empathic on-device assistant with local memory | emerald |

> Shipped "Lab" brand hexes (from `public/neural.js` `DEFAULTS` + `src/index.css`):
> cyan `#22d3ee` · violet `#a855f7` · emerald `#34d399`, on near-black ink
> `#05070d`, with a cyan→blue→violet `grad-text` signature.

---

## 4 · WDBX — vector database

Zig-built vector storage with HNSW indexing, MVCC transactions, and Metal / CUDA /
Vulkan backends. Runs where the data lives.

> **Naming note:** the corporate materials expand WDBX as **"Weighted Directed
> Backtrace eXecution"**; earlier analyses used **"Wide Distributed Block Exchange."**
> Both appear in source materials — worth settling on one before external launch.

**Hero metrics**

| Metric | Value | Provenance |
|---|---|---|
| p50 search latency | 2.3 ms | ● measured |
| Recall@10 | 98.2% | ● measured |
| QPS (stress-test objective) | 16.5K | ○ target |
| p50 @ 1M vectors | 0.8 ms | ○ target |

**Core features**

> ⚠️ **This bullet list is UNTAGGED and is not publishable copy.** Unlike the
> table above it, nothing here carries ● / ○ / ◆, and at least three entries do
> not survive checking:
>
> - "95% recall @ 8.2 ms" **contradicts the tagged table two lines up**, which
>   records Recall@10 **98.2% ● measured** and p50 **2.3 ms ● measured**.
> - **HNSW** — the nine WDBX docs mirrored from the source repo
>   (`public/docs/wdbx/*.md`) never mention HNSW, `efConstruction`, or any index
>   structure; `architecture.md` describes `src/database/*` only as "vector
>   store, block-chain memory, sharding, snapshots". So `M=16,
>   efConstruction=200` has no artifact behind it here.
> - **AES-256 + RBAC** is on the external-claims forbidden list outright.
>
> This block caused a real incident: it was used to source home-page copy on
> 2026-08-09, which then had to be retracted the same day. Treat it as
> unverified working notes. **Anything moved from here into public copy must be
> re-sourced to the mirrored WDBX docs or to a tagged row — not to this list.**

- **HNSW index** — Hierarchical Navigable Small World graphs; O(log n) search;
  95% recall @ 8.2 ms on 1M vectors. Defaults M=16, efConstruction=200.
- **Memory-mapped persistence** — Swift 6.2 `Span` zero-copy I/O, WAL journaling,
  instant cold starts.
- **Product / scalar quantization** — 8× memory reduction; "10B vectors in 2GB RAM."
- **Metal GPU acceleration** — distance calcs on Apple GPU; positioned as the first
  App Store-ready vector DB with native Swift/Metal integration.
- **MVCC transactions**, **AES-256 + RBAC**, **hash-chained WAL**.

**Competitive posture**

| Claim | Provenance |
|---|---|
| 6–12× faster search vs cloud (zero network latency) | ● measured |
| 8× lower memory footprint with PQ | ● measured |
| Only App Store-ready vector DB w/ native Swift/Metal | ● measured |

**SIMD core:** `@Vector(N, f32)` maps to hardware SIMD (AVX-512 on x86, NEON on
Apple Silicon); `@reduce(.Add, …)` for horizontal sums. One source compiles distance
kernels to the exact target ISA.

---

## 5 · ABI Framework — compute / orchestration

Zig 0.17-dev framework for AI services, semantic vector storage, GPU acceleration,
and a distributed runtime. Powers WDBX's GPU-accelerated distance calculations and
embedding generation.

**Repo facts (verified against the `abi` repo)**

- License **Apache-2.0** · Zig `0.17.0-dev.304+9787df942` · 670+ commits · 16★ / 4 forks
- Docs: donaldfilimon.github.io/abi · bootstrap: `./build.sh --bootstrap` then `./build.sh check`
- In-repo **MCP server**; OpenAI-compatible streaming endpoint
  (`src/features/ai/streaming/server/openai.zig`)
- Generated CLI registry: `zig build refresh-cli-registry`

**GPU benchmarks**

| Workload | Speedup | Provenance |
|---|---|---|
| MatMul 128×128 | 5× | ● measured |
| MatMul 1024×1024 | 84× | ● measured |
| MatMul 4096×4096 (benchmark track) | 295× | ○ target |
| 10-layer neural net | 13× | ● measured |

**Apple Silicon advantage** (hardware spec, not a claim about MLAI): 546 GB/s unified
memory bandwidth · 38 TOPS Neural Engine (M4) · 200 GFLOPS/W power efficiency.

---

## 6 · Abbey / Aviva / Abi — multi-persona assistant

Abbey is the consumer-facing, emotionally-aware assistant with persistent,
vector-backed memory. Three personas share one core. Accents below match the
shipped `PersonaLegend` + hero galaxy (Abbey emerald, Aviva violet, Abi cyan):

| Persona | Role | Behavior | Accent |
|---|---|---|---|
| **Abbey** | Empathetic Polymath | Creative problem-solving, emotional awareness | emerald |
| **Aviva** | Unfiltered Expert | Direct technical answers, deep research | violet |
| **Abi** | Adaptive Moderator | Dynamic persona blending / routing by context | cyan |

**Core capabilities**

- **Multi-provider LLM** — OpenAI, Anthropic, local via Ollama; seamless switching.
- **Vector-based semantic memory** — powered by WDBX; remembers conversations,
  learns preferences, all stored locally.
- **Multi-platform interface** — HTTP REST API, Discord bot, voice.
- **Emotional intelligence** — technical precision balanced with empathy.

**Platforms**

| Platform | Status |
|---|---|
| Discord (Bun + discord.js v14) | Shipping |
| Swift 6 / Vapor 4 / DiscordBM port | In progress |
| Python + Twitch expansion | In progress |

**Metrics**

| Metric | Value | Provenance |
|---|---|---|
| Abbey empathy score | 0.92 | ◆ reported (internal eval) |
| Abbey technical accuracy | 90.5% | ◆ reported (internal eval) |
| Aviva latency reduction vs hedged responses | 30% | ◆ reported |
| Aviva content density gain | 40% | ◆ reported |

**Neural backtracking:** interaction blocks are hash-chained —
`H(blockᵢ) = SHA-256(dataᵢ ⊕ H(blockᵢ₋₁))` — at the **WAL level, not inside the HNSW
index**, so audit integrity never taxes search latency. When an agent drifts or
hallucinates, the chain is traversed backward to the exact divergence point and the
session is rewound.

**Little's Law footprint:** L = λW. At 110 ms latency and 90 req/s, steady-state
concurrency is just L ≈ 9.9 in-flight requests (◆ reported) — vs ~180 threads for a
2-second-latency system at the same throughput. Energy: 15 Wh per agentic task
(◆ reported, vs ~0.34 Wh for a simple chat query); ~25% efficiency gain vs comparable
agentic stacks (◆ reported).

---

## 7 · Platform — autonomy you can inspect

Four layers wrap orchestration so autonomy is inspectable (see `src/data/categories/platform.ts`):

1. **Trace Layer** — captures retrieval paths, policy checks, model decisions, tool
   calls, and operator interventions as inspectable events.
2. **Control Plane** — defines which agents can plan, review, execute, escalate, or
   abstain under each workflow condition.
3. **Evaluation Mesh** — regression scenarios across retrieval faithfulness, latency,
   safety behavior, prompt injection, and human-review burden.
4. **Private Runtime** — packages orchestration, retrieval, audit logs, and controls
   for cloud, VPC, on-premise, and offline-first deployments.

---

## 8 · Research / formal model

**WDBX trust + scoring model (June 2026 paper):**

- Authority trust table: inferred 0.30 → user-stated 0.78 → tool-verified 0.86 →
  file-verified 0.90 → system-pinned 1.00.
- Composite score: **sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ**
  - σ — cosine similarity over HNSW (SIMD + CPU fallback)
  - τ — temporal half-life decay
  - γ — causal-hop weight, `max(0.25, 0.6ʰ)`
  - π — authority weight
- Hash-chained audit log: **Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ)**, H₀ = 0.

**Zig server stack (from the architecture guide):** `std.http.Server` ≈ 32K req/s
(post-Writergate) vs http.zig ≈ 140K vs Jetzig (Rails-like, most 0.17-forward) vs zzz
(io_uring, within 2% of gnet, native TLS). TLS gap: `std.crypto.tls.Server` doesn't
exist yet (zig#14171) — use a reverse proxy or tls.zig. Persistence via mmap + WAL;
single-binary cross-compilation to every target; `@embedFile` for static assets.

---

## 9 · Investor / financials

> Cross-source: from the investor deck, **not** backed by a `src/data` module in
> this repo. Treat as deck content; keep the ○ target / ◆ reported tags intact.

**Raise:** $1.5M Pre-Seed · 18-month runway to Series A · 2026.

**Thesis:** privacy-first AI infrastructure purpose-built for Apple Silicon's unified
memory. 200M+ Apple Silicon devices, ~zero native vector-DB solutions, 73% of
enterprises moving to edge AI — positioned against the $2.88B vector-DB market via
open-core monetization (GitLab / MongoDB / Elastic playbook).

**Market**

| Tier | Value | Scope |
|---|---|---|
| TAM | $127B | Global AI infrastructure |
| SAM | $45B | Edge AI + privacy-first |
| SOM | $2.5B | Apple ecosystem (Year 5) |

Growth: 35% Vector-DB CAGR · 42% Edge-AI CAGR · 2B+ active Apple devices.
(Deck also cites the vector-DB market at $2.88B in 2026 → $8.95B by 2030 @ 27.5% CAGR.)

**Why now:** M4 @ 38 TOPS hardware readiness · €6.2B GDPR fines (regulatory wave) ·
10× cloud-cost inflection · Llama-3-era model maturity · 73% enterprise edge adoption.

**Pricing:** Open-source core (free, Apache-2.0) → WDBX Pro $99/mo → Enterprise
$50K–250K → WDBX Cloud (usage-based).

**Unit-economics targets** (all ○ target): $50K+ ACV · 85%+ gross margin · 5:1 LTV:CAC · 120% NRR.

**Use of funds:** Engineering 60% ($900K) · Go-to-market 25% ($375K) · Operations 15% ($225K).

**18-month milestones:** $240K ARR · 5–10 enterprise customers · 5,000+ OSS stars · 1,000+ community devs.

**Roadmap:** Q1 2026 Foundation (current) → Q2–Q3 Growth → Q4 Scale → 2027 Expand (Series A, team 8–10).

**ARR projection ($M):** 2026 0.24 · 2027 1.8 · 2028 6.5 · 2029 18 · 2030 45.

---

## 10 · Tech stack & conventions

- **Locked stack:** Bun (over Node) · React 19 · Next.js 15 App Router · TypeScript strict · Tailwind v4.
- **Systems:** Zig 0.17-dev · Swift 6 · LLVM. **License:** Apache-2.0 (not MIT).
- **GPU / on-device:** Metal · CUDA · Vulkan · MLX · Core ML · Accelerate.
- **AI / vector:** HNSW · MVCC · MCP server · OpenAI-compatible streaming.
- **Design language ("Lab"):** near-black ink canvas, cyan→blue→violet gradient
  signature, glass surfaces + film grain, reduced-motion-safe; the tri-persona
  embedding-galaxy hero. Type: **Spectral** (serif display) · **Geist** (body) ·
  **JetBrains Mono** (code). *(This is the shipped WWW stack — the bun-site
  prototype used Sora/Manrope.)*
- **Brand colors (shipped Lab):** cyan `#22d3ee` · violet `#a855f7` · emerald
  `#34d399` on ink `#05070d`. WDBX→cyan, ABI→violet, Abbey→emerald; personas
  Abbey→emerald, Aviva→violet, Abi→cyan.

---

*Source of truth for this repo's figures: `src/data/categories/*` (content) and
`src/index.css` (design tokens). Cross-project figures are from the `abi` repository
and the investor deck, tagged. Keep measured / target / reported tags intact in any
downstream copy, and keep Apple framing limited to the public-frameworks language above.*
