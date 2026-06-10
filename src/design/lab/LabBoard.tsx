/* ════════════════════════════════════════════════════════════════
   MLAI — Design & Algorithmic Lab
   Self-contained, default-exported board. Reproduces the standalone
   in-browser Babel prototype (mlai-lab.html) as a typed React 19
   module: a live WDBX telemetry panel plus a gallery of generative
   canvases, all driven by a page-wide palette switcher.

   Board-specific CSS (page background, gradient-text helper, keyframes,
   scrollbar) is inlined via a module-scoped <style> under the unique
   `.lab-board` wrapper so it can't collide with the host app globals.
   `.glass` and the spectrum gradient already live in src/index.css.
   ════════════════════════════════════════════════════════════════ */
import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from "react";

/* ─────────────── icons (inline) ─────────────── */
type IcoProps = { d: ReactNode; s?: number };
function Ico({ d, s = 16 }: IcoProps): ReactNode {
  return (
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
}
type GlyphProps = { s?: number };
const IPalette = (p: GlyphProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <circle cx="13.5" cy="6.5" r="1.5" />
        <circle cx="17.5" cy="10.5" r="1.5" />
        <circle cx="8.5" cy="7.5" r="1.5" />
        <circle cx="6.5" cy="12.5" r="1.5" />
        <path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-12-10Z" />
      </>
    }
  />
);
const ISearch = (p: GlyphProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    }
  />
);
const ICheck = (p: GlyphProps): ReactNode => (
  <Ico {...p} d={<path d="M20 6 9 17l-5-5" />} />
);
const IChevron = (p: GlyphProps): ReactNode => (
  <Ico {...p} d={<path d="m9 18 6-6-6-6" />} />
);

/* ─────────────── theme ─────────────── */
type ThemeKey = "aurora" | "violet" | "emerald" | "sunset" | "mono";
type ThemeDef = { label: string; filter: string; dot: string };

const THEMES: Record<ThemeKey, ThemeDef> = {
  aurora: { label: "Aurora", filter: "none", dot: "#22d3ee" },
  violet: { label: "Violet", filter: "hue-rotate(45deg)", dot: "#818cf8" },
  emerald: { label: "Emerald", filter: "hue-rotate(150deg) saturate(1.05)", dot: "#34d399" },
  sunset: { label: "Sunset", filter: "hue-rotate(200deg) saturate(1.15)", dot: "#fb7185" },
  mono: { label: "Mono", filter: "saturate(0.2) brightness(1.04)", dot: "#cbd5e1" },
};

type ThemeContextValue = { theme: ThemeKey; setTheme: (t: ThemeKey) => void };
const ThemeCtx = createContext<ThemeContextValue>({ theme: "aurora", setTheme: () => {} });

