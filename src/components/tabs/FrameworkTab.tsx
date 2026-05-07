import React from 'react';
import { cn } from '../../lib/utils';
import { Shield, FlaskConical, Scale, Zap, Layers, Network, Info } from 'lucide-react';

export function FrameworkTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="technical-label text-[14px] text-cyan-400">MLAI Framework — Architectural Overview</h1>
        <p className={cn("text-xl font-bold tracking-tight text-white",)}>
          ETHICAL GOVERNANCE + UNRESTRICTED COMPUTATIONAL POWER
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 glass-card p-6 border-l-4 border-l-cyan-500">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Info className="text-cyan-500 w-5 h-5" /> Framework Context & Purpose
          </h2>
          <p className="text-text-dim text-sm font-mono leading-relaxed">
            The MLAI framework is designed as a foundational architecture for high-integrity, multi-agent AI systems.
            It addresses the critical challenge of reconciling advanced computational research with absolute
            ethical compliance and regulatory governance, ensuring transparency and structural reliability
            at scale.
          </p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="text-cyan-500 w-5 h-5" /> Core Framework Benefits
          </h2>
          <ul className="space-y-3 text-text-dim text-sm font-mono">
            <li className="flex items-start gap-2">
              <Network className="mt-1 w-4 h-4 text-cyan-500 shrink-0" />
              <span><strong>Structural Integrity:</strong> Eliminates orphaned writes through relational coupling.</span>
            </li>
            <li className="flex items-start gap-2">
              <Layers className="mt-1 w-4 h-4 text-cyan-500 shrink-0" />
              <span><strong>Tiered Access:</strong> Granular, identity-based permission modeling (ABAC).</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-1 w-4 h-4 text-cyan-500 shrink-0" />
              <span><strong>Ethical Compliance:</strong> Automated audit trails and state-lock enforcement.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="technical-label text-white">2. Persona Specialization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 space-y-2 border-t-2 border-t-[#00f2ff]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#00f2ff]" />
                <h3 className="technical-label text-white">Abbey</h3>
              </div>
              <span className="micro-label opacity-50 block">Empathetic Polymath</span>
              <p className="text-[10px] text-text-dim font-mono">
                Focus: Ethical compliance, privacy, and domain-specific expertise. Combines deep technical expertise with advanced emotional intelligence.
              </p>
            </div>
            
            <div className="glass-card p-4 space-y-2 border-t-2 border-t-[#d900ff]">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-[#d900ff]" />
                <h3 className="technical-label text-white">Aviva</h3>
              </div>
              <span className="micro-label opacity-50 block">Unrestricted Research</span>
              <p className="text-[10px] text-text-dim font-mono">
                Focus: Unrestricted computational capabilities for advanced research. Conducts complex data analysis and provides insights based on extensive computational processing.
              </p>
            </div>

            <div className="glass-card p-4 space-y-2 border-t-2 border-t-[#ffbb00]">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-[#ffbb00]" />
                <h3 className="technical-label text-white">Abi</h3>
              </div>
              <span className="micro-label opacity-50 block">Regulatory Mediation</span>
              <p className="text-[10px] text-text-dim font-mono">
                Focus: Regulatory mediation, dynamic moderation, and ethical oversight. Monitors interactions to ensure compliance with regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="technical-label text-white">3. WDBX Engine</h2>
          <p className="text-text-dim text-xs font-mono leading-relaxed">
            Core processing unit optimized for multi-persona interactions.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="technical-label text-white">4. Performance Benchmarks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-dim font-mono border-collapse">
              <thead>
                <tr className="bg-white/5 technical-label">
                  <th className="p-3 border border-white/10">Metric</th>
                  <th className="p-3 border border-white/10">WDBX Engine</th>
                  <th className="p-3 border border-white/10">Traditional Neural Architecture</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-white/10">Throughput</td>
                  <td className="p-3 border border-white/10 text-white">10,000 req/s</td>
                  <td className="p-3 border border-white/10">7,500 req/s</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">Latency</td>
                  <td className="p-3 border border-white/10 text-white">50 ms</td>
                  <td className="p-3 border border-white/10">80 ms</td>
                </tr>
                <tr>
                  <td className="p-3 border border-white/10">Accuracy</td>
                  <td className="p-3 border border-white/10 text-emerald-400">95%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
