import React from 'react';
import { cn } from '../../lib/utils';
import { Database } from 'lucide-react';

const MOCK_CHARTS = [
  {
    title: "p95 Latency (ms) for ANN Search",
    note: "Lower is better",
    data: [
      { label: "WDBX", value: 4.8 },
      { label: "Redis", value: 1.0 },
      { label: "Pinecone", value: 5.0 },
      { label: "Qdrant", value: 10.0 },
    ],
    max: 10.0
  },
  {
    title: "Queries Per Second (QPS)",
    note: "Higher is better",
    data: [
      { label: "WDBX", value: 12000 },
      { label: "Qdrant", value: 10000 },
      { label: "Redis", value: 8500 },
      { label: "Milvus", value: 7000 },
    ],
    max: 12000
  },
  {
    title: "Cost Efficiency ($/1M Vectors/Month)",
    note: "Lower is better",
    data: [
      { label: "WDBX", value: 0 },
      { label: "pgvector", value: 20 },
      { label: "Weaviate", value: 35 },
      { label: "Pinecone", value: 80 },
    ],
    max: 80
  },
  {
    title: "Multi-Tenancy Isolation Score",
    note: "Out of 10, Higher is better",
    data: [
      { label: "WDBX", value: 9.5 },
      { label: "Pinecone", value: 9.0 },
      { label: "Milvus", value: 8.5 },
      { label: "Qdrant", value: 8.0 },
    ],
    max: 10
  }
];

export function BenchmarksTab({ theme }: { theme: any }) {
  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="technical-label text-[14px] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#38d39f]" />
            WDBX Vector Engine
          </h1>
          <p className="text-text-secondary text-xs">Production-grade ML infrastructure for high-performance semantic search, built with Zig 0.16</p>
        </div>
        <button className="px-4 py-2 bg-[#134e4a] text-white border border-[#38d39f]/50 technical-label">
          Run Local Benchmark
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CHARTS.map((chart, i) => (
          <div key={i} className="glass-card p-4 space-y-4">
            <div>
              <h3 className="technical-label text-white">{chart.title}</h3>
              <p className="micro-label opacity-40">{chart.note}</p>
            </div>
            
            <div className="flex items-end gap-2 h-32 pt-4">
              {chart.data.map((item, j) => {
                const height = Math.max((item.value / chart.max) * 100, 2);
                const isWdbx = item.label === "WDBX";
                return (
                  <div key={j} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                    <span className="text-[10px] text-text-dim text-center opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                      {item.value}
                    </span>
                    <div 
                      className={cn(
                        "w-full rounded-sm transition-all duration-1000 origin-bottom",
                        isWdbx ? "bg-[#38d39f]" : "bg-[#6a4ac2]"
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className={cn(
                      "text-[8px] font-mono whitespace-nowrap overflow-hidden text-clip w-full text-center",
                      isWdbx ? "text-[#38d39f] font-bold" : "text-text-dim"
                    )}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 flex justify-between items-center bg-black/40">
        <div>
          <h3 className="technical-label text-white">Conclusions</h3>
          <p className="text-xs text-text-dim mt-1 font-mono">
            WDBX — Zig-optimized vector engine focusing on low-latency, high-throughput, and cost efficiency.
          </p>
        </div>
      </div>
    </div>
  );
}
