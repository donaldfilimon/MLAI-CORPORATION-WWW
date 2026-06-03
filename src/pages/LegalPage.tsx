import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText } from 'lucide-react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, icon, content }: LegalPageProps) {
  return (
    <div className="container-custom pt-32 pb-20 min-h-screen font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="glass-card">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">{title}</h1>
              <p className="text-[10px] font-mono text-text-dim mt-1.5 uppercase tracking-widest">Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-invert prose-blue max-w-none">
            {content}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
