import { content } from "@/data";
import { PageHeader } from "@/components/PageHeader";

const CAT_STYLES: Record<string, string> = {
  added: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  changed: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  perf: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20",
  fixed: "text-amber-300 bg-amber-500/10 border-amber-500/20",
};

export const Changelog = () => {
  return (
    <section
      id="changelog"
      className="min-h-screen section-y bg-bg relative font-sans"
      aria-labelledby="changelog-heading"
    >
      <div className="container-custom pt-10">
        <PageHeader
          id="changelog-heading"
          tag="RELEASE HISTORY"
          title="What changed, and when."
          subtitle="Milestones across the ABI runtime, WDBX storage engine, and the Abbey training stack. Versions and dates are milestone markers aligned to the project's documented history — evidence-first, like everything else here."
        />

        <div className="relative mx-auto max-w-3xl">
          {/* timeline spine */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 via-white/10 to-transparent"
            aria-hidden="true"
          />
          <ol className="space-y-10">
            {content.changelog.map((entry) => (
              <li key={entry.version} className="relative pl-10">
                <span
                  className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-indigo-400/60 bg-bg"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                  <span className="font-mono text-sm font-bold text-indigo-300">
                    {entry.version}
                  </span>
                  <h2 className="text-lg font-display font-bold text-white">
                    {entry.title}
                  </h2>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/50">
                    {entry.date}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-text-dim">
                      <span
                        className={`mt-0.5 shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${CAT_STYLES[item.cat] ?? CAT_STYLES.added}`}
                      >
                        {item.cat}
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
