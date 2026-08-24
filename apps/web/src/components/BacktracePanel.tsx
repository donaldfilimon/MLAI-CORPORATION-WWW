import { m, useReducedMotion, type Variants } from "framer-motion";

/**
 * The hero signature: a **weighted backtrace** — an answer resolved back
 * through the hash-chained evidence that produced it.
 *
 * Why this and not the particle canvas it replaced: a drifting point cloud
 * reads as "AI" generically and could sit on any competitor's homepage. The
 * backtrace is this product's own instrument — append-only blocks, each
 * carrying a parent hash and an authority weight, exactly as described in
 * `research/wdbx-weighted-backtrace-memory-store` and drawn in the logo mark
 * (the "M" is a weighted directed graph). It is the one thing on the page a
 * competitor could not reuse.
 *
 * Claims discipline: the trace is explicitly labelled illustrative. Weights
 * and hashes are shaped like real WDBX output but describe the *data model*,
 * not a measured benchmark — no latency/accuracy/QPS numbers appear here.
 *
 * Motion: one orchestrated moment. The chain resolves top-down, the way a
 * trace is actually walked — answer first, then each supporting block. Fully
 * disabled under `prefers-reduced-motion` (the chain renders settled).
 */

type Block = {
  /** Short block id, as surfaced by the store. */
  id: string;
  /** First bytes of the parent block's SHA-256 — the chain link. */
  parent: string;
  /** Authority weight in [0,1] — drives the meter width. */
  weight: number;
  source: string;
  excerpt: string;
  /** Which persona pulled this record; drives the accent. */
  persona: "abbey" | "aviva" | "abi";
};

const PERSONA = {
  abbey: { label: "Abbey", dot: "bg-emerald-400", meter: "bg-emerald-400/70", text: "text-emerald-300" },
  aviva: { label: "Aviva", dot: "bg-violet-400", meter: "bg-violet-400/70", text: "text-violet-300" },
  abi: { label: "Abi", dot: "bg-cyan-400", meter: "bg-cyan-400/70", text: "text-cyan-300" },
} as const;

const TRACE: Block[] = [
  {
    id: "blk_8f21c4",
    parent: "a17d…",
    weight: 0.94,
    source: "runbook/retention-policy.md",
    excerpt: "EU records stay in-region; no cross-border egress.",
    persona: "aviva",
  },
  {
    id: "blk_8f21b0",
    parent: "6c02…",
    weight: 0.71,
    source: "contracts/dpa-2026.pdf",
    excerpt: "Processor may not sub-process without written notice.",
    persona: "abi",
  },
  {
    id: "blk_8f2196",
    parent: "3e9f…",
    weight: 0.38,
    source: "thread/eng-platform#412",
    excerpt: "Earlier draft — superseded, retained for audit.",
    persona: "abbey",
  },
];

export const BacktracePanel = () => {
  const reduce = useReducedMotion();

  const chain: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
  };

  const link: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <m.figure
      variants={reduce ? undefined : chain}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "visible"}
      className="relative m-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070914]/80 backdrop-blur-sm"
    >
      {/* Panel chrome — reads as an instrument, not a marketing card. */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
          wdbx · backtrace
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim/50">
          chain verified
        </span>
      </div>

      {/* The answer being explained — the head of the chain. */}
      <m.div variants={reduce ? undefined : link} className="px-5 pt-5 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim/60">
          Answer
        </p>
        <p className="mt-2 font-display text-lg leading-snug text-white">
          “Keep the German customer records in-region.”
        </p>
      </m.div>

      <div className="relative px-5 pb-5">
        {/* The chain rail the blocks hang from. */}
        <div
          className="absolute bottom-14 left-[1.5625rem] top-0 w-px bg-linear-to-b from-cyan-400/60 via-white/20 to-white/5"
          aria-hidden="true"
        />

        <ul className="space-y-2.5">
          {TRACE.map((block) => {
            const persona = PERSONA[block.persona];
            return (
              <m.li
                key={block.id}
                variants={reduce ? undefined : link}
                className="relative flex gap-3.5"
              >
                {/* Chain node */}
                <span className="relative z-10 mt-3.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ring-4 ring-[#070914] ${persona.dot}`}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[0.028] px-3.5 py-3 transition-colors hover:border-cyan-400/25">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-mono text-[11px] text-text-dim/85">
                      {block.source}
                    </span>
                    <span className={`font-mono text-[11px] tabular-nums ${persona.text}`}>
                      {block.weight.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-1.5 truncate text-[13px] leading-snug text-white/90">
                    {block.excerpt}
                  </p>

                  {/* Authority weight meter — the "weighted" in weighted
                      backtrace. The WIDTH always encodes the weight; motion
                      only fills it in. (Animating scaleX from 0→1 on a
                      full-width bar made every meter read 1.00 under
                      prefers-reduced-motion — the data was wrong for exactly
                      the users who can't see it correct itself.) */}
                  <div
                    className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-white/10"
                    aria-hidden="true"
                  >
                    <m.div
                      className={`h-full rounded-full ${persona.meter}`}
                      style={{ width: `${block.weight * 100}%`, transformOrigin: "left" }}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={reduce ? undefined : { scaleX: 1 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-text-dim/45">
                    <span>{block.id}</span>
                    <span aria-hidden="true">←</span>
                    <span>parent {block.parent}</span>
                    <span className={`ml-auto ${persona.text} opacity-70`}>
                      {persona.label}
                    </span>
                  </div>
                </div>
              </m.li>
            );
          })}
        </ul>
      </div>

      <figcaption className="border-t border-white/8 px-5 py-3 font-mono text-[10px] leading-relaxed tracking-wide text-text-dim/50">
        Illustrative trace. Every answer keeps the weighted, hash-chained path
        back to the records that produced it.
      </figcaption>
    </m.figure>
  );
};
