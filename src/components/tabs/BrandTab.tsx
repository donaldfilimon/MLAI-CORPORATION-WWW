import React from 'react';
import { cn } from '../../lib/utils';
import { Layers } from 'lucide-react';

export function BrandTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="technical-label text-[14px]">MLAI Corporation Brand Guidelines v2.0</h1>
        <p className="text-text-secondary text-sm font-light">Democratizing advanced intelligence ethically • Powered by the Abbey-Aviva-Abi Framework</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 space-y-4">
          <h3 className="technical-label text-[11px] text-white">Core Values</h3>
          <ul className="space-y-2 text-text-dim text-xs font-mono">
            <li>&gt; Innovation • Integrity • Accessibility • Scalability • Trust</li>
            <li>&gt; Prime-based optimization for ethical, high-performance AI</li>
          </ul>
        </div>
        
        <div className="glass-card p-6 space-y-4">
          <h3 className="technical-label text-[11px] text-white">Mission</h3>
          <p className="text-text-dim text-xs leading-relaxed font-mono">
            The Abbey-Aviva-Abi Multi-Persona AI Framework balances ethical governance with advanced computational capabilities across industries.
          </p>
        </div>
        
        <div className="glass-card p-6 space-y-4 md:col-span-2">
          <h3 className="technical-label text-[11px] text-white">Color Palette</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#0A84FF] shadow-[0_0_15px_rgba(10,132,255,0.3)]"></div>
              <div className="text-center font-mono text-[9px] text-text-dim">#0A84FF<br/>Primary Blue</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#38d39f] shadow-[0_0_15px_rgba(56,211,159,0.3)]"></div>
              <div className="text-center font-mono text-[9px] text-text-dim">#38d39f<br/>Accent Green</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#001F3F] border border-white/20"></div>
              <div className="text-center font-mono text-[9px] text-text-dim">#001F3F<br/>Deep Navy</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4 md:col-span-2">
          <h3 className="technical-label text-[11px] text-white">Voice &amp; Tone</h3>
          <p className="text-text-dim text-xs leading-relaxed font-mono">
            Confident yet approachable. Technically precise. Forward-looking. Empathetic polymath style — never condescending. Prime-based response structuring for natural flow.
          </p>
        </div>
      </div>
    </div>
  );
}
