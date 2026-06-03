import React from 'react';
import { motion } from 'framer-motion';
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

const features: Feature[] = [
  {
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    title: "Adaptive Context Windows",
    description: "Dynamic resource allocation ensures the model maintains focus on critical parameters without computational waste. Context windows scale from 4K to 128K tokens based on task complexity.",
    glossary: "DynaCon™ technology automatically adjusts the attention span of the neural engine based on the detected density of the information stream."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
    title: "State-Lock Enforcement",
    description: "Hardware-level isolation of ethical guardrails ensures system integrity even under extreme research conditions. Immutable safety constraints cannot be overridden by inference.",
    glossary: "Hard-wired safety logic that operates at the circuit level, separate from the primary inference paths, preventing 'jailbreaking' at the physical layer."
  },
  {
    icon: <GitBranch className="w-6 h-6 text-blue-400" />,
    title: "Directed Backtrace Graph",
    description: "Every inference decision is logged as a node in a weighted directed graph. When uncertainty exceeds thresholds, the engine backtraces to the last high-confidence state and re-evaluates.",
    glossary: "A recursive verification algorithm that maps every token generation back to its weighted source parameters, ensuring verifiable logic paths."
  }
];

export const Technology = () => {
  return (
    <section id="technology" className="py-24 bg-surface/30 relative noise-overlay" aria-labelledby="tech-heading">
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="label-chip mb-6">
              <Zap className="w-3.5 h-3.5" />
              CORE TECHNOLOGY
            </div>
            <h2 id="tech-heading" className="section-title">The WDBX Engine.</h2>
            <p className="text-xl text-text-dim mb-10 leading-relaxed">
              At the heart of MLAI's infrastructure lies the Weighted Directed Backtrace eXecution engine — a revolutionary processing unit that eliminates hallucination through structural self-correction.
            </p>
            
            <div className="space-y-8">
              <TooltipProvider>
                {features.map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                      {feat.icon}
                    </div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors cursor-help flex items-center gap-2">
                            {feat.title}
                            <Info className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[240px] bg-surface/90 backdrop-blur-md border-white/10">
                          <p className="text-xs leading-relaxed">{feat.glossary}</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-text-dim text-sm leading-relaxed">{feat.description}</p>
                    </div>
                  </motion.div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <div className="lg:w-1/2 relative aspect-square">
            {/* Lightweight canvas rendering keeps this section fast on first load. */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] border border-white/5 overflow-hidden">
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
