# MLAI — System Design

Two systems are described here: the **product stack** MLAI builds (WDBX / ABI / Abbey / Platform) and the **website** that presents it. Both are designed around the same principle — keep the important thing inspectable and local.

---

## Part A — The product stack

### A.1 The one-sentence architecture
The inference, the index, and the data live on the same chip. Everything else is the engineering that makes that true without giving up speed, scale, or correctness.

### A.2 Layers, bottom to top

```
┌─────────────────────────────────────────────┐
│  Platform   trace · control · eval · runtime │  inspectable, deployable
├─────────────────────────────────────────────┤
│  Abbey      personas · routing · local memory│  the assistant layer
├─────────────────────────────────────────────┤
│  WDBX       HNSW · MVCC · hash-chained WAL    │  vector storage + search
├─────────────────────────────────────────────┤
│  ABI        tensors · Metal kernels · 0-copy  │  GPU compute framework
├─────────────────────────────────────────────┤
│  Silicon    unified memory · Neural Engine    │  Apple Silicon substrate
└─────────────────────────────────────────────┘
```

### A.3 Design choices and why
- **One architecture, deeply.** Targeting Apple Silicon first means using Metal / Accelerate / Core ML directly instead of abstracting across platforms and losing the unified-memory advantage that makes on-device viable.
- **Zig for the hot paths.** No GC, no hidden allocations, SIMD as a language primitive, single-binary cross-compilation. WDBX and ABI share one numeric lowering (`@Vector` → AVX-512 / NEON).
- **Integrity at the log, not the index.** Hash-chaining lives at the write-ahead-log level so the audit trail is tamper-evident without taxing search latency.
- **Provenance as a first-class field.** The data model refuses to let a target be presented as a result.

### A.4 Key mechanisms
- **HNSW** (M=16, efConstruction=200) for logarithmic ANN search.
- **MVCC** so ingestion and query traffic never block each other.
- **Hash-chained WAL**: `Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ)`, `H₀ = 0`.
- **Composite retrieval score**: `sᵢⱼ = σⱼ · τⱼ · γⱼ · πⱼ` (similarity · recency · causal-hop · source authority).
- **Neural backtracking**: hash-chained interaction blocks rewound to the divergence point on drift.
- **Persona routing**: `argmax P(persona | input, context)`.

---

## Part B — The website

### B.1 Stack
Bun · Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS. Static export — no server at runtime.

```
next.config: output "export", trailingSlash true
build → out/  (17 static outputs, deploy to any static host / CDN)
```

### B.2 Information architecture
```
/                 thesis · stack · platform · trends · research · FAQ
/wdbx /abi /abbey product deep-dives (how-it-works · split-sections · use-cases · glossary · FAQ)
/platform         four layers in depth · principles · FAQ
/architecture     whole-stack flow · design choices
/company          story · approach · FAQ
/investors        thesis · why-now · market · plan · FAQ
/services         engagement model · nine engagements · FAQ
/research         themes · tracks · formal model · publications
/contact          paths · channels
sitemap.xml · robots.txt · icon.svg
```

### B.3 Content architecture — single source of truth
- **`lib/brand.ts`** — all *facts*: company, founder, products, metrics (each with provenance), investors, platform, research, formal model. Nothing factual lives in a component.
- **`lib/content.ts`** — all *prose*: long-form explanation grounded in the facts. Introduces zero new numbers.
- **Components** render data; they never hard-code claims.

This separation is what makes the integrity rules enforceable: a metric can only be shown through `StatBlock`, which requires a provenance tag from the typed `Stat`.

### B.4 Rendering & performance
- Everything is server-rendered to static HTML. First Load JS ~115 kB shared.
- The only interactive client component beyond nav is the hero benchmark terminal. The FAQ uses native `<details>` — **zero added JS** for the largest content addition.
- Motion respects `prefers-reduced-motion`.

### B.5 Accessibility & SEO
Skip-to-content link, semantic landmarks, `aria-label`ed nav and logo, JSON-LD Organization schema, OpenGraph/Twitter cards, sitemap, robots, and the SVG favicon auto-served by Next from `app/icon.svg`.

### B.6 Validation pipeline
```
bunx tsc --noEmit        # strict typecheck — must be clean
bun run build            # 17/17 static outputs
playwright screenshot    # visual QA: desktop, nav, mobile@390
```
