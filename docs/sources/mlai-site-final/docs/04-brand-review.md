# MLAI Brand Review — Site Audit

An audit of the current site against the brand guidelines and integrity rules. This is the marketing-brand-review pass: what's consistent, what's strong, and what to watch.

**Scope:** 11 content routes + sitemap/robots/icon (17 build outputs). Reviewed against brand guidelines v-final and the four integrity rules.

---

## Verdict: ✅ Ship

The site is internally consistent, the integrity rules hold across every page, and the visual language is coherent from hero to footer. No blocking issues.

---

## 1. Integrity compliance (the rules that matter most)

| Rule | Status | Notes |
|---|---|---|
| **Apple framing** | ✅ Pass | Only "Built on Apple's public frameworks — Metal, Accelerate, Core ML" appears. Footer, company FAQ, and architecture copy all use the approved phrasing. No partnership language anywhere. |
| **Benchmark provenance** | ✅ Pass | Every `StatBlock` carries a tag. The 295× GPU figure and all forward ARR/unit-economics numbers read explicitly as targets. New prose reinforces this ("tagged a target … not a measured result"). |
| **License** | ✅ Pass | Apache-2.0 stated on WDBX, investors, research, and in the open-source FAQ. No MIT references. |
| **Zig version** | ✅ Pass | 0.17-dev / pinned dev string throughout. No stale versions. |

The expansion **added** integrity-reinforcing copy rather than diluting it — the homepage FAQ now explicitly teaches the provenance system to readers.

---

## 2. Visual consistency

| Dimension | Assessment |
|---|---|
| **Color discipline** | Strong. Each product page stays in-accent; the three colors only co-occur in the logo, homepage grid, and footer seam — exactly as specified. |
| **Type rhythm** | Consistent. Sora/Manrope/JetBrains roles are respected; the new `Prose` measure cap (`max-w-2xl`) brings Apple-grade readability to long-form sections. |
| **Surface treatment** | Coherent. New `SplitSection`, `DeepDive`, `FAQList`, `Glossary` all use the same `.surface` / `.accent-edge` system as the original primitives — the expansion doesn't look bolted on. |
| **Spacing** | Apple-grade. Section rhythm and the editorial two-column split-sections give the long pages air. |
| **Logo** | New chip-stack mark integrates cleanly in nav (28px), footer lockup, and favicon. Legible at all tested sizes and on white. |

---

## 3. Content depth (the 10× pass)

Every page now carries a how-it-works / why-it-exists prose layer, deep-dive grids, and an FAQ. Highlights:

- **WDBX** — tripled: HNSW, persistence, and quantization each get an editorial split-section, plus a use-case grid, glossary, and FAQ.
- **Abbey** — the largest relative expansion (was the thinnest page): persona rationale, local-memory + neural-backtracking, the Little's-Law efficiency argument, and platform surfaces.
- **Platform** — the four layers now have an in-depth breakdown and a principles grid.
- **Homepage** — gained a thesis section, a four-pillar grid, and a plain-language FAQ.

All new copy is grounded in established facts. **Zero new benchmarks or numbers were introduced** — the depth is explanatory, not invented.

---

## 4. Voice consistency

The new prose holds the voice: mechanism-first explanation, short declarative sentences, provenance-careful verbs, no hype words, no Apple implications. The one pull-quote per page is unattributed, per the rule. Tone shifts appropriately by surface (technical on products, narrative on company, direct on contact).

---

## 5. Watch-list (non-blocking)

- **WDBX naming.** Source materials carry two expansions of "WDBX" (a directed-backtrace reading and a distributed-block reading). The site avoids spelling out a contested acronym in body copy — keep it that way until one is canonical, rather than silently picking one.
- **Forward numbers.** As real measured results land, migrate target-tagged figures to measured and update the prose verbs in lockstep. The provenance system makes this a mechanical update, but it must actually happen.
- **Swift/Vapor port.** Abbey copy says the Swift 6 / Vapor 4 port is "in progress." Refresh when it ships so the status stays honest.
