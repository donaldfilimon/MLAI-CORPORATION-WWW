import React from 'react';
import { cn } from '../../lib/utils';
import { Globe, Terminal, Network } from 'lucide-react';

export function PortfolioTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col items-center text-center space-y-4 pt-8">
        <h1 className="font-display text-5xl md:text-6xl text-white tracking-tight">Donald Filimon</h1>
        <p className="text-xl md:text-2xl text-[#0A84FF] font-light">Machine Learning & Open-Source Developer</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Globe className="w-4 h-4 text-text-dim" />
            <h3 className="technical-label text-white">Open-Source Projects</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <a href="https://github.com/donaldfilimon/wdbx" target="_blank" rel="noreferrer" 
               className="glass-card p-5 group hover:bg-white/10 transition-colors flex items-center justify-between">
              <div>
                <strong className="text-[#38d39f] font-mono text-sm block mb-1">WDBX</strong>
                <span className="text-text-secondary text-xs">Vector database for AI workloads</span>
              </div>
              <Terminal className="w-5 h-5 text-text-dim group-hover:text-white transition-colors" />
            </a>
            
            <a href="https://github.com/donaldfilimon/mlai-py" target="_blank" rel="noreferrer" 
               className="glass-card p-5 group hover:bg-white/10 transition-colors flex items-center justify-between">
              <div>
                <strong className="text-[#38d39f] font-mono text-sm block mb-1">mlai-py</strong>
                <span className="text-text-secondary text-xs">Python ML core library</span>
              </div>
              <Network className="w-5 h-5 text-text-dim group-hover:text-white transition-colors" />
            </a>
            
            <a href="https://github.com/underswitchx/gama" target="_blank" rel="noreferrer" 
               className="glass-card p-5 group hover:bg-white/10 transition-colors flex items-center justify-between">
              <div>
                <strong className="text-[#38d39f] font-mono text-sm block mb-1">Gama</strong>
                <span className="text-text-secondary text-xs">Swift GPU framework</span>
              </div>
              <Terminal className="w-5 h-5 text-text-dim group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="technical-label text-white border-b border-white/10 pb-2">Skills Snapshot</h3>
          <div className="glass-card p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-text-secondary block">Python</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10"><div className="h-full bg-[#38d39f] w-[95%]"></div></div>
                  <span className="text-[#38d39f]">95%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">C++</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10"><div className="h-full bg-[#38d39f] w-[85%]"></div></div>
                  <span className="text-[#38d39f]">85%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">Swift</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10"><div className="h-full bg-[#38d39f] w-[80%]"></div></div>
                  <span className="text-[#38d39f]">80%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">ML</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10"><div className="h-full bg-[#38d39f] w-[90%]"></div></div>
                  <span className="text-[#38d39f]">90%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-secondary block">LLVM</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10"><div className="h-full bg-[#38d39f] w-[88%]"></div></div>
                  <span className="text-[#38d39f]">88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 pt-8 technical-label text-xs">
          <a href="https://github.com/underswitchx" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-white transition-colors">
            [ GitHub ]
          </a>
          <a href="https://linkedin.com/in/donaldfilimon" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-white transition-colors">
            [ LinkedIn ]
          </a>
          <a href="https://twitter.com/donaldfilimon" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-white transition-colors">
            [ Twitter ]
          </a>
        </div>
      </div>
    </div>
  );
}
