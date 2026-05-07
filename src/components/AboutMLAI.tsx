import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Layers, Network } from 'lucide-react';

export const AboutMLAI = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md"
    >
      <h2 className="text-3xl font-bold mb-6 text-cyan-400 font-mono tracking-tighter">
        MLAI: SECURE NEURAL ARCHITECTURE
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="text-cyan-500" /> Purpose
          </h3>
          <p className="text-text-dim text-sm leading-relaxed">
            MLAI provides a robust, high-integrity framework for orchestrating complex neural AI agents.
            Born from the necessity of ethical compliance and structural reliability, MLAI serves as the
            foundational layer for multi-agent systems that require absolute transparency and control.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="text-cyan-500" /> Benefits
          </h3>
          <ul className="space-y-2 text-text-dim text-sm">
            <li className="flex items-start gap-2">
              <Network className="mt-1 w-4 h-4 text-cyan-500" />
              <span><strong>Structural Integrity:</strong> Eliminates orphaned writes through relational coupling.</span>
            </li>
            <li className="flex items-start gap-2">
              <Layers className="mt-1 w-4 h-4 text-cyan-500" />
              <span><strong>Tiered Access:</strong> Granular, identity-based permission modeling (ABAC).</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-1 w-4 h-4 text-cyan-500" />
              <span><strong>Ethical Compliance:</strong> Automated audit trails and state-lock enforcement.</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
