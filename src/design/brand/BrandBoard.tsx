/* MLAI — Brand Guidelines board. Self-contained, typed React module. */
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

/* ── board-specific CSS (from the prototype's inline <style>) ─────────────────
   Scoped under .bb-root so it never collides with the app's global `.glass`.
   The page background gradient is applied as an inline style on the root. */
const BOARD_CSS = `
.bb-root .glass {
  backdrop-filter: blur(20px);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
}
.bb-root .gtext {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(90deg,#67e8f9,#60a5fa,#c084fc);
}
.bb-root::-webkit-scrollbar { width: 9px; }
.bb-root::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 6px; }
`;

/* ── icons ───────────────────────────────────────────────────────────────── */
interface IcoProps {
  d?: ReactNode;
  s?: number;
}
type IconProps = Omit<IcoProps, "d">;

const Ico = ({ d, s = 16 }: IcoProps): ReactNode => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const ICopy = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <rect width="14" height="14" x="8" y="8" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </>
    }
  />
);
const ICheck = (p: IconProps): ReactNode => <Ico {...p} d={<path d="M20 6 9 17l-5-5" />} />;
const IX = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </>
    }
  />
);
const IEye = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);
const IShield = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    }
  />
);
const IZap = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    }
  />
);
const ISpark = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <path d="M9.94 14.66A4 4 0 0 1 5.34 10 4 4 0 0 1 10 5.34a4 4 0 0 1 4.66-4.6 4 4 0 0 1 4.6 4.66A4 4 0 0 1 18.66 10a4 4 0 0 1-4.6 4.66 4 4 0 0 1-4.12 0Z" />
    }
  />
);
const IFlow = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
        <path d="M6 9v6a2 2 0 0 0 2 2h7" />
      </>
    }
  />
);
const IDb = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      </>
    }
  />
);
const ILayers = (p: IconProps): ReactNode => (
  <Ico {...p} d={<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />} />
);

/* ── brand atoms ─────────────────────────────────────────────────────────── */
const Mark = ({ size = 32, radius }: { size?: number; radius?: number }): ReactNode => (
  <div
    className="bg-linear-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shrink-0"
    style={{ width: size, height: size, borderRadius: radius ?? size * 0.28 }}
  >
    <span className="text-white font-black" style={{ fontSize: size * 0.46, lineHeight: 1, fontFamily: "Outfit" }}>
      M
    </span>
  </div>
);

