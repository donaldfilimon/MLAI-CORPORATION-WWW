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
// describes a design property of the WDBX *software* store that
// docs/master-reference.md §4/§6 documents. MLAI ships no silicon, so nothing
// here may reference hardware isolation, circuit-level logic, or a physical
// layer; and nothing may promise an absolute outcome ("eliminates", "ensures",
// "cannot be overridden") for a probabilistic system.
const features: Feature[] = [
  {
    icon: <Activity className="w-6 h-6 text-cyan-400" />,
    title: "HNSW Retrieval",
    description: "The store is indexed as a Hierarchical Navigable Small World graph, so nearest-neighbour search grows with the logarithm of the collection rather than scanning it. Distance kernels compile to the target ISA through Zig's SIMD vectors.",
    glossary: "A layered proximity graph. Search starts coarse in the sparse upper layers and descends, narrowing the candidate set at each hop. Defaults are M=16, efConstruction=200."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
    title: "Tamper-Evident History",
    description: "Interaction blocks are hash-chained in the write-ahead log, so a later edit to earlier history breaks the chain and is detectable on replay. The chain sits at the WAL level, not inside the index, so verifying history does not tax search.",
    glossary: "Each block commits to its predecessor — Hᵢ = SHA-256(Hᵢ₋₁ ‖ tᵢ ‖ seqᵢ ‖ pᵢ ‖ mᵢ). This makes history verifiable after the fact; it is not encryption and not an access-control mechanism."
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
              At the heart of MLAI's infrastructure sits WDBX — the Weighted Directed Backtrace eXecution store. It is software: a Zig vector and block store that keeps retrieval as weighted, inspectable paths. Confidence signals along those paths are designed to reduce hallucination surfaces, not to remove them.
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
