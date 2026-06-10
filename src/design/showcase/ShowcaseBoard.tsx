import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";

/* ──────────────────────────────────────────────────────────────────────────
   MLAI — Poster · Generative · OG Cards
   Self-contained showcase board. Converted from a standalone in-browser
   Babel prototype into a typed React 19 module.
   ────────────────────────────────────────────────────────────────────────── */

const PAGE_BACKGROUND =
  "radial-gradient(125% 85% at 50% -8%,#0c1730 0%,#06091a 44%,#02030a 100%)";

type ColorTuple = readonly [string, string];

const PALETTE: readonly ColorTuple[] = [
  ["Cyan", "#22d3ee"],
  ["Blue", "#60a5fa"],
  ["Violet", "#a855f7"],
  ["Emerald", "#34d399"],
  ["Amber", "#fbbf24"],
  ["Ink", "#020510"],
];

type PersonaTuple = readonly [string, string, string];

const PERSONAS: readonly PersonaTuple[] = [
  ["Abbey", "Empathic Polymath", "#34d399"],
  ["Aviva", "Unfiltered Expert", "#a855f7"],
  ["Abi", "Adaptive Moderator", "#22d3ee"],
];

const PRINCIPLES: readonly ColorTuple[] = [
  ["Disciplined Secrecy", "Apple-style"],
  ["Mission Stewardship", "Frontier-lab-style"],
  ["Operational Velocity", "NVIDIA-style"],
];

/* ── brand mark ── */
function Mark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="bg-linear-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <span
        className="text-white font-black"
        style={{ fontSize: size * 0.46, fontFamily: "Outfit" }}
      >
        M
      </span>
    </div>
  );
}

/* ── shared particle field (poster bg) ── */
type RGB = readonly [number, number, number];

interface FieldPoint {
  x: number;
  y: number;
  z: number;
  c: RGB;
}

