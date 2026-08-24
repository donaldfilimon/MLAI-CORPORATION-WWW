import React from 'react';
import { m } from "framer-motion";
import { Activity, ShieldCheck, Zap, GitBranch, Info } from 'lucide-react';
import { Viewport3D } from './Viewport3D';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  glossary: string;
}

// Claims discipline (CLAUDE.md · docs/voice-guidelines.md): every line below
// describes a design property verified in the active sibling Rust substrate.
// That crate outranks the frozen Zig-era mirror and master-reference prose.
// MLAI ships no silicon, so nothing
// here may reference hardware isolation, circuit-level logic, or a physical
// layer; and nothing may promise an absolute outcome ("eliminates", "ensures",
// "cannot be overridden") for a probabilistic system.
const features: Feature[] = [
  {
    icon: <Activity className="w-6 h-6 text-cyan-400" />,
    // crates/abi-wdbx/src/hnsw.rs defines and exercises the layered graph.
    title: "HNSW Vector Retrieval",
    description: "The active Rust store implements a layered HNSW graph with M = 16, EF_CONSTRUCTION = 40, and EF_SEARCH = 32. Those are configuration facts from source, not benchmark results.",
    glossary: "Each stored item carries an embedding; a query is embedded the same way, and the store returns the nearest vectors by cosine similarity."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
    title: "Tamper-Evident History",
    // Kept, unlike the HNSW card above, because the mirrored WDBX docs DO
    // document this: architecture.md lists "block-chain memory" under
    // `src/database/*`. Trimmed anyway — the earlier draft asserted the chain
    // "sits at the WAL level, not inside the index", which the mirrored docs
    // do not describe and which referenced an index this file no longer
    // claims. The property that matters is detectability, not placement.
    // The disclaimer lives in `description`, NOT `glossary`, and that placement
    // is the point. `glossary` renders only inside the tooltip, which is
    // portal-mounted on open — verified absent from the server-rendered HTML,
    // so a crawler, an llms.txt consumer, or anyone who never hovers sees the
    // CLAIM ("tamper-evident", "hash-chained") without the QUALIFIER. A hedge
    // that is less visible than the thing it hedges is not a hedge.
    // Rule for this file: elaboration may live in `glossary`; any sentence
    // that LIMITS a claim must be in `description`.
    description: "Interaction blocks are hash-chained, so a later edit to earlier history breaks the chain and is detectable on replay. It is not encryption and not an access-control mechanism — it tells you whether a record changed, not who may read it.",
    glossary: "Each block commits to its predecessor, so verifying the chain end to end also verifies every block in it."
  },
  {
    icon: <GitBranch className="w-6 h-6 text-cyan-400" />,
    title: "Directed Backtrace Graph",
    description: "Retrieval and generation steps are recorded as nodes in a weighted directed graph. When confidence along a path drops, the chain is traversed backward to the divergence point and the session is rewound from there.",
    glossary: "A traversal over the recorded chain that maps a generated span back to the weighted records behind it — so a result can be traced rather than inferred from the output alone."
  }
];

export const Technology = () => {
  return (
    <section id="technology" className="section-y bg-surface/30 relative noise-overlay" aria-labelledby="tech-heading">
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="label-chip mb-6">
              <Zap className="w-3.5 h-3.5" />
              CORE TECHNOLOGY
            </div>
            <h2 id="tech-heading" className="section-title">The WDBX Engine.</h2>
            <p className="text-xl text-text-dim mb-10 leading-relaxed">
              At the heart of MLAI's infrastructure sits WDBX — the Weighted Directed Backtrace eXecution store. Its active Rust substrate combines HNSW retrieval, MVCC, and inspectable history. Confidence signals along those paths are designed to reduce hallucination surfaces, not to remove them.
            </p>
            
            <div className="space-y-8">
              <TooltipProvider>
                {features.map((feat, i) => (
                  <m.div
                    key={feat.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all">
                      {feat.icon}
                    </div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {/* h3, not h4: the section's own heading is the h2
                              above, so an h4 here skipped a level. `text-lg`
                              keeps the original visual size. */}
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors cursor-help flex items-center gap-2">
                            {feat.title}
                            <Info className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-60 bg-surface/90 backdrop-blur-md border-white/10">
                          <p className="text-xs leading-relaxed">{feat.glossary}</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-text-dim text-sm leading-relaxed">{feat.description}</p>
                    </div>
                  </m.div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <div className="lg:w-1/2 relative aspect-square">
            {/* Lightweight canvas rendering keeps this section fast on first load. */}
            <div className="absolute inset-0 bg-cyan-500/5 rounded-[40px] border border-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-grid opacity-10" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Viewport3D />
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
