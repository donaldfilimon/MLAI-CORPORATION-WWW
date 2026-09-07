"use client";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ lang, lines, prompt = false }: {
  lang: string; lines: string[]; prompt?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(lines.join("\n")); } catch { /* clipboard blocked */ }
    setCopied(true);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono text-[10.5px] text-faint">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 font-mono text-[10.5px]"
          style={{ color: copied ? "var(--color-signal)" : "var(--color-faint)" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-[18px]">
        <code className="font-mono text-[12.5px] leading-[1.85]">
          {lines.map((l, i) => (
            <div key={i} className="flex">
              <span className="select-none pr-3.5 text-dim">{prompt ? "$" : String(i + 1).padStart(2, " ")}</span>
              <span className="text-white/85">{l || " "}</span>
            </div>
          ))}
          {prompt && (
            <div className="mt-1.5 flex">
              <span className="select-none pr-3.5 text-dim">$</span>
              <span className="blink h-3.5 w-[7px] bg-signal" />
            </div>
          )}
        </code>
      </pre>
    </div>
  );
}