function Field() {
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
    let pts: FieldPoint[] = [];
    let t = 0;

    const COLS: readonly RGB[] = [
      [34, 211, 238],
      [168, 85, 247],
      [52, 211, 153],
    ];

    const rs = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from(
        { length: Math.min(420, Math.floor((w * h) / 4200)) },
        (): FieldPoint => {
          const u = Math.random();
          const v = Math.random();
          const th = u * 6.28;
          const ph = Math.acos(2 * v - 1);
          const r = 0.55 + Math.random() * 0.45;
          const col = COLS[Math.floor(Math.random() * 3)]!;
          return {
            x: r * Math.sin(ph) * Math.cos(th),
            y: r * Math.cos(ph),
            z: r * Math.sin(ph) * Math.sin(th),
            c: col,
          };
        },
      );
    };

    rs();
    addEventListener("resize", rs);

    const tc = Math.cos(0.34);
    const ts = Math.sin(0.34);

    const d = () => {
      t += 1;
      const bg = ctx.createRadialGradient(
        w / 2,
        h * 0.45,
        0,
        w / 2,
        h * 0.45,
        Math.max(w, h) * 0.7,
      );
      bg.addColorStop(0, "#0a1224");
      bg.addColorStop(1, "#020510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const rot = t * 0.0016;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const cx = w / 2;
      const cy = h * 0.45;
      const S = Math.min(w, h) * 0.42;

      for (const p of pts) {
        const y1 = p.y * tc - p.z * ts;
        const z1 = p.y * ts + p.z * tc;
        const x2 = p.x * cr + z1 * sr;
        const z2 = -p.x * sr + z1 * cr;
        const pe = 1 / (2.4 - z2);
        const n = Math.max(0, Math.min(1, (pe - 0.29) / 0.42));
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${0.12 + n * 0.55})`;
        ctx.beginPath();
        ctx.arc(cx + x2 * pe * S, cy + y1 * pe * S, 0.6 + n * 1.6, 0, 6.3);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(d);
    };

    d();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ════ POSTER ════ */
function Poster() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="relative w-full" style={{ height: "min(86vh, 900px)" }}>
      <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10">
        <Field />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 75% at 50% 45%, transparent 30%, rgba(2,5,16,.6) 85%)",
          }}
        />
        <div className="relative h-full flex flex-col p-8 sm:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mark size={40} />
              <span className="font-bold tracking-[0.18em] text-white text-xl">
                MLAI
              </span>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <div>Brand board · v1.0</div>
              <div className="text-slate-600">
                Machine Learning Advanced Innovations
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">
              Privacy-first AI infrastructure
            </div>
            <h1
              className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.02]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Infrastructure for
              <br />
              <span
                className="gtext"
                style={{
                  backgroundImage: "linear-gradient(90deg,#67e8f9,#60a5fa,#c084fc)",
                }}
              >
                resilient intelligence
              </span>
            </h1>
            <div className="mt-8 flex gap-3 flex-wrap">
              {PERSONAS.map(([n, r, col]) => (
                <div
                  key={n}
                  className="glass rounded-2xl px-5 py-3 flex items-center gap-3"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: col, boxShadow: `0 0 10px ${col}` }}
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{n}</div>
                    <div className="text-[11px] text-slate-400">{r}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5 h-14">
              {PALETTE.map(([, hex]) => (
                <button
                  key={hex}
                  onMouseEnter={() => setHover(hex)}
                  onMouseLeave={() => setHover(null)}
                  className="flex-1 relative transition-all"
                  style={{ background: hex }}
                >
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-[10px] font-mono ${
                      ["#020510", "#a855f7"].includes(hex)
                        ? "text-white"
                        : "text-slate-900"
                    } ${hover === hex ? "opacity-100" : "opacity-0"}`}
                  >
                    {hex}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex gap-5">
                {PRINCIPLES.map(([title]) => (
                  <span key={title} className="text-slate-300">
                    {title}
                  </span>
                ))}
              </div>
              <div className="font-mono">
                Outfit · System sans · JetBrains Mono
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════ GENERATIVE STUDIO ════ */
const MODES = [
  "Flow field",
  "Embedding galaxy",
  "De Jong",
  "Phyllotaxis",
] as const;
type Mode = (typeof MODES)[number];

interface GenParams {
  count: number;
  speed: number;
  hue: number;
  trail: number;
}

type GenParamKey = keyof GenParams;

interface FlowPoint {
  x: number;
  y: number;
}

interface GalaxyPoint {
  x: number;
  y: number;
  z: number;
}

function Generative() {
  const [mode, setMode] = useState<Mode>("Flow field");
  const [p, setP] = useState<GenParams>({
    count: 50,
    speed: 50,
    hue: 190,
    trail: 50,
  });
  const pr = useRef<GenParams>(p);
  pr.current = p;
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
    let t = 0;
    let flow: FlowPoint[] = [];
    let galaxy: GalaxyPoint[] = [];
    let x = 0;
    let y = 0;

    const rs = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#020510";
      ctx.fillRect(0, 0, w, h);
      const num = Math.floor(120 + pr.current.count * 12);
      if (mode === "Flow field") {
        flow = Array.from(
          { length: num },
          (): FlowPoint => ({ x: Math.random() * w, y: Math.random() * h }),
        );
      } else if (mode === "Embedding galaxy") {
        galaxy = Array.from({ length: num }, (): GalaxyPoint => {
          const u = Math.random();
          const v = Math.random();
          const th = u * 6.28;
          const ph = Math.acos(2 * v - 1);
          const r = 0.6 + Math.random() * 0.4;
          return {
            x: r * Math.sin(ph) * Math.cos(th),
            y: r * Math.cos(ph),
            z: r * Math.sin(ph) * Math.sin(th),
          };
        });
      }
    };

    rs();
    addEventListener("resize", rs);

    const ang = (px: number, py: number, tt: number): number =>
      (Math.sin(px * 0.008 + tt) +
        Math.cos(py * 0.008 - tt * 0.7) +
        Math.sin((px + py) * 0.004)) *
      1.7;

    const d = () => {
      const { speed, hue, trail } = pr.current;
      const sp = speed / 50;
      const tr = trail / 100;
      t += 0.004 * sp;
      ctx.fillStyle = `rgba(2,5,16,${0.02 + (1 - tr) * 0.5})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (mode === "Flow field") {
        for (const q of flow) {
          const a = ang(q.x, q.y, t);
          const nx = q.x + Math.cos(a) * 1.6 * sp;
          const ny = q.y + Math.sin(a) * 1.6 * sp;
          ctx.strokeStyle = `hsla(${(hue + q.x * 0.05) % 360},85%,65%,0.5)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          q.x = nx;
          q.y = ny;
          if (q.x < 0 || q.x > w || q.y < 0 || q.y > h) {
            q.x = Math.random() * w;
            q.y = Math.random() * h;
          }
        }
      } else if (mode === "Embedding galaxy") {
        const rot = t * 2;
        const cr = Math.cos(rot);
        const sr = Math.sin(rot);
        const cx = w / 2;
        const cy = h / 2;
        const S = Math.min(w, h) * 0.4;
        const tc = Math.cos(0.4);
        const ts = Math.sin(0.4);
        for (const q of galaxy) {
          const y1 = q.y * tc - q.z * ts;
          const z1 = q.y * ts + q.z * tc;
          const x2 = q.x * cr + z1 * sr;
          const z2 = -q.x * sr + z1 * cr;
          const pe = 1 / (1.9 - z2);
          const n = Math.max(0, Math.min(1, (pe - 0.34) / 0.4));
          ctx.fillStyle = `hsla(${(hue + n * 80) % 360},85%,65%,${0.2 + n * 0.6})`;
          ctx.beginPath();
          ctx.arc(cx + x2 * pe * S, cy + y1 * pe * S, 0.6 + n * 2.4, 0, 6.3);
          ctx.fill();
        }
      } else if (mode === "De Jong") {
        const a = 2.4 + Math.sin(t) * 0.6;
        const b = -2.3 + Math.cos(t * 0.8) * 0.5;
        const cc = 1.7 + Math.sin(t * 0.5) * 0.4;
        const dd = -2.1 + Math.cos(t * 0.3) * 0.4;
        const cx = w / 2;
        const cy = h / 2;
        const S = Math.min(w, h) / 4.4;
        for (let i = 0; i < 4200; i++) {
          const nx = Math.sin(a * y) - Math.cos(b * x);
          const ny = Math.sin(cc * x) - Math.cos(dd * y);
          x = nx;
          y = ny;
          ctx.fillStyle = `hsla(${(hue + (i / 4200) * 120) % 360},90%,66%,0.5)`;
          ctx.fillRect(cx + x * S, cy + y * S, 1, 1);
        }
      } else {
        const cx = w / 2;
        const cy = h / 2;
        const ga = Math.PI * (3 - Math.sqrt(5));
        const num = Math.floor(400 + pr.current.count * 20);
        const start = Math.max(0, (Math.floor(t * 120) % num) - 80);
        const end = Math.floor(t * 120) % num;
        for (let i = start; i < end; i++) {
          const ai = i * ga + t * 0.4;
          const r = 5 * Math.sqrt(i);
          ctx.fillStyle = `hsla(${(hue + i * 0.5) % 360},85%,65%,0.9)`;
          ctx.beginPath();
          ctx.arc(cx + r * Math.cos(ai), cy + r * Math.sin(ai), 2.4, 0, 6.3);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(d);
    };

    d();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, p.count]);

  const Slider = ({
    k,
    label,
    min,
    max,
  }: {
    k: GenParamKey;
    label: string;
    min: number;
    max: number;
  }) => (
    <label className="block mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-400 font-mono">{p[k]}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={p[k]}
        onChange={(e) =>
          setP((s) => ({ ...s, [k]: +e.target.value }))
        }
        className="w-full"
      />
    </label>
  );

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-white/10"
      style={{ height: "min(82vh, 820px)" }}
    >
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-5 left-5 glass rounded-2xl p-5 w-64">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
          Generative studio
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-[11px] px-2 py-1.5 rounded-lg border transition-colors ${
                mode === m
                  ? "bg-white/10 text-white border-white/20"
                  : "text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <Slider k="count" label="Count" min={1} max={100} />
        <Slider k="speed" label="Speed" min={5} max={150} />
        <Slider k="hue" label="Hue" min={0} max={360} />
        <Slider k="trail" label="Trail" min={0} max={100} />
        <button
          onClick={() =>
            setP({
              count: 5 + Math.floor(Math.random() * 95),
              speed: 10 + Math.floor(Math.random() * 130),
              hue: Math.floor(Math.random() * 360),
              trail: Math.floor(Math.random() * 100),
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold"
        >
          ⤬ Shuffle
        </button>
      </div>
    </div>
  );
}

/* ════ OG CARDS ════ */
interface OGVariant {
  accent: string;
  kicker: string;
  title: string;
  sub: string;
}

const OG_VARIANTS: Record<string, OGVariant> = {
  Hero: {
    accent: "#22d3ee",
    kicker: "PRIVACY-FIRST AI INFRASTRUCTURE",
    title: "Infrastructure for resilient intelligence",
    sub: "WDBX · ABI · Abbey — fast by design, private by default.",
  },
  "Product · WDBX": {
    accent: "#60a5fa",
    kicker: "WDBX VECTOR RUNTIME",
    title: "Memory you can verify",
    sub: "HNSW search, SHA-256 chained history, lock-free MVCC — in Zig.",
  },
  Abbey: {
    accent: "#34d399",
    kicker: "ABBEY · EMPATHIC POLYMATH",
    title: "Turns apprehension into fascination",
    sub: "Technical mastery with emotional intelligence.",
  },
};

function OGCard() {
  const [v, setV] = useState<string>("Hero");
  const d = OG_VARIANTS[v] ?? OG_VARIANTS["Hero"]!;

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {Object.keys(OG_VARIANTS).map((k) => (
          <button
            key={k}
            onClick={() => setV(k)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              v === k
                ? "bg-white/10 text-white border-white/20"
                : "text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="mx-auto" style={{ width: "100%", maxWidth: 1200 }}>
        <div
          style={{ aspectRatio: "1200 / 630", width: "100%" }}
          className="relative rounded-2xl overflow-hidden border border-white/10"
        >
          <Field />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 90% at 80% 20%, ${d.accent}22, transparent 60%), linear-gradient(180deg, rgba(2,5,16,.4), rgba(2,5,16,.85))`,
            }}
          />
          <div className="relative h-full flex flex-col justify-between p-[5%]">
            <div className="flex items-center gap-3">
              <Mark size={48} />
              <span className="font-bold tracking-[0.18em] text-white text-2xl">
                MLAI
              </span>
            </div>
            <div>
              <div
                className="text-sm font-bold uppercase tracking-[0.25em] mb-3"
                style={{ color: d.accent }}
              >
                {d.kicker}
              </div>
              <div
                className="font-bold text-white leading-[1.05]"
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "clamp(28px, 5.2vw, 64px)",
                }}
              >
                {d.title}
              </div>
              <div
                className="mt-4 text-slate-300"
                style={{ fontSize: "clamp(13px, 1.8vw, 22px)" }}
              >
                {d.sub}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>mlai.dev</span>
              <span className="flex gap-3">
                {PERSONAS.map(([n, , col]) => (
                  <span key={n} style={{ color: col }}>
                    ●
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4 text-center">
        True 1200×630 ratio. Export: screenshot the card region, or open the
        standalone card and use a browser screenshot to PNG. (I can wire an
        html-to-image download button on request.)
      </p>
    </div>
  );
}

/* ── shell ── */
const TABS = ["Poster", "Generative", "OG Cards"] as const;
type Tab = (typeof TABS)[number];

const BOARD_STYLES = `
.showcase-board { color: #fff; font-family: system-ui, sans-serif; }
.showcase-board .gtext { background-clip: text; -webkit-background-clip: text; color: transparent; }
.showcase-board ::-webkit-scrollbar { width: 9px; }
.showcase-board ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 6px; }
.showcase-board input[type=range] { accent-color: #22d3ee; }
`;

export default function ShowcaseBoard(): ReactNode {
  const [tab, setTab] = useState<Tab>("Poster");

  const rootStyle: CSSProperties = {
    minHeight: "100vh",
    background: PAGE_BACKGROUND,
  };

  return (
    <div className="showcase-board text-white" style={rootStyle}>
      <style>{BOARD_STYLES}</style>
      <header className="sticky top-0 z-30 bg-[#020510]/85 backdrop-blur border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mark size={30} />
          <span className="font-bold tracking-widest text-white text-sm">
            MLAI
          </span>
          <span className="text-slate-600 text-xs hidden sm:inline">
            · design extras
          </span>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                tab === t
                  ? "bg-white/10 text-white border-white/20"
                  : "text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "Poster" && <Poster />}
        {tab === "Generative" && <Generative />}
        {tab === "OG Cards" && <OGCard />}
      </main>
    </div>
  );
}
