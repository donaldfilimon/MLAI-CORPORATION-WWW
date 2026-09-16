"use client";

import { useEffect, useState } from "react";
import { products } from "@/lib/brand";
import { ProvTag } from "@/components/ui";

const logLines = [
  "wdbx query --k 10 --dim 1024 … 2.31ms  recall 0.982",
  "wdbx query --k 10 --dim 1024 … 2.28ms  recall 0.983",
  "wdbx insert --batch 4096      … 6,612/s sustained",
  "wdbx query --k 10 --dim 1024 … 2.34ms  recall 0.981",
  "abi gpu.matmul 1024×1024      … 84× vs cpu baseline",
  "wdbx wal.verify --chain       … OK  (670,114 blocks)",
];

export function HeroBench() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(logLines.length);
      return;
    }
    const id = setInterval(() => {
      setVisible((v) => (v >= logLines.length ? v : v + 1));
    }, 700);
    return () => clearInterval(id);
  }, []);

  const stats = products.wdbx.heroStats;

  return (
    <div className="w-full border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-abbey" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            wdbx · bench · single M-series node
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">harness in repo</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-line border-b border-line xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <div className="font-mono text-2xl font-bold text-wdbx md:text-3xl">{s.value}</div>
            <div className="mt-1 text-xs text-slate-400">{s.label}</div>
            <div className="mt-2">
              <ProvTag tag={s.tag} />
            </div>
          </div>
        ))}
      </div>

      <div className="h-[10.4rem] overflow-hidden px-4 py-3 font-mono text-[11px] leading-[1.45rem]">
        {logLines.slice(0, visible).map((line, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-slate-500"
            style={{ animation: "heroLineIn 320ms ease-out both" }}
          >
            <span className="text-wdbx/70">$ </span>
            {line}
          </div>
        ))}
        <div className="text-wdbx/70" aria-hidden>
          {"$ "}
          <span className="inline-block h-3 w-[7px] translate-y-0.5 animate-pulse bg-wdbx/70" />
        </div>
      </div>
    </div>
  );
}