const Wordmark = ({ size = 20 }: { size?: number }): ReactNode => (
  <span className="font-bold tracking-[0.18em] text-white" style={{ fontSize: size }}>
    MLAI
  </span>
);

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function NetworkCanvas(): ReactNode {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];

    const rs = (): void => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: Math.min(48, Math.floor((w * h) / 9000)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    };
    rs();
    addEventListener("resize", rs);

    const draw = (): void => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const ds = Math.hypot(dx, dy);
          if (ds < 110) {
            ctx.strokeStyle = `rgba(34,211,238,${0.14 * (1 - ds / 110)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of nodes) {
        ctx.fillStyle = "rgba(34,211,238,.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, 7);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ── color swatch ────────────────────────────────────────────────────────── */
interface SwatchData {
  name: string;
  hex: string;
  sub?: string;
  ink?: boolean;
}

function Swatch({ name, hex, sub, ink }: SwatchData): ReactNode {
  const [c, setC] = useState(false);
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      /* clipboard unavailable */
    }
    setC(true);
    setTimeout(() => setC(false), 1200);
  };
  return (
    <button onClick={copy} className="group text-left w-full">
      <div className="h-20 rounded-xl border border-white/10 relative overflow-hidden" style={{ background: hex }}>
        <div
          className={`absolute inset-0 flex items-center justify-center text-xs font-medium transition-opacity ${
            c ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${ink ? "text-white" : "text-slate-900"} ${c ? "bg-black/20" : "bg-black/10"}`}
        >
          {c ? (
            <span className="flex items-center gap-1">
              <ICheck s={14} /> Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ICopy s={14} /> {hex}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 text-sm text-white font-medium">{name}</div>
      <div className="text-xs text-slate-500 font-mono">
        {hex}
        {sub ? ` · ${sub}` : ""}
      </div>
    </button>
  );
}

/* ── layout primitives ───────────────────────────────────────────────────── */
function Section({
  n,
  kicker,
  title,
  children,
}: {
  n: string;
  kicker: string;
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="px-6 sm:px-10 py-16 max-w-5xl mx-auto scroll-mt-20" id={kicker.toLowerCase()}>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs font-mono text-slate-600">{n}</span>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">{kicker}</div>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8" style={{ fontFamily: "Outfit, sans-serif" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }): ReactNode => (
  <div className={`glass p-6 ${className}`}>{children}</div>
);

/* ── data ────────────────────────────────────────────────────────────────── */
const CORE: readonly SwatchData[] = [
  { name: "Cyan", hex: "#22d3ee", sub: "primary accent", ink: true },
  { name: "Blue", hex: "#60a5fa", sub: "gradient mid", ink: true },
  { name: "Violet", hex: "#a855f7", sub: "depth / intensity", ink: true },
];
const PERSONA: readonly SwatchData[] = [
  { name: "Abi · Cyan", hex: "#22d3ee", sub: "moderator", ink: true },
  { name: "Aviva · Violet", hex: "#a855f7", sub: "expert", ink: true },
  { name: "Abbey · Emerald", hex: "#34d399", sub: "polymath", ink: true },
];
const SUPPORT: readonly SwatchData[] = [
  { name: "Emerald", hex: "#34d399", sub: "success / Abbey", ink: true },
  { name: "Amber", hex: "#fbbf24", sub: "warning", ink: true },
  { name: "Red", hex: "#f87171", sub: "error / Aviva edge", ink: true },
];
const NEUTRAL: readonly SwatchData[] = [
  { name: "Ink", hex: "#020510", sub: "background", ink: true },
  { name: "Slate 950", hex: "#020617", sub: "surface", ink: true },
  { name: "Slate 800", hex: "#1e293b", sub: "borders", ink: true },
  { name: "Slate 400", hex: "#94a3b8", sub: "body text", ink: true },
  { name: "White", hex: "#ffffff", sub: "headings" },
];

type VoiceColor = "emerald" | "violet" | "cyan";
interface VoiceItem {
  icon: (p: IconProps) => ReactNode;
  name: string;
  role: string;
  c: VoiceColor;
  desc: string;
  sample: string;
}
const VOICE: readonly VoiceItem[] = [
  {
    icon: ISpark,
    name: "Abbey",
    role: "Empathic Polymath",
    c: "emerald",
    desc: "Warm, encouraging, scaffolds hard ideas with metaphor before precision. Confident enough to hold an opinion.",
    sample:
      "“Think of a vector database as a library that files books by meaning, not title. Here’s exactly how WDBX does it…”",
  },
  {
    icon: IZap,
    name: "Aviva",
    role: "Unfiltered Expert",
    c: "violet",
    desc: "Direct, concise, zero hedging or preamble. Optimized for technical density and speed.",
    sample: "“Use HNSW. M=16, ef=200. Cosine for text, L2 for clustering. Done.”",
  },
  {
    icon: IFlow,
    name: "Abi",
    role: "Adaptive Moderator",
    c: "cyan",
    desc: "Neutral and balanced. Classifies intent, routes, and blends the other two. The brand’s default register.",
    sample: "“Routing this to Abbey — it reads as a learning question with some frustration.”",
  },
];

interface Principle {
  icon: (p: IconProps) => ReactNode;
  t: string;
  m: string;
  d: string;
}
const PRINCIPLES: readonly Principle[] = [
  { icon: IEye, t: "Disciplined Secrecy", m: "Apple-style", d: "Protect what we build. Restraint is how we keep an edge and earn trust." },
  { icon: IShield, t: "Mission Stewardship", m: "Frontier-lab-style", d: "Privacy-first AI is a responsibility, governed with long-term seriousness." },
  { icon: IZap, t: "Operational Velocity", m: "NVIDIA-style", d: "Move with intent, ship with momentum. Velocity as discipline." },
];

interface TypeSpec {
  label: string;
  spec: string;
  el: ReactNode;
}
const TYPE: readonly TypeSpec[] = [
  {
    label: "Display / H1",
    spec: "Outfit · 56–72px · tracking-tight",
    el: (
      <span className="text-5xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
        Private by default
      </span>
    ),
  },
  {
    label: "Heading / H2",
    spec: "Outfit · 32–40px",
    el: (
      <span className="text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
        The infrastructure layer
      </span>
    ),
  },
  {
    label: "Subhead",
    spec: "System sans · 18–20px · gradient",
    el: (
      <span className="text-xl gtext" style={{ fontFamily: "system-ui" }}>
        fast by design, private by default
      </span>
    ),
  },
  {
    label: "Body",
    spec: "System sans · 15–16px · slate-300",
    el: (
      <span className="text-base text-slate-300" style={{ fontFamily: "system-ui" }}>
        A purpose-built substrate fusing sharding, integrity, and concurrency.
      </span>
    ),
  },
  {
    label: "Eyebrow",
    spec: "System sans · 12px · uppercase · tracking-widest · cyan",
    el: <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Technology</span>,
  },
  {
    label: "Mono / metrics",
    spec: "JetBrains Mono · code, equations, data",
    el: <span className="font-mono text-cyan-200 text-base">L_shard = α + (β·S)/n</span>,
  },
];

const NAV: readonly string[] = ["Logo", "Color", "Type", "Voice", "Visual", "Principles"];

const TYPE_CARDS: readonly [string, string, string][] = [
  ["Display", "Outfit", "Geometric sans. Headlines & hero."],
  ["UI / Body", "System sans", "Interface, paragraphs, labels."],
  ["Mono", "JetBrains Mono", "Equations, metrics, code."],
];

interface MisuseItem {
  label: string;
  el: ReactNode;
}
const MISUSE: readonly MisuseItem[] = [
  {
    label: "Don't stretch",
    el: (
      <div
        className="bg-linear-to-br from-cyan-400 to-purple-600 flex items-center justify-center"
        style={{ width: 52, height: 26, borderRadius: 7 }}
      >
        <span className="text-white font-black text-xs">M</span>
      </div>
    ),
  },
  {
    label: "Don't recolor",
    el: (
      <div className="w-8 h-8 rounded-lg bg-slate-500 flex items-center justify-center">
        <span className="text-white font-black text-sm">M</span>
      </div>
    ),
  },
  {
    label: "No heavy shadow",
    el: (
      <div
        className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-purple-600 flex items-center justify-center"
        style={{ boxShadow: "0 0 18px 6px rgba(34,211,238,.9)" }}
      >
        <span className="text-white font-black text-sm">M</span>
      </div>
    ),
  },
  {
    label: "No busy bg",
    el: (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#f59e0b,#f59e0b 4px,#ef4444 4px,#ef4444 8px)" }}
      >
        <span className="text-white font-black text-sm">M</span>
      </div>
    ),
  },
];

interface ProductIcon {
  i: (p: IconProps) => ReactNode;
  t: string;
  c: VoiceColor;
}
const PRODUCT_ICONS: readonly ProductIcon[] = [
  { i: IDb, t: "WDBX", c: "cyan" },
  { i: ILayers, t: "ABI", c: "violet" },
  { i: ISpark, t: "Abbey", c: "emerald" },
];

/* color → Tailwind class helpers (full literals so the v4 scanner keeps them) */
const textClass: Record<VoiceColor, string> = {
  emerald: "text-emerald-400",
  violet: "text-purple-400",
  cyan: "text-cyan-400",
};
const borderLeftClass: Record<VoiceColor, string> = {
  emerald: "border-l-emerald-400/60",
  violet: "border-l-purple-400/60",
  cyan: "border-l-cyan-400/60",
};
const ramp: Record<VoiceColor, string> = {
  emerald: "from-emerald-400 to-emerald-700",
  violet: "from-purple-400 to-purple-700",
  cyan: "from-cyan-400 to-cyan-700",
};

/* ── board ───────────────────────────────────────────────────────────────── */
export default function BrandBoard(): ReactNode {
  const scroller = useRef<HTMLDivElement>(null);
  const go = (id: string): void => {
    scroller.current?.querySelector(`#${id.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div
      ref={scroller}
      className="bb-root h-screen overflow-y-auto text-white"
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "radial-gradient(125% 85% at 50% -8%,#0c1730 0%,#06091a 44%,#02030a 100%)",
      }}
    >
      <style>{BOARD_CSS}</style>

      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-50">
          <NetworkCanvas />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-14">
          <div className="flex items-center gap-3 mb-8">
            <Mark size={44} />
            <Wordmark size={26} />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">Brand Guidelines · v1.0</div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]" style={{ fontFamily: "Outfit, sans-serif" }}>
            The MLAI <span className="gtext">identity system</span>
          </h1>
          <p className="mt-5 text-lg text-slate-300 max-w-2xl">
            How we look, sound, and hold ourselves — privacy-first, precise, and quietly premium. Click any color to
            copy its value.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-30 bg-[#020510]/85 backdrop-blur border-b border-white/10 px-6 sm:px-10 py-3 flex gap-2 flex-wrap">
        {NAV.map((n) => (
          <button
            key={n}
            onClick={() => go(n)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {n}
          </button>
        ))}
      </div>

      <Section n="01" kicker="Logo" title="The mark & wordmark">
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Primary lockup</div>
            <div className="flex items-center gap-3 h-20">
              <Mark size={40} />
              <Wordmark size={24} />
            </div>
          </Card>
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Mark only</div>
            <div className="flex items-center justify-center h-20">
              <Mark size={56} />
            </div>
          </Card>
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Stacked</div>
            <div className="flex flex-col items-center justify-center gap-2 h-20">
              <Mark size={36} />
              <Wordmark size={16} />
            </div>
          </Card>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">On dark (preferred)</div>
            <div className="rounded-xl bg-slate-950 border border-white/10 flex items-center gap-3 h-24 px-6">
              <Mark size={36} />
              <Wordmark size={22} />
            </div>
          </Card>
          <div className="glass p-6">
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">On light</div>
            <div className="rounded-xl bg-white flex items-center gap-3 h-24 px-6">
              <Mark size={36} />
              <span className="font-bold tracking-[0.18em] text-slate-900" style={{ fontSize: 22 }}>
                MLAI
              </span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Clear space & min size</div>
            <div className="rounded-xl border border-dashed border-cyan-400/40 p-6 flex items-center justify-center">
              <div className="border border-dashed border-white/15 p-5">
                <div className="flex items-center gap-3">
                  <Mark size={32} />
                  <Wordmark size={20} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Keep clear space ≥ the height of the “M” on all sides. Minimum mark size: 24px digital, 8mm print.
            </p>
          </Card>
          <Card>
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Misuse — never</div>
            <div className="grid grid-cols-2 gap-3">
              {MISUSE.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg bg-black/30 border border-red-500/20 p-3 flex flex-col items-center gap-2 relative"
                >
                  <div className="absolute top-1.5 right-1.5 text-red-400">
                    <IX s={14} />
                  </div>
                  {m.el}
                  <span className="text-[10px] text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section n="02" kicker="Color" title="Palette">
        <div className="mb-8">
          <div className="text-sm font-semibold text-white mb-3">Signature gradient</div>
          <div className="h-16 rounded-2xl bg-linear-to-r from-cyan-300 via-blue-400 to-purple-400 border border-white/10" />
          <div className="text-xs text-slate-500 font-mono mt-2">linear-gradient(90deg, #67e8f9, #60a5fa, #c084fc)</div>
        </div>
        <div className="space-y-8">
          <div>
            <div className="text-sm font-semibold text-white mb-3">Core accents</div>
            <div className="grid grid-cols-3 gap-4">
              {CORE.map((s) => (
                <Swatch key={s.hex} {...s} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-3">Persona colors</div>
            <div className="grid grid-cols-3 gap-4">
              {PERSONA.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Emerald is reserved almost exclusively for Abbey, so she reads as the emotional heart.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-3">Support / state</div>
            <div className="grid grid-cols-3 gap-4">
              {SUPPORT.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-3">Neutrals</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {NEUTRAL.map((s) => (
                <Swatch key={s.hex} {...s} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section n="03" kicker="Type" title="Typography">
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {TYPE_CARDS.map((f, i) => (
            <Card key={f[0]}>
              <div
                className="text-3xl text-white mb-2"
                style={{
                  fontFamily: i === 0 ? "Outfit, sans-serif" : i === 1 ? "system-ui" : "JetBrains Mono, monospace",
                }}
              >
                Aa
              </div>
              <div className="text-sm font-semibold text-white">{f[0]}</div>
              <div className="text-xs text-cyan-400 font-mono mb-1">{f[1]}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{f[2]}</div>
            </Card>
          ))}
        </div>
        <Card>
          <div className="text-xs text-slate-500 mb-5 uppercase tracking-wider">Type scale</div>
          <div className="space-y-5">
            {TYPE.map((t) => (
              <div
                key={t.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 pb-5 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div className="sm:w-44 shrink-0">
                  <div className="text-xs text-slate-400">{t.label}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{t.spec}</div>
                </div>
                <div className="flex-1">{t.el}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section n="04" kicker="Voice" title="Voice & tone">
        <Card className="mb-6">
          <div className="text-sm font-semibold text-white mb-2">Brand register</div>
          <p className="text-slate-300 leading-relaxed text-sm">
            Terse, precise, and privacy-forward. We state what's true and useful without hype or hedging. Confident,
            not loud. Technical depth delivered with clarity. Default to <span className="text-cyan-300">Abi's</span>{" "}
            neutral register; shift toward Abbey or Aviva to match the audience.
          </p>
        </Card>
        <div className="grid md:grid-cols-3 gap-5">
          {VOICE.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.name} className={`glass p-5 border-l-4 ${borderLeftClass[v.c]}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${ramp[v.c]} flex items-center justify-center text-white`}>
                    <Icon s={20} />
                  </div>
                  <div>
                    <div className={`font-bold ${textClass[v.c]}`}>{v.name}</div>
                    <div className="text-xs text-slate-500">{v.role}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{v.desc}</p>
                <p className="text-slate-300 text-xs italic leading-relaxed border-t border-white/5 pt-3">{v.sample}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section n="05" kicker="Visual" title="Visual language">
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <Card>
            <div className="text-sm font-semibold text-white mb-1">Glassmorphism</div>
            <p className="text-xs text-slate-400 mb-4">
              Frosted panels on near-black:{" "}
              <span className="font-mono text-cyan-300/80">bg-white/[0.04] · border-white/10 · blur</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass h-20" />
              <div className="glass h-20" />
            </div>
          </Card>
          <div className="rounded-2xl border border-white/10 overflow-hidden relative h-37">
            <NetworkCanvas />
            <div className="absolute bottom-4 left-4">
              <div className="text-sm font-semibold text-white">Particle networks</div>
              <p className="text-xs text-slate-400">vectors, nodes, embedding space — the recurring motif</p>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 mb-5">
          {PRODUCT_ICONS.map((p) => {
            const Icon = p.i;
            return (
              <Card key={p.t}>
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${ramp[p.c]} flex items-center justify-center mb-3 text-white`}>
                  <Icon s={20} />
                </div>
                <div className="text-sm font-semibold text-white">{p.t}</div>
                <div className="text-xs text-slate-500">product icon lockup</div>
              </Card>
            );
          })}
        </div>
        <Card>
          <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider">UI elements</div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-5 py-2.5 rounded-full bg-white text-slate-950 text-sm font-semibold">Primary</button>
            <button className="px-5 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium">
              Secondary
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-300 border-cyan-500/25">
              badge
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
              success
            </span>
            <kbd className="text-xs px-2 py-1 rounded-lg border border-white/10 text-slate-400">⌘K</kbd>
            <span className="font-mono text-cyan-200 text-sm bg-black/30 rounded-lg px-3 py-1.5">295×</span>
          </div>
        </Card>
      </Section>

      <Section n="06" kicker="Principles" title="How we operate">
        <div className="grid md:grid-cols-3 gap-5">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.t} className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <Icon s={22} />
                  </div>
                  <span className="text-xs text-slate-500">{p.m}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{p.t}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.d}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <footer className="border-t border-white/10 px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Mark size={28} />
          <Wordmark size={18} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Machine Learning Advanced Innovations, Inc. · Brand Guidelines v1.0 · Disciplined Secrecy · Mission
          Stewardship · Operational Velocity
        </p>
      </footer>
    </div>
  );
}
