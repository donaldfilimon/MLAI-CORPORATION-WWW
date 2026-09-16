import {
  WDBX_METRICS,
  PROV_GLYPH,
  PROV_LABEL,
  type Metric,
} from "@/lib/metrics";

const PROV_COLOR = {
  measured: "text-[var(--color-prov-measured)]",
  target: "text-[var(--color-prov-target)]",
  reported: "text-[var(--color-prov-reported)]",
} as const;

const products = [
  {
    name: "WDBX",
    accent: "var(--color-wdbx)",
    summary:
      "A vector database written in Zig 0.16. HNSW indexing, MVCC concurrency, product quantization, and a REST API. Runs on Metal, CUDA or Vulkan.",
    detail:
      "It is the memory backbone for everything else here — when a system in this stack needs vectors, it stores them in WDBX.",
  },
  {
    name: "ABI Framework",
    accent: "var(--color-abi)",
    summary:
      "Multi-persona routing. Classifies intent, picks a persona, retrieves against WDBX, and answers — with the whole inference path running locally.",
    detail:
      "Pure Swift 6.4, zero dependencies: tensor ops, GGUF loading, the Llama runtime, and the serving layer are all stdlib-only.",
  },
  {
    name: "Abbey Bot",
    accent: "var(--color-abbey)",
    summary:
      "A Discord bot that learns from the channels it sits in, with per-channel vector memory scoped by namespace.",
    detail:
      "Built on WDBX and ABI, which makes it the place where both get exercised against real traffic every day.",
  },
];

function MetricRow({ metric }: { metric: Metric }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,7rem)_1fr] items-baseline gap-x-4 border-t border-[var(--color-hairline)] py-4 sm:gap-x-6">
      <span
        aria-hidden="true"
        className={`font-mono text-xs ${PROV_COLOR[metric.prov]}`}
      >
        {PROV_GLYPH[metric.prov]}
      </span>
      <span className="font-mono text-xl text-[var(--color-ink)] tabular-nums sm:text-2xl">
        {metric.value}
      </span>
      <span className="text-sm text-[var(--color-ink-dim)]">
        {metric.label}
        <span className="sr-only"> — {PROV_LABEL[metric.prov]}</span>
      </span>
    </div>
  );
}

export default function Home() {
  const measured = WDBX_METRICS.filter((m) => m.prov === "measured");
  const targets = WDBX_METRICS.filter((m) => m.prov === "target");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-baseline justify-between px-6 pt-8">
        <span className="font-display text-sm font-semibold tracking-tight text-[var(--color-ink)]">
          MLAI
        </span>
        <span className="font-mono text-xs text-[var(--color-ink-faint)]">
          Orlando, FL
        </span>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="pt-20 pb-16 sm:pt-32">
          <h1 className="font-display max-w-3xl text-4xl leading-[1.08] font-bold tracking-tight text-balance text-[var(--color-ink)] sm:text-6xl">
            Vector infrastructure that never leaves the machine it runs on.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-ink-dim)]">
            MLAI builds a vector database in Zig and a local inference runtime in
            Swift, both tuned for Apple Silicon. No inference call leaves the
            device. No embedding is sent anywhere to be indexed.
          </p>
        </section>

        <section aria-labelledby="numbers" className="pb-20">
          <h2
            id="numbers"
            className="font-display text-xl font-semibold tracking-tight text-[var(--color-ink)]"
          >
            What we have measured
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-ink-faint)]">
            Every number on this page carries a mark. A filled circle is a result
            we produced and can reproduce. An open circle is a goal we have not
            reached yet. We do not print the second kind next to the first and
            let you guess.
          </p>

          <div className="mt-10">
            {measured.map((m) => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </div>

          <div className="mt-14">
            <h3 className="font-mono text-xs text-[var(--color-prov-target)]">
              {PROV_GLYPH.target} Not yet reached
            </h3>
            <div className="mt-4 opacity-70">
              {targets.map((m) => (
                <MetricRow key={m.label} metric={m} />
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="products" className="pb-20">
          <h2
            id="products"
            className="font-display text-xl font-semibold tracking-tight text-[var(--color-ink)]"
          >
            What we build
          </h2>

          <div className="mt-10 space-y-12">
            {products.map((p) => (
              <article
                key={p.name}
                className="border-l-2 pl-6"
                style={{ borderColor: p.accent }}
              >
                <h3
                  className="font-display text-lg font-semibold tracking-tight"
                  style={{ color: p.accent }}
                >
                  {p.name}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-[var(--color-ink-dim)]">
                  {p.summary}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-faint)]">
                  {p.detail}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t border-[var(--color-hairline)]">
        <div className="mx-auto max-w-5xl space-y-3 px-6 py-10 text-sm text-[var(--color-ink-faint)]">
          <p>
            MLAI Corporation, a Delaware C-Corp in Orlando, Florida. Source
            released under Apache-2.0.
          </p>
          <p className="max-w-2xl leading-relaxed">
            Built on Apple&rsquo;s public frameworks — Metal, Accelerate and Core
            ML. No partnership or endorsement implied.
          </p>
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} MLAI Corporation
          </p>
        </div>
      </footer>
    </div>
  );
}
