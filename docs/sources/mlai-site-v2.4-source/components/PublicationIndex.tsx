"use client";

import { useMemo, useState } from "react";
import { publications } from "@/lib/brand";

const tags = ["All", ...Array.from(new Set(publications.map((p) => p.tag)))];

export function PublicationIndex() {
  const [active, setActive] = useState("All");
  const shown = useMemo(
    () => (active === "All" ? publications : publications.filter((p) => p.tag === active)),
    [active],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter publications by track">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            aria-pressed={active === t}
            className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
              active === t
                ? "border-abi bg-abi/15 text-abi"
                : "border-line text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            {t}
            <span className="ml-2 text-slate-600">
              {t === "All" ? publications.length : publications.filter((p) => p.tag === t).length}
            </span>
          </button>
        ))}
      </div>
      <div className="border border-line bg-panel">
        {shown.map((pub, i) => (
          <div
            key={pub.title}
            className={`grid gap-2 px-6 py-5 md:grid-cols-[110px_150px_1fr] md:items-baseline ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <span className="font-mono text-[11px] text-slate-500">{pub.date}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-abi">{pub.tag}</span>
            <div>
              <h3 className="text-sm font-semibold text-white">{pub.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{pub.abstract}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