function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const [theme, setTheme] = useState<ThemeKey>("aurora");
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const f = THEMES[theme].filter;
    root.style.filter = f === "none" ? "" : f;
  }, [theme]);
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <div ref={rootRef} style={{ transition: "filter .5s ease" }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

function ThemePicker(): ReactNode {
  const { theme, setTheme } = useContext(ThemeCtx);
  const [open, setOpen] = useState(false);
  const entries = Object.entries(THEMES) as [ThemeKey, ThemeDef][];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
      >
        <IPalette s={15} />
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
          style={{ background: THEMES[theme].dot }}
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/15 bg-slate-900 shadow-2xl p-1.5 z-80">
          {entries.map(([k, t]) => (
            <button
              key={k}
              onClick={() => {
                setTheme(k);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                theme === k ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full ring-1 ring-white/20"
                style={{ background: t.dot }}
              />
              {t.label}
              {theme === k && (
                <span className="ml-auto text-cyan-400">
                  <ICheck s={13} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── nav + command palette ─────────────── */
type NavItem = readonly [label: string, href: string];
const NAV: readonly NavItem[] = [
  ["Home", "#"],
  ["WDBX", "#"],
  ["ABI", "#"],
  ["Abbey", "#"],
  ["Technology", "#"],
  ["Principles", "#"],
  ["Investors", "#"],
  ["Lab", "#lab"],
];

function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}): ReactNode {
  const [q, setQ] = useState("");
  const filtered = NAV.filter((n) => n[0].toLowerCase().includes(q.toLowerCase()));
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [open, setOpen]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-28 px-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-slate-500">
            <ISearch s={16} />
          </span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a page…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
          />
          <kbd className="text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.map((n, i) => (
            <a
              key={i}
              href={n[1]}
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <span className="flex items-center gap-2.5 text-cyan-400">
                <IChevron s={14} />
                <span className="text-slate-300">{n[0]}</span>
              </span>
              <span className="text-xs text-slate-600">{n[1]}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Nav(): ReactNode {
  const [cmd, setCmd] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-bold tracking-widest text-white">MLAI</span>
        </a>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n, i) => (
            <a
              key={i}
              href={n[1]}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                n[0] === "Lab"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {n[0]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemePicker />
          <button
            onClick={() => setCmd(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs transition-colors"
          >
            <ISearch s={14} />
            <kbd>⌘K</kbd>
          </button>
        </div>
      </div>
      <CommandPalette open={cmd} setOpen={setCmd} />
    </header>
  );
}

/* ════ WDBX TELEMETRY DASHBOARD (simulated / illustrative) ════ */
type ArcGaugeProps = {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  decimals?: number;
};
function ArcGauge({ label, value, max, unit, color, decimals = 0 }: ArcGaugeProps): ReactNode {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = Math.PI * r * 1.5; // 270° arc
  const pct = Math.min(1, value / max);
  const startX = cx - r * Math.cos(Math.PI / 4);
  const startY = cy + r * Math.sin(Math.PI / 4);
  const endX = cx + r * Math.cos(Math.PI / 4);
  const endY = cy + r * Math.sin(Math.PI / 4);
  const arc = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;
  return (
    <div className="glass p-4 flex flex-col items-center">
      <svg width="140" height="120" viewBox="0 0 140 120">
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dashoffset .6s ease",
          }}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="#fff"
          style={{ font: "700 26px JetBrains Mono, monospace" }}
        >
          {value.toFixed(decimals)}
        </text>
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          fill="#64748b"
          style={{ font: "400 11px JetBrains Mono, monospace" }}
        >
          {unit}
        </text>
      </svg>
      <div className="text-slate-300 text-xs font-semibold mt-1">{label}</div>
    </div>
  );
}

type SparklineProps = { data: number[]; color: string; label: string; unit: string };
function Sparkline({ data, color, label, unit }: SparklineProps): ReactNode {
  const w = 300;
  const h = 70;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const pts = data
    .map(
      (v, i) =>
        `${(i / Math.max(1, data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 8) - 4}`,
    )
    .join(" ");
  const last = data[data.length - 1] ?? 0;
  return (
    <div className="glass p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-slate-400 text-xs font-medium">{label}</span>
        <span className="font-mono text-sm" style={{ color }}>
          {last.toFixed(1)}
          <span className="text-slate-600 text-xs"> {unit}</span>
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.08" />
      </svg>
    </div>
  );
}

type ShardStatus = "ok" | "warn" | "down";
type Gauges = { thru: number; p99: number; recall: number; mem: number };

function WDBXDashboard(): ReactNode {
  const [g, setG] = useState<Gauges>({ thru: 78, p99: 9.4, recall: 94.6, mem: 1.48 });
  const [thruHist, setThruHist] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => 76 + Math.random() * 8),
  );
  const [latHist, setLatHist] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => 8 + Math.random() * 3),
  );
  const [shards, setShards] = useState<ShardStatus[]>(() =>
    Array.from({ length: 12 }, () => "ok" as ShardStatus),
  );
  useEffect(() => {
    const iv = setInterval(() => {
      setG((p) => ({
        thru: Math.max(60, Math.min(96, p.thru + (Math.random() - 0.5) * 7)),
        p99: Math.max(6, Math.min(16, p.p99 + (Math.random() - 0.5) * 1.6)),
        recall: Math.max(91, Math.min(97, p.recall + (Math.random() - 0.5) * 0.8)),
        mem: Math.max(1.2, Math.min(1.9, p.mem + (Math.random() - 0.5) * 0.08)),
      }));
      setThruHist((h) => [...h.slice(1), 70 + Math.random() * 22]);
      setLatHist((h) => [...h.slice(1), 7 + Math.random() * 6]);
      setShards((s) =>
        s.map(() => {
          const rnd = Math.random();
          return rnd > 0.97 ? "warn" : rnd > 0.995 ? "down" : "ok";
        }),
      );
    }, 900);
    return () => clearInterval(iv);
  }, []);
  const shardColor: Record<ShardStatus, string> = {
    ok: "#34d399",
    warn: "#fbbf24",
    down: "#f87171",
  };
  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-mono text-sm text-white">wdbx-prod-01</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300 bg-amber-500/10">
            SIMULATED · ILLUSTRATIVE
          </span>
        </div>
        <span className="font-mono text-xs text-slate-500">live · 900ms tick</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ArcGauge label="Throughput" value={g.thru} max={100} unit="req/s" color="#22d3ee" />
        <ArcGauge label="p99 latency" value={g.p99} max={20} unit="ms" color="#a855f7" decimals={1} />
        <ArcGauge label="Recall@10" value={g.recall} max={100} unit="%" color="#34d399" decimals={1} />
        <ArcGauge label="Memory" value={g.mem} max={2} unit="GB" color="#fbbf24" decimals={2} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Sparkline data={thruHist} color="#22d3ee" label="throughput stream" unit="req/s" />
        <Sparkline data={latHist} color="#a855f7" label="latency stream" unit="ms" />
      </div>
      <div>
        <div className="text-slate-400 text-xs font-medium mb-2">shard health · 12 nodes</div>
        <div className="flex gap-1.5 flex-wrap">
          {shards.map((s, i) => (
            <div
              key={i}
              title={`shard-${i} · ${s}`}
              className="flex-1 min-w-5 h-7 rounded-md transition-colors"
              style={{
                background: shardColor[s] + "33",
                border: `1px solid ${shardColor[s]}`,
                boxShadow: s !== "ok" ? `0 0 10px ${shardColor[s]}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════ ALGORITHMIC ART CANVASES ════ */
type CanvasState = Record<string, unknown>;
type CanvasDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  state: CanvasState,
) => void;

function useCanvas(draw: CanvasDraw) {
  const ref = useRef<HTMLCanvasElement>(null);
  // The draw fn is captured once on mount (matching the original prototype's
  // empty-deps effect); keep the latest in a ref so it stays referentially safe.
  const drawRef = useRef(draw);
  drawRef.current = draw;
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
    const state: CanvasState = {};
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.init = false;
    };
    resize();
    addEventListener("resize", resize);
    const loop = () => {
      t += 1;
      drawRef.current(ctx, w, h, t, state);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);
  return ref;
}

const Phyllotaxis = (): ReactNode => {
  const ref = useCanvas((ctx, w, h, t) => {
    ctx.fillStyle = "rgba(2,6,23,0.12)";
    ctx.fillRect(0, 0, w, h);
    const n = 1 + ((t * 2) % 900);
    const cx = w / 2;
    const cy = h / 2;
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = Math.max(0, n - 60); i < n; i++) {
      const a = i * ga + t * 0.004;
      const r = 4.2 * Math.sqrt(i);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      ctx.fillStyle = `hsla(${(i * 0.6 + t) % 360},85%,65%,0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, 7);
      ctx.fill();
    }
  });
  return <canvas ref={ref} className="w-full h-full" />;
};

type HarmonographState = CanvasState & { init?: boolean; p?: number[]; ph?: number[] };
const Harmonograph = (): ReactNode => {
  const ref = useCanvas((ctx, w, h, t, rawState) => {
    const s = rawState as HarmonographState;
    if (!s.init) {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);
      s.init = true;
      s.p = [1.001, 2.002, 3.003, 2.001].map((x) => x + Math.random() * 0.004);
      s.ph = [0, 1.2, 2.4, 0.6];
    }
    const p = s.p ?? [1, 2, 3, 2];
    const ph = s.ph ?? [0, 0, 0, 0];
    const [p0, p1, p2, p3] = [p[0] ?? 1, p[1] ?? 2, p[2] ?? 3, p[3] ?? 2];
    const [ph0, ph1, ph2, ph3] = [ph[0] ?? 0, ph[1] ?? 0, ph[2] ?? 0, ph[3] ?? 0];
    ctx.fillStyle = "rgba(2,6,23,0.03)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const A = Math.min(w, h) / 4.4;
    const d = 0.0009;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 380; i++) {
      const tt = t * 0.01 + i * 0.05;
      const decay = Math.exp(-d * tt * 60);
      const x =
        cx + A * Math.sin(tt * p0 + ph0) * decay + A * Math.sin(tt * p2 + ph2) * decay;
      const y =
        cy + A * Math.sin(tt * p1 + ph1) * decay + A * Math.sin(tt * p3 + ph3) * decay;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = `hsla(${180 + ((t * 0.4) % 120)},85%,65%,0.5)`;
    ctx.stroke();
  });
  return <canvas ref={ref} className="w-full h-full" />;
};

type LifeState = CanvasState & {
  init?: boolean;
  cols?: number;
  rows?: number;
  grid?: number[][];
  tick?: number;
  pop?: number;
  stale?: number;
};
const Life = (): ReactNode => {
  const ref = useCanvas((ctx, w, h, t, rawState) => {
    const s = rawState as LifeState;
    const cell = 9;
    const cols = Math.floor(w / cell);
    const rows = Math.floor(h / cell);
    if (!s.init || s.cols !== cols) {
      s.init = true;
      s.cols = cols;
      s.rows = rows;
      s.grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() > 0.78 ? 1 : 0)),
      );
      s.tick = 0;
      s.pop = 0;
      s.stale = 0;
    }
    if (t % 7 !== 0) return;
    const g = s.grid ?? [];
    const ng = g.map((r) => r.slice());
    let pop = 0;
    for (let y = 0; y < rows; y++) {
      const ngRow = ng[y];
      const gRow = g[y];
      if (!ngRow || !gRow) continue;
      for (let x = 0; x < cols; x++) {
        let nb = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const ny = (y + dy + rows) % rows;
            const nx = (x + dx + cols) % cols;
            nb += g[ny]?.[nx] ?? 0;
          }
        }
        const alive = gRow[x] ?? 0;
        const next = alive ? (nb === 2 || nb === 3 ? 1 : 0) : nb === 3 ? 1 : 0;
        ngRow[x] = next;
        pop += next;
      }
    }
    s.grid = ng;
    if (Math.abs(pop - (s.pop ?? 0)) < 3) s.stale = (s.stale ?? 0) + 1;
    else s.stale = 0;
    s.pop = pop;
    if ((s.stale ?? 0) > 18 || pop < cols) {
      s.grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() > 0.78 ? 1 : 0)),
      );
      s.stale = 0;
    }
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);
    const grid = s.grid;
    for (let y = 0; y < rows; y++) {
      const row = grid[y];
      if (!row) continue;
      for (let x = 0; x < cols; x++) {
        if (row[x]) {
          ctx.fillStyle = `hsla(${(x * 2 + y * 2 + t * 0.5) % 360},80%,62%,0.9)`;
          ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
        }
      }
    }
  });
  return <canvas ref={ref} className="w-full h-full" />;
};

