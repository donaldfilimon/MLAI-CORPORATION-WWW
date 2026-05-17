import React from "react";
import { motion } from "framer-motion";
import { Network, Database, Brain, Cpu, Zap, ArrowRight, ArrowDown } from "lucide-react";

export function BlueprintTab({ theme }: { theme: any }) {
  const nodes = [
    { id: "abi", title: "Abi (Moderator)", icon: Brain, color: "#00ff9d" },
    { id: "abbey", title: "Abbey (Polymath)", icon: Brain, color: "#00f2ff" },
    { id: "aviva", title: "Aviva (Expert)", icon: Brain, color: "#ff3366" },
  ];

  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-4">
        <h1 className="technical-label text-[14px] flex items-center gap-2">
          <Network className="w-5 h-5" style={{ color: theme.hex }} />
          WDBX System Architecture
        </h1>
        <p className="text-text-dim text-[11px] font-mono leading-relaxed">
          The Wide Distributed Block Exchange (WDBX) facilitates low-latency 
          persona token injection and distributed embedding retrieval.
        </p>
      </div>

      <div className="relative h-[400px] flex flex-col items-center justify-center gap-8">
        {/* WDBX Engine */}
        <motion.div 
            className="glass-card p-6 flex flex-col items-center gap-3 border-2"
            style={{ borderColor: theme.hex }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <Database className="w-8 h-8" style={{ color: theme.hex }} />
            <span className="technical-label">WDBX Engine</span>
        </motion.div>

        <ArrowDown className="w-6 h-6 text-white/50" />

        {/* Personas */}
        <div className="grid grid-cols-3 gap-4 w-full">
            {nodes.map((node, i) => (
                <motion.div 
                    key={node.id}
                    className="glass-card p-4 flex flex-col items-center gap-2 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                >
                    <node.icon className="w-6 h-6" style={{ color: node.color }} />
                    <span className="technical-label text-[10px]">{node.title}</span>
                </motion.div>
            ))}
        </div>
        
        {/* Flow lines (abstract) */}
        <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none">
            <svg className="w-full h-full">
                <line x1="50%" y1="150" x2="16%" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="150" x2="50%" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="150" x2="84%" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="glass-card p-4 space-y-2">
            <h3 className="technical-label text-[10px] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                Embeddings
            </h3>
            <p className="text-[10px] text-text-dim">High-throughput vector storage and retrieval via HNSW+DiskANN.</p>
        </div>
        <div className="glass-card p-4 space-y-2">
            <h3 className="technical-label text-[10px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Token Injection
            </h3>
            <p className="text-[10px] text-text-dim">Dynamic persona-specific context injection at inference edge.</p>
        </div>
      </div>
    </div>
  );
}
