"use client";
import { useState } from "react";
import { layers } from "@/lib/brand";

export function LayerStack() {
  const [active, setActive] = useState(2);
  const ordered = [...layers].reverse();

  return (
    <div className="grid gap-2.5">
      {ordered.map((l) => {
        const idx = layers.indexOf(l);
        const on = idx === active;
        return (
          <button
            key={l.name}
            onClick={() => setActive(idx)}
            aria-expanded={on}
            className="relative overflow-hidden rounded-xl px-5 py-4 text-left transition-all duration-[250ms]"
            style={{
              background: on ? "var(--color-raise-hi)" : "transparent",
              border: `1px solid ${on ? `${l.color}44` : "var(--color-line)"}`,
            }}
          >
            {on && <span className="absolute inset-y-0 left-0 w-0.5" style={{ background: l.color }} />}
            <div className="flex flex-wrap items-baseline gap-3.5">
              <span className="font-mono text-[10px]" style={{ color: on ? l.color : "var(--color-dim)" }}>{l.n}</span>
              <span className="font-display text-[17px] font-semibold" style={{ color: on ? "var(--color-fg)" : "var(--color-muted)" }}>
                {l.name}
              </span>
              <span className="font-mono text-[10.5px] text-faint">{l.role}</span>
              <span className="ml-auto text-[12.5px] text-faint">{l.detail}</span>
            </div>
            {on && <p className="rise mt-3 max-w-[640px] text-[13.5px] leading-[1.75] text-muted">{l.why}</p>}
          </button>
        );
      })}
    </div>
  );
}