const Tesseract = (): ReactNode => {
  const ref = useCanvas((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const verts: number[][] = [];
    for (let i = 0; i < 16; i++) {
      verts.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
    }
    const a = t * 0.01;
    const b = t * 0.007;
    const rot = (p: number[]): [number, number] => {
      let x = p[0] ?? 0;
      let y = p[1] ?? 0;
      let z = p[2] ?? 0;
      let ww = p[3] ?? 0;
      let c = Math.cos(a);
      let s = Math.sin(a);
      [x, ww] = [x * c - ww * s, x * s + ww * c];
      c = Math.cos(b);
      s = Math.sin(b);
      [y, z] = [y * c - z * s, y * s + z * c];
      const k = 2 / (3 - ww);
      x *= k;
      y *= k;
      z *= k;
      const k2 = 2.6 / (3.4 - z);
      return [
        w / 2 + x * Math.min(w, h) * 0.18 * k2,
        h / 2 + y * Math.min(w, h) * 0.18 * k2,
      ];
    };
    const pr = verts.map(rot);
    ctx.strokeStyle = "rgba(34,211,238,0.55)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        let bit = i ^ j;
        while (bit) {
          diff += bit & 1;
          bit >>= 1;
        }
        if (diff === 1) {
          const pi = pr[i];
          const pj = pr[j];
          if (!pi || !pj) continue;
          ctx.beginPath();
          ctx.moveTo(pi[0], pi[1]);
          ctx.lineTo(pj[0], pj[1]);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "#c084fc";
    pr.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.4, 0, 7);
      ctx.fill();
    });
  });
  return <canvas ref={ref} className="w-full h-full" />;
};

