import type { CSSProperties, ReactNode } from "react";
import { PROV, type Prov, type Metric } from "@/lib/brand";

type AccentStyle = CSSProperties & { "--accent"?: string };

export function Eyebrow({ children, color }: { children: ReactNode; color?: string }) {
  return <div className="eyebrow" style={color ? { color } : undefined}>{children}</div>;
}

export function Surface({
  children, className = "", accent, interactive = false, style,
}: {
  children: ReactNode; className?: string; accent?: string;
  interactive?: boolean; style?: CSSProperties;
}) {
  const s: AccentStyle = { ...style };
  if (accent) s["--accent"] = accent;
  return (
    <div className={`surface ${interactive ? "surface-i" : ""} ${className}`} style={s}>
      {children}
    </div>
  );
}

export function ProvTag({ p, small = false }: { p: Prov; small?: boolean }) {
  const d = PROV[p];
  return (
    <span
      title={d.def}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded border border-line bg-white/[0.04] px-1.5 py-0.5 font-mono tracking-[0.08em]"
      style={{ color: d.color, fontSize: small ? 9 : 9.5 }}
    >
      <span aria-hidden="true">{d.mark}</span>
      {d.label.toUpperCase()}
    </span>
  );
}

export function MetricGrid({ metrics, accent }: { metrics: Metric[]; accent: string }) {
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
      {metrics.map((m) => (
        <Surface key={m.label} accent={accent} interactive className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Eyebrow>{m.label}</Eyebrow>
            <ProvTag p={m.prov} small />
          </div>
          <div className="font-mono text-[24px] font-semibold tracking-[-0.02em]" style={{ color: accent }}>
            {m.value}
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-faint">{m.note}</p>
        </Surface>
      ))}
    </div>
  );
}

export function Section({
  eyebrow, title, sub, color, children, first = false,
}: {
  eyebrow?: string; title?: string; sub?: string; color?: string;
  children?: ReactNode; first?: boolean;
}) {
  return (
    <section className={first ? "py-22" : "border-t border-line py-22"} style={{ paddingBlock: 88 }}>
      <div className="mx-auto max-w-[1120px] px-6">
        {(eyebrow || title) && (
          <div className="mb-10 max-w-[620px]">
            {eyebrow && <Eyebrow color={color}>{eyebrow}</Eyebrow>}
            {title && (
              <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.18] tracking-[-0.032em]">
                {title}
              </h2>
            )}
            {sub && <p className="mt-4 text-[15.5px] leading-[1.72] text-muted">{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function FAQ({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {items.map((f, i) => (
        <details key={f.q} className={`px-5 py-3.5 ${i ? "border-t border-line" : ""}`}>
          <summary className="flex items-center justify-between gap-3 text-[14.5px] font-medium">
            {f.q}
            <span className="faq-plus font-mono text-dim" aria-hidden="true">+</span>
          </summary>
          <p className="mt-2.5 text-[13.5px] leading-[1.7] text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Note({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <Surface accent={accent} interactive className="p-5">
      <div className="flex items-start gap-3">
        <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: accent }} />
        <div>
          <div className="font-display text-[14.5px] font-medium">{title}</div>
          <p className="mt-1.5 text-[13px] leading-[1.68] text-muted">{body}</p>
        </div>
      </div>
    </Surface>
  );
}
