"use client";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { T } from "@/lib/tokens";

const FLOW = [
  { k: "query", label: "Query", color: T.faint },
  { k: "embed", label: "Embed", color: T.abi },
  { k: "hnsw", label: "HNSW search", color: T.wdbx },
  { k: "blocks", label: "Chained blocks", color: T.wdbx },
  { k: "route", label: "Persona route", color: T.aviva },
  { k: "reply", label: "Response", color: T.abbey },
];

export function FlowStrip() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s + 1) % FLOW.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-wrap items-center rounded-xl border border-line bg-raise px-5 py-[18px]">
      {FLOW.map((f, i) => {
        const on = i === step;
        return (
          <div key={f.k} className="flex items-center">
            <div
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-[400ms]"
              style={{
                background: on ? `${f.color}14` : "transparent",
                border: `1px solid ${on ? `${f.color}44` : "transparent"}`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full transition-opacity duration-[400ms]"
                style={{ background: f.color, opacity: on ? 1 : 0.3 }} />
              <span className="whitespace-nowrap font-mono text-[11px] transition-colors duration-[400ms]"
                style={{ color: on ? "var(--color-fg)" : "var(--color-faint)" }}>
                {f.label}
              </span>
            </div>
            {i < FLOW.length - 1 && <ChevronRight size={13} className="mx-0.5 shrink-0 text-dim" />}
          </div>
        );
      })}
    </div>
  );
}
