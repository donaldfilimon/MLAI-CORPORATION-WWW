import type { ThroughputRow } from "@/components/site";

/**
 * Benchmark data for the `/benchmarks` performance section.
 *
 * **What is NOT here, and must not come back.** This module previously carried
 * two sets of bar-chart data:
 *
 *  - `AI_CHARTS` — GLUE/CoLA/SST-2/MRPC/STS-B, SQuAD 1.1 + 2.0 F1, HumanEval
 *    Pass@1, "Factual Accuracy", inference latency and throughput, each plotted
 *    as `["Abbey System", "GPT-4", "Claude"]`. No such evaluation exists in
 *    `docs/master-reference.md` or in any repo artifact, and the figures named
 *    two competitors' shipping products as the losing side.
 *  - `CHARTS` c1–c15 — latency, QPS, indexing time, memory, capacity, ingestion,
 *    cost, recall, hybrid search, uptime, query cost, and multi-tenancy, each
 *    plotted against 20+ named commercial vector databases. None of the
 *    competitor figures had a cited source, MLAI operates no hosted service from
 *    which an uptime percentile could be measured, and the WDBX values
 *    contradicted `master-reference.md` where it has a figure at all.
 *
 * Per `CLAUDE.md` ("Content claims are constrained") and
 * `docs/voice-guidelines.md` ("Claims discipline"), external collateral must not
 * publish QPS / latency / accuracy / uptime / model-benchmark numbers without a
 * repo artifact behind them. Head-to-head charts against named vendors need that
 * artifact for *both* sides. Do not reintroduce either set; the architectural
 * comparison in `src/views/Benchmarks.tsx` (`ARCH_ROWS`) is the pattern to follow
 * when the urge to compare returns.
 */
export const BENCHMARK_DISCLAIMER =
  "Speedups below are Metal GPU versus the same kernel on CPU, measured on MLAI hardware except where tagged as a target. They are not independently audited, and they are not a comparison against any other product.";

/**
 * ABI Framework GPU acceleration, from `docs/master-reference.md` §5.
 *
 * Every row carries its own provenance tag because §5 tags them individually and
 * the classes are never conflated: 5×, 84×, and 13× are **● measured**, while
 * 295× is an **○ target** on the benchmark track. Rendering all four as
 * identical bars — which is what the retired `c16` chart did — presents the
 * target as an achieved result.
 *
 * §5 assigns these speedups to the **ABI Framework** (the compute layer), not to
 * WDBX (the storage layer); the retired chart mislabeled every row "WDBX".
 *
 * `fill` is proportional to the speedup, relative to the largest row (295×).
 */
export const GPU_SPEEDUP_ROWS: readonly ThroughputRow[] = [
  { label: "MatMul 128×128", value: "5×", tag: "measured", fill: 5 / 295 },
  { label: "MatMul 1024×1024", value: "84×", tag: "measured", fill: 84 / 295 },
  { label: "MatMul 4096×4096 (benchmark track)", value: "295×", tag: "target", fill: 1 },
  { label: "10-layer neural net", value: "13×", tag: "measured", fill: 13 / 295 },
];
