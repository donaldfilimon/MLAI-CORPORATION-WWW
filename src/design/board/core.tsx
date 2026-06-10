/* ════════════════════════════════════════════════════════════════
   MLAI Design Upgrade v2 — core primitives
   Brand mark · section scaffolding · glass · before/after · mono ·
   scroll-reveal · token row · code block.
   ════════════════════════════════════════════════════════════════ */
import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";

/* ─────────────── Brand mark ─────────────── */
export function Mark({ size = 34 }: { size?: number }): ReactNode {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: "linear-gradient(135deg,#22d3ee 0%,#3b82f6 48%,#a855f7 100%)",
        boxShadow: "0 6px 18px -6px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      <span className="text-white font-black" style={{ fontSize: size * 0.46, fontFamily: "Outfit", lineHeight: 1 }}>M</span>
    </div>
  );
}

/* ─────────────── Section scaffolding ─────────────── */
export function Eyebrow({ children, color = "#22d3ee" }: { children: ReactNode; color?: string }): ReactNode {
  return (
    <div className="text-[11px] font-semibold uppercase mb-3" style={{ letterSpacing: "0.24em", color, fontFamily: "JetBrains Mono, monospace" }}>
      {children}
    </div>
  );
}

export function SectionHead({
  kicker, title, lede, color,
}: {
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  color?: string;
}): ReactNode {
  return (
    <header className="mb-10 max-w-3xl">
      {kicker && <Eyebrow color={color}>{kicker}</Eyebrow>}
      <h2 className="font-bold text-white tracking-tight" style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>{title}</h2>
      {lede && <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-slate-400 text-pretty">{lede}</p>}
    </header>
  );
}

/* glass surface */
interface GlassRamp {
  readonly bg: string;
  readonly border: string;
  readonly shadow: string;
}
const GLASS_RAMPS: Readonly<Record<1 | 2 | 3, GlassRamp>> = {
  1: { bg: "rgba(8,9,15,0.6)", border: "rgba(255,255,255,0.05)", shadow: "inset 0 1px 0 rgba(255,255,255,0.02), inset 0 2px 14px rgba(0,0,0,0.5)" },
  2: { bg: "linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.01))", border: "rgba(255,255,255,0.08)", shadow: "0 8px 32px rgba(0,0,0,0.35)" },
  3: { bg: "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))", border: "rgba(255,255,255,0.11)", shadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.01)" },
};

export function Glass({
  className = "", style = {}, children, level = 2,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  level?: 1 | 2 | 3;
}): ReactNode {
  const ramp = GLASS_RAMPS[level];
  return (
    <div
      className={className}
      style={{
        background: ramp.bg,
        border: `1px solid ${ramp.border}`,
        borderRadius: "var(--ds-radius, 20px)",
        boxShadow: ramp.shadow,
        backdropFilter: "blur(var(--ds-glass, 14px))",
        WebkitBackdropFilter: "blur(var(--ds-glass, 14px))",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* before/after toggle — controlled */
export function BeforeAfter({
  value, onChange, labels = ["Before", "After"],
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  labels?: readonly [string, string];
}): ReactNode {
  return (
    <div className="inline-flex p-1 rounded-full border border-white/10 bg-black/40" style={{ backdropFilter: "blur(8px)" }}>
      {labels.map((l, i) => {
        const selected = (i === 1) === value;
        const style: CSSProperties = selected
          ? { background: i === 1 ? "linear-gradient(90deg,#22d3ee,#3b82f6)" : "rgba(255,255,255,0.12)", color: "#fff", boxShadow: i === 1 ? "0 4px 16px -4px rgba(59,130,246,0.6)" : "none" }
          : { background: "transparent", color: "#94a3b8" };
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(i === 1)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
            style={style}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

/* small mono caption */
export function Mono({
  children, className = "", style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}): ReactNode {
  return <span className={className} style={{ fontFamily: "JetBrains Mono, monospace", ...style }}>{children}</span>;
}

/* scroll-reveal wrapper — fades + lifts children into view once */
export function Reveal({
  children, delay = 0, y = 22,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const obs = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* copyable token row helper */
export function TokenRow({
  name, value, swatch,
}: {
  name: string;
  value: string;
  swatch?: string;
}): ReactNode {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/6 last:border-0">
      {swatch && <span className="w-4 h-4 rounded-md shrink-0 ring-1 ring-white/10" style={{ background: swatch }} />}
      <Mono className="text-[12px] text-slate-300 flex-1 min-w-0 truncate">{name}</Mono>
      <Mono className="text-[12px] text-slate-500">{value}</Mono>
    </div>
  );
}

/* code block with copy button (used by the Tokens / CSS section) */
export function CodeBlock({ code, label }: { code: string; label?: string }): ReactNode {
  const [copied, setCopied] = useState(false);
  const copy = (): void => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  };
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#08090f", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "inset 0 2px 14px rgba(0,0,0,0.55)" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#f87171" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#fbbf24" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#34d399" }} />
          {label && <Mono className="text-[10px] text-slate-500 ml-2">{label}</Mono>}
        </div>
        <button
          type="button"
          onClick={copy}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors"
          style={{ color: copied ? "#34d399" : "#94a3b8", background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", fontFamily: "JetBrains Mono, monospace" }}
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-[12px] leading-relaxed" style={{ fontFamily: "JetBrains Mono, monospace", color: "#cbd5e1" }}><code>{code}</code></pre>
    </div>
  );
}
