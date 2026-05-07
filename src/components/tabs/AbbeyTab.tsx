import React from 'react';
import { cn } from '../../lib/utils';
import { Shield } from 'lucide-react';

export function AbbeyTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="technical-label text-[14px] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00f2ff]" />
          Abbey Persona Research
        </h1>
        <p className="text-[#00f2ff] text-sm font-bold tracking-widest uppercase">
          The Empathetic Polymath with Prime-Based Response Mechanisms
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 space-y-3 border-l-4 border-l-[#00f2ff]">
          <h2 className="technical-label text-white">Abstract</h2>
          <p className="text-text-dim text-xs font-mono leading-relaxed">
            Abbey represents the cornerstone of the multi-persona AI framework, designed to function as the "empathetic polymath" — a persona that combines deep technical expertise across multiple domains with advanced emotional intelligence and communicative capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="technical-label text-white">Key Design Objectives</h2>
            <ul className="space-y-3 text-text-dim text-[11px] font-mono list-none">
              <li className="flex items-start gap-2">
                <span className="text-[#00f2ff] mt-0.5">&gt;</span>
                <span><strong className="text-white">Empathetic Communication:</strong> Recognize emotional cues and adapt communication style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00f2ff] mt-0.5">&gt;</span>
                <span><strong className="text-white">Technical Versatility:</strong> Comprehensive expertise across programming, AI/ML, mathematics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00f2ff] mt-0.5">&gt;</span>
                <span><strong className="text-white">Educational Value:</strong> Optimize explanations to be educational</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00f2ff] mt-0.5">&gt;</span>
                <span><strong className="text-white">Balanced Judgment:</strong> Acknowledge complexities and nuances</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="technical-label text-white">Architectural Design</h2>
            
            <div className="glass-card p-3 space-y-1">
              <h3 className="technical-label text-[9px] text-[#00f2ff]">Dual-Stream Processing</h3>
              <p className="text-text-dim text-[10px] font-mono">Empathetic Stream + Technical Stream operating in parallel with cross-stream attention mechanisms.</p>
            </div>
            
            <div className="glass-card p-3 space-y-1">
              <h3 className="technical-label text-[9px] text-[#00f2ff]">Prime-Numbered Layer Structure</h3>
              <p className="text-text-dim text-[10px] font-mono">Layer_i = Dense(Layer_i-1, units=P_i) where P_i is the i-th prime number. Creates non-uniform patterns to reduce forgetting.</p>
            </div>
            
            <div className="glass-card p-3 space-y-1">
              <h3 className="technical-label text-[9px] text-[#00f2ff]">Transformer-Based Core</h3>
              <p className="text-text-dim text-[10px] font-mono">Modified architecture with a prime number of attention heads for enhanced diversity of information capture.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="technical-label text-white">Performance Evaluation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-text-dim font-mono border-collapse">
              <thead>
                <tr className="bg-white/5 technical-label">
                  <th className="p-3 border border-white/10">Metric</th>
                  <th className="p-3 border border-white/10 text-[#00f2ff]">Abbey</th>
                  <th className="p-3 border border-white/10">GPT-4</th>
                  <th className="p-3 border border-white/10">Claude</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-white/10">Empathy Accuracy Rate</td>
                  <td className="p-3 border border-white/10 text-white font-bold">92%</td>
                  <td className="p-3 border border-white/10">78%</td>
                  <td className="p-3 border border-white/10">81%</td>
                </tr>
                <tr className="bg-white/5">
                  <td className="p-3 border border-white/10">User Satisfaction</td>
                  <td className="p-3 border border-white/10 text-white font-bold">94%</td>
                  <td className="p-3 border border-white/10">—</td>
                  <td className="p-3 border border-white/10">—</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">Bug Identification</td>
                  <td className="p-3 border border-white/10 text-white font-bold">93%</td>
                  <td className="p-3 border border-white/10">78%</td>
                  <td className="p-3 border border-white/10">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