type NetNode = { x: number; y: number; vx: number; vy: number };
type NetworkState = CanvasState & { init?: boolean; nodes?: NetNode[] };
const NetworkCanvas = (): ReactNode => {
  const ref = useCanvas((ctx, w, h, _t, rawState) => {
    const s = rawState as NetworkState;
    if (!s.init) {
      s.init = true;
      s.nodes = Array.from(
        { length: Math.min(60, Math.floor((w * h) / 18000)) },
        () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        }),
      );
    }
    ctx.clearRect(0, 0, w, h);
    const n = s.nodes ?? [];
    for (let i = 0; i < n.length; i++) {
      const a = n[i];
      if (!a) continue;
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
      for (let j = i + 1; j < n.length; j++) {
        const bnode = n[j];
        if (!bnode) continue;
        const dx = a.x - bnode.x;
        const dy = a.y - bnode.y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.strokeStyle = `rgba(34,211,238,${0.14 * (1 - d / 130)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bnode.x, bnode.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(34,211,238,.5)";
    for (const p of n) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.7, 0, 7);
      ctx.fill();
    }
  });
  return <canvas ref={ref} className="w-full h-full" />;
};

const Badge = ({ children }: { children: ReactNode }): ReactNode => (
  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-300 border-cyan-500/25">
    {children}
  </span>
);

type LabCardProps = { title: string; tag?: string; desc: string; children: ReactNode };
function LabCard({ title, tag, desc, children }: LabCardProps): ReactNode {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden flex flex-col hover:border-white/20 transition-colors">
      <div className="relative h-48 flex items-center justify-center overflow-hidden border-b border-white/10 bg-slate-950/50">
        {children}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="text-white font-semibold text-sm">{title}</h4>
          {tag && <Badge>{tag}</Badge>}
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─────────────── board-specific CSS (scoped under .lab-board) ───────────────
   Only what is NOT already in src/index.css: gradient-text helper, the
   board's two keyframes, and scoped scrollbar styling. `.glass` and the
   spectrum gradient already live in the host stylesheet. The page background
   is applied as an inline style on the root div. */
const LAB_CSS = `
.lab-board { min-height: 100vh; color: #fff; }
.lab-board .gtext {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(90deg,#67e8f9,#60a5fa,#c084fc);
}
.lab-board ::-webkit-scrollbar { width: 9px; }
.lab-board ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 6px; }
@keyframes labbars { 0%,100% { height: 8px; } 50% { height: 34px; } }
@keyframes marqueeX { to { transform: translateX(-50%); } }
`;

const PAGE_BG: CSSProperties = {
  background:
    "radial-gradient(125% 85% at 50% -8%, #0a1530 0%, #05091c 44%, #01030c 100%)",
};

const EQUALIZER_BARS = [0, 1, 2, 3, 4, 5] as const;

function Lab(): ReactNode {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <div
        id="lab"
        className="relative px-6 sm:px-10 pt-14 pb-8 overflow-hidden border-b border-white/10"
      >
        <div className="absolute inset-0 opacity-40">
          <NetworkCanvas />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-slate-300 mb-4">
            <span className="text-purple-400">
              <IPalette s={14} />
            </span>{" "}
            Telemetry + algorithmic art
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Design & Animation Lab
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl">
            A live WDBX telemetry panel and a gallery of generative canvases — every
            tile is real, running code. Recolor the whole page from the palette switcher
            in the nav.
          </p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-5">
          WDBX telemetry
        </h3>
        <WDBXDashboard />
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-16">
        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-5">
          Algorithmic art
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <LabCard
            title="Phyllotaxis"
            tag="golden angle"
            desc="Florets placed at the golden angle (137.5°) — nature's optimal packing, drifting over time."
          >
            <Phyllotaxis />
          </LabCard>
          <LabCard
            title="Harmonograph"
            tag="damped sine"
            desc="Four decaying pendulums trace Lissajous-like figures that slowly settle."
          >
            <Harmonograph />
          </LabCard>
          <LabCard
            title="Game of Life"
            tag="cellular automata"
            desc="Conway's rules on a toroidal grid — self-reseeds when the population stalls."
          >
            <Life />
          </LabCard>
          <LabCard
            title="Tesseract"
            tag="4D projection"
            desc="A hypercube rotating in the XW and YZ planes, projected 4D → 3D → 2D."
          >
            <Tesseract />
          </LabCard>
          <LabCard
            title="Particle network"
            tag="proximity graph"
            desc="Drifting nodes connect within a radius — the signature MLAI background."
          >
            <NetworkCanvas />
          </LabCard>
          <LabCard title="Equalizer" tag="CSS" desc="Pure-CSS keyframe bars with staggered delays.">
            <div className="flex items-end gap-1.5 h-16">
              {EQUALIZER_BARS.map((i) => (
                <span
                  key={i}
                  className="w-2.5 rounded-full bg-linear-to-t from-cyan-600 to-purple-400"
                  style={{ height: 8, animation: `labbars 1s ease-in-out ${i * 0.12}s infinite` }}
                />
              ))}
            </div>
          </LabCard>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 sm:px-10 py-10 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span>© {year} Machine Learning Advanced Innovations, Inc.</span>
          <span>
            Dashboard figures are simulated for demonstration — not benchmark claims.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function LabBoard(): ReactNode {
  return (
    <div className="lab-board" style={PAGE_BG}>
      <style>{LAB_CSS}</style>
      <ThemeProvider>
        <Lab />
      </ThemeProvider>
    </div>
  );
}
