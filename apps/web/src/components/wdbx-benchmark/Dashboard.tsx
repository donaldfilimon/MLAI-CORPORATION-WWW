import { CardPanel, Eyebrow, ProvLegend, ThroughputCard } from "@/components/site";
import { BENCHMARK_DISCLAIMER, GPU_SPEEDUP_ROWS } from "./charts";

/**
 * The measured/target performance panel on `/benchmarks`.
 *
 * This used to be a two-tab comparison dashboard: a "WDBX Vector Database" tab
 * plotting 15 metrics against 21 named commercial vector databases, and an
 * "Abbey AI Framework" tab plotting GLUE / SQuAD / HumanEval / "Factual
 * Accuracy" against GPT-4 and Claude. None of those figures — ours or theirs —
 * had a repo artifact behind them, so the whole comparison surface was removed
 * along with the machinery that served it (competitor filter, per-chart "#1"
 * rank badge, "Category Leads" / "Composite Target: Top-tier" stat tiles, the
 * normalized-consistency sparklines, and the CSV export that serialized all of
 * it to a file). See the header comment in `charts.ts` for the full list and
 * the rule.
 *
 * What is left is the one benchmark set `docs/master-reference.md` actually
 * backs, rendered by `ThroughputCard` so each row carries its own provenance
 * tag — the measured speedups and the target cannot be read as the same kind of
 * claim.
 */
export function Dashboard() {
  return (
    <section
      className="container-custom relative z-10 mt-16"
      aria-labelledby="gpu-accel-heading"
    >
      <Eyebrow className="mb-4">MEASURED AND TARGETED</Eyebrow>
      <h2
        id="gpu-accel-heading"
        className="mb-3 font-display text-2xl font-bold text-white"
      >
        GPU acceleration, tagged by provenance
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-text-dim text-pretty">
        {BENCHMARK_DISCLAIMER}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ThroughputCard
          title="ABI Framework — Metal GPU vs CPU"
          rows={GPU_SPEEDUP_ROWS}
          accent="abi"
        />
        <CardPanel title="How to read these">
          <p className="text-sm leading-relaxed text-text-dim text-pretty">
            Each row is tagged with where its figure comes from, and the classes
            are never mixed. A target is an engineering goal on our benchmark
            track — it is not a result, and a longer bar next to it does not
            make it one.
          </p>
          <ProvLegend variant="chips" className="pt-1" />
          <p className="text-sm leading-relaxed text-text-dim text-pretty">
            We do not publish head-to-head numbers against other vector
            databases or language models. Where a comparison is useful, it is an
            architectural one — see the table above.
          </p>
        </CardPanel>
      </div>
    </section>
  );
}
