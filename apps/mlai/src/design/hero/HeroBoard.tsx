/* ════════════════════════════════════════════════════════════════
   MLAI — Home Hero
   Self-contained, default-exported board. Reproduces the standalone
   in-browser Babel prototype (mlai-hero.html) as a typed React 19
   module: a canvas-driven persona-constellation hero with a memory
   ribbon, persona legend, and a live Tweaks panel.

   Board-specific CSS (page background, keyframes, ::selection) is
   inlined via a module-scoped <style> under the unique `.hero-board`
   wrapper so it can't collide with the host app globals. The shared
   Tweaks shell lives in ../board/shell/TweaksPanel.tsx.
   ════════════════════════════════════════════════════════════════ */
import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  TweaksPanel,
  TweakSection,
  TweakText,
  TweakSlider,
  TweakToggle,
  TweakColor,
  useTweaks,
} from "../board/shell/TweaksPanel.tsx";

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
const ILock = (p: GlyphProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    }
  />
);
const IArrow = (p: GlyphProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    }
  />
);
const IEye = (p: GlyphProps): ReactNode => (
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
const IEyeOff = (p: GlyphProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="m15 18-.722-3.25" />
        <path d="M2 8a10.645 10.645 0 0 0 20 0" />
        <path d="m20 15-1.726-2.05" />
        <path d="m4 15 1.726-2.05" />
        <path d="m9 18 .722-3.25" />
      </>
    }
  />
);

/* ─────────────── helpers ─────────────── */
type RGB = readonly [number, number, number];
const hexRGB = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const PERIOD_BASE = 8000;

type Point = { x: number; y: number; z: number; ci: number };

// three persona clusters: bias each point toward a colored lobe for visible grouping
function sphere(n: number, clustered: boolean): Point[] {
  return Array.from({ length: n }, (): Point => {
    const ci = Math.floor(Math.random() * 3);
    const u = Math.random();
    const v = Math.random();
    const th = u * Math.PI * 2;
    const ph = Math.acos(2 * v - 1);
    const r = 0.55 + Math.random() * 0.45;
    let x = r * Math.sin(ph) * Math.cos(th);
    let y = r * Math.cos(ph);
    let z = r * Math.sin(ph) * Math.sin(th);
    if (clustered) {
      const lobes: readonly RGB[] = [
        [0.62, 0.2, 0],
        [-0.4, 0.45, 0.4],
        [-0.2, -0.55, -0.45],
      ];
      const L = lobes[ci]!;
      const b = 0.42;
      x = x * (1 - b) + L[0] * b;
      y = y * (1 - b) + L[1] * b;
      z = z * (1 - b) + L[2] * b;
    }
    return { x, y, z, ci };
  });
}

/* ─────────────── tweak state ─────────────── */
// A `type` (not `interface`) so it carries an implicit string index signature and
// satisfies useTweaks<T extends Record<string, unknown>>.
type TweakState = {
  headline: string;
  accent: string;
  abbey: string;
  aviva: string;
  abi: string;
  speed: number;
  density: number;
  glow: number;
  parallax: boolean;
  chain: boolean;
  personas: boolean;
  content: boolean;
  proof?: string;
};

const TWEAK_DEFAULTS: TweakState = {
  headline: "private, high-performance AI",
  accent: "#22d3ee",
  abbey: "#4ade80",
  aviva: "#a855f7",
  abi: "#22d3ee",
  speed: 2.3,
  density: 2,
  glow: 1.2,
  parallax: true,
  chain: true,
  personas: true,
  content: true,
};

/* ─────────────── canvas ─────────────── */
type Projected = { px: number; py: number; n: number };
type Dust = { x: number; y: number; r: number; p: number; vy: number };

function HeroCanvas({ tweaks }: { tweaks: TweakState }): ReactNode {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef<TweakState>(tweaks);
  tRef.current = tweaks;
  const ptr = useRef<{ tx: number; ty: number; x: number; y: number }>({
    tx: 0,
    ty: 0,
    x: 0,
    y: 0,
  });

  // pointer parallax target
  useEffect(() => {
    const onMove = (e: PointerEvent): void => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      ptr.current.tx = nx;
      ptr.current.ty = ny;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cloud: Point[] = [];
    let lat: Point[] = [];
    let dust: Dust[] = [];
    let curDensity = -1;
    const tiltC = Math.cos(0.34);
    const tiltS = Math.sin(0.34);

    const build = (): void => {
      const dens = tRef.current.density;
      cloud = sphere(Math.min(720, Math.floor(((w * h) / 4200) * dens)), true);
      lat = sphere(46, false);
      dust = Array.from(
        { length: Math.floor(((w * h) / 13000) * dens) },
        (): Dust => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          p: Math.random() * 6.28,
          vy: 0.04 + Math.random() * 0.08,
        }),
      );
      curDensity = dens;
    };
    const resize = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    window.addEventListener("resize", resize);

    const project = (
      p: Point,
      cosR: number,
      sinR: number,
      cx: number,
      cy: number,
      S: number,
      tx: number,
      ty: number,
    ): Projected => {
      const y1 = p.y * tiltC - p.z * tiltS;
      const z1 = p.y * tiltS + p.z * tiltC;
      const x2 = p.x * cosR + z1 * sinR;
      const z2 = -p.x * sinR + z1 * cosR;
      const persp = 1 / (2.4 - z2);
      const norm = (persp - 0.29) / 0.42;
      return {
        px: cx + x2 * persp * S + tx * (0.4 + norm),
        py: cy + y1 * persp * S + ty * (0.4 + norm),
        n: Math.max(0, Math.min(1, norm)),
      };
    };
    const chainPath = (t: number, loop: number, cy: number): readonly [number, number] => {
      const x = w * (0.06 + 0.88 * t);
      const y = cy + h * 0.3 + Math.sin(t * Math.PI * 2 + loop * Math.PI * 2) * h * 0.045;
      return [x, y];
    };

    const draw = (now: number): void => {
      const T = tRef.current;
      if (T.density !== curDensity) build();
      const cols: readonly RGB[] = [hexRGB(T.abbey), hexRGB(T.aviva), hexRGB(T.abi)];
      const glow = T.glow;
      const speed = T.speed;
      const PERIOD = PERIOD_BASE / speed;
      const loop = (now % PERIOD) / PERIOD;

      // eased pointer parallax
      const P = ptr.current;
      P.x += (P.tx - P.x) * 0.05;
      P.y += (P.ty - P.y) * 0.05;
      const par = T.parallax ? 1 : 0;
      const offX = P.x * 26 * par;
      const offY = P.y * 18 * par;

      const breath = 1 + 0.04 * Math.sin(loop * Math.PI * 2);
      const cx = w / 2 + offX;
      const cyC = h * 0.46 + offY;
      const S = Math.min(w, h) * 0.42 * breath;
      const rot = loop * Math.PI * 2 + P.x * 0.25 * par;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const bg = ctx.createRadialGradient(cx, cyC, 0, cx, cyC, Math.max(w, h) * 0.78);
      bg.addColorStop(0, "#0b1530");
      bg.addColorStop(0.55, "#05081a");
      bg.addColorStop(1, "#020308");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // drifting dust
      for (const d of dust) {
        d.y -= d.vy;
        if (d.y < -2) {
          d.y = h + 2;
          d.x = Math.random() * w;
        }
        const a = (0.16 + 0.22 * Math.sin(now * 0.001 + d.p)) * glow;
        ctx.fillStyle = `rgba(150,190,230,${a})`;
        ctx.beginPath();
        ctx.arc(d.x + offX * 0.3, d.y, d.r, 0, 6.3);
        ctx.fill();
      }

      // expanding aura rings
      for (const off of [0, 0.33, 0.66]) {
        const lp = (loop + off) % 1;
        const rr = lp * Math.min(w, h) * 0.66;
        const a = (1 - lp) * 0.32 * glow;
        const cc = cols[2]!;
        ctx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cyC, rr, 0, 6.3);
        ctx.stroke();
      }
      // core glow
      const core = 0.5 + 0.5 * Math.sin(now * 0.004);
      const cg = ctx.createRadialGradient(cx, cyC, 0, cx, cyC, S * 0.5);
      cg.addColorStop(0, `rgba(120,210,255,${(0.1 + core * 0.08) * glow})`);
      cg.addColorStop(1, "rgba(120,210,255,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cyC, S * 0.5, 0, 6.3);
      ctx.fill();
      ctx.fillStyle = `rgba(150,225,255,${(0.5 + core * 0.4) * glow})`;
      ctx.beginPath();
      ctx.arc(cx, cyC, 2 + core * 1.8, 0, 6.3);
      ctx.fill();

      // lattice constellation
      const lpos = lat.map((p) => project(p, cosR, sinR, cx, cyC, S, offX, offY));
      const thr = Math.min(w, h) * 0.19;
      for (let i = 0; i < lpos.length; i++) {
        const pi = lpos[i]!;
        const li = lat[i]!;
        for (let j = i + 1; j < lpos.length; j++) {
          const pj = lpos[j]!;
          const dx = pi.px - pj.px;
          const dy = pi.py - pj.py;
          const dd = Math.hypot(dx, dy);
          if (dd < thr) {
            const ci = cols[li.ci]!;
            const cj = cols[lat[j]!.ci]!;
            const r = (ci[0] + cj[0]) / 2;
            const g = (ci[1] + cj[1]) / 2;
            const b = (ci[2] + cj[2]) / 2;
            const a = (1 - dd / thr) * 0.22 * (0.4 + pi.n) * glow;
            ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pi.px, pi.py);
            ctx.lineTo(pj.px, pj.py);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < lpos.length; i++) {
        const p = lpos[i]!;
        const cc = cols[lat[i]!.ci]!;
        ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${(0.4 + p.n * 0.5) * glow})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1 + p.n * 1.6, 0, 6.3);
        ctx.fill();
      }
      for (let i = 0; i < cloud.length; i++) {
        const cp = cloud[i]!;
        const p = project(cp, cosR, sinR, cx, cyC, S, offX, offY);
        const cc = cols[cp.ci]!;
        ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${(0.14 + p.n * 0.6) * glow})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 0.6 + p.n * 1.7, 0, 6.3);
        ctx.fill();
      }

      // SHA-256 memory ribbon
      if (T.chain) {
        const cc = cols[2]!;
        const NB = 7;
        const bw = Math.max(20, Math.min(w, h) * 0.03);
        const bh = bw * 0.66;
        ctx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.18)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let s = 0; s <= 60; s++) {
          const [x, y] = chainPath(s / 60, loop, cyC);
          if (s) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
        for (let i = 0; i < NB; i++) {
          const t = (i + 0.5) / NB;
          const [bx, by] = chainPath(t, loop, cyC);
          let fd = Math.abs(loop - t);
          fd = Math.min(fd, 1 - fd);
          const flare = Math.exp(-fd * fd * 130);
          const a = 0.26 + flare * 0.7;
          ctx.strokeStyle = `rgba(${cc[0] + flare * 80},${cc[1]},${cc[2]},${a})`;
          ctx.lineWidth = 1.2 + flare * 1.5;
          ctx.beginPath();
          ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 4);
          ctx.stroke();
          if (flare > 0.05) {
            ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${flare * 0.18})`;
            ctx.fill();
          }
          ctx.fillStyle = `rgba(190,245,255,${0.3 + flare * 0.6})`;
          ctx.beginPath();
          ctx.arc(bx, by, 1.1, 0, 6.3);
          ctx.fill();
        }
        for (let k = 0; k < 6; k++) {
          const tp = (loop - k * 0.012 + 1) % 1;
          const [px, py] = chainPath(tp, loop, cyC);
          const a = (1 - k / 6) * 0.9;
          ctx.fillStyle = `rgba(190,245,255,${a})`;
          ctx.beginPath();
          ctx.arc(px, py, bw * 0.18 * (1 - k / 9), 0, 6.3);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─────────────── persona legend chip ─────────────── */
function PersonaDot({
  color,
  name,
  role,
}: {
  color: string;
  name: string;
  role: string;
}): ReactNode {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
          {name}
        </div>
        <div
          className="text-[11px]"
          style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
        >
          {role}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── board-scoped CSS ─────────────── */
// Only what isn't already in src/index.css: page background reset (applied
// inline on the root too), ::selection, and the hero's own keyframes.
const HERO_STYLE = `
  .hero-board { background: var(--surface-0); color: var(--text); font-family: var(--font-sans); }
  .hero-board ::selection { background: rgba(59,130,246,0.3); }
  @keyframes hero-sheen { to { background-position: 200% center; } }
  @keyframes hero-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes hero-fadein { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .hero-board * { animation-duration: .01ms !important; } }
`;

/* ─────────────── board ─────────────── */
export default function HeroBoard(): ReactNode {
  const [t, setTweak] = useTweaks<TweakState>(TWEAK_DEFAULTS);
  const [overlay, setOverlay] = useState(true);
  const show = overlay && t.content;

  // TweakColor's onChange is typed for palette/array options; coerce to the
  // single-hex strings this board stores.
  const setColor =
    (key: "accent" | "abbey" | "aviva" | "abi") =>
    (v: string | readonly string[]): void => {
      setTweak(key, typeof v === "string" ? v : (v[0] ?? "#000000"));
    };

  const rootStyle: CSSProperties = { background: "var(--surface-0)" };

  return (
    <div className="hero-board relative w-full h-screen overflow-hidden" style={rootStyle}>
      <style>{HERO_STYLE}</style>
      <HeroCanvas tweaks={t} />

      {/* vignette + floor fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 72% 72% at 50% 46%, transparent 30%, rgba(2,3,6,0.8) 84%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--surface-0), transparent)" }}
      />

      {/* top bar */}
      <div
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-9 py-5"
        style={{ animation: "hero-fadein .8s ease-out both" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${t.abi}, ${t.accent} 50%, ${t.aviva})`,
              boxShadow: `0 6px 18px -6px ${t.accent}`,
            }}
          >
            <span className="text-white font-bold text-[13px]" style={{ fontFamily: "var(--font-display)" }}>
              M
            </span>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MLAI
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-7 text-[13px]" style={{ color: "var(--text-dim)" }}>
          <span className="hover:text-white transition-colors cursor-default">WDBX</span>
          <span className="hover:text-white transition-colors cursor-default">ABI Framework</span>
          <span className="hover:text-white transition-colors cursor-default">Personas</span>
          <span className="hover:text-white transition-colors cursor-default">Research</span>
        </div>
        <button
          onClick={() => setOverlay((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-dim)",
          }}
        >
          {overlay ? <IEyeOff s={14} /> : <IEye s={14} />}
          {overlay ? "Hide" : "Show"}
        </button>
      </div>

      {/* center content */}
      {show && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] mb-7"
            style={{
              borderColor: "rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-dim)",
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
              animation: "hero-rise .7s ease-out both",
            }}
          >
            <span style={{ color: t.proof || "var(--proof)" }}>
              <ILock s={13} />
            </span>
            Privacy-first AI infrastructure
            <span className="w-1 h-1 rounded-full" style={{ background: "var(--text-faint)" }} />
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>Zig · local-first</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] text-white max-w-4xl"
            style={{ fontFamily: "var(--font-display)", animation: "hero-rise .7s ease-out .1s both" }}
          >
            The infrastructure layer for
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(100deg, ${t.abi}, ${t.accent} 52%, ${t.aviva})`,
                backgroundSize: "200% auto",
                animation: "hero-sheen 6s linear infinite",
                paddingBottom: "0.08em",
              }}
            >
              {t.headline}
            </span>
          </h1>

          <p
            className="mt-7 text-lg sm:text-xl max-w-2xl leading-relaxed"
            style={{ color: "rgba(226,232,240,0.85)", animation: "hero-rise .7s ease-out .2s both" }}
          >
            From the vector engine up — WDBX, the ABI framework, and three minds in one system. Fast by design,
            private by default, verifiable by architecture.
          </p>

          <div
            className="mt-9 flex flex-col sm:flex-row items-center gap-3"
            style={{ animation: "hero-rise .7s ease-out .3s both" }}
          >
            <button
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "#fff", color: "#050509", boxShadow: `0 10px 30px -8px ${t.accent}66` }}
            >
              Explore the stack{" "}
              <span className="transition-transform group-hover:translate-x-0.5">
                <IArrow s={16} />
              </span>
            </button>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Meet Abbey
            </button>
          </div>

          {/* persona legend */}
          {t.personas && (
            <div
              className="mt-12 flex items-center gap-7 px-6 py-3.5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(10px)",
                animation: "hero-rise .7s ease-out .42s both",
              }}
            >
              <PersonaDot color={t.abbey} name="Abbey" role="proof · verified" />
              <span className="w-px h-7" style={{ background: "rgba(255,255,255,0.1)" }} />
              <PersonaDot color={t.aviva} name="Aviva" role="research · vision" />
              <span className="w-px h-7" style={{ background: "rgba(255,255,255,0.1)" }} />
              <PersonaDot color={t.abi} name="Abi" role="interactive · fast" />
            </div>
          )}
        </div>
      )}

      {/* scroll cue */}
      {show && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          style={{ animation: "hero-fadein 1s ease-out .8s both" }}
        >
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}
          >
            scroll
          </span>
          <span
            className="w-px h-7"
            style={{ background: "linear-gradient(to bottom, var(--text-faint), transparent)" }}
          />
        </div>
      )}

      {/* ── Tweaks ── */}
      <TweaksPanel>
        <TweakSection label="Headline" />
        <TweakText label="Gradient line" value={t.headline} onChange={(v) => setTweak("headline", v)} />

        <TweakSection label="Motion" />
        <TweakSlider
          label="Rotation speed"
          value={t.speed}
          min={0.3}
          max={2.5}
          step={0.1}
          unit="×"
          onChange={(v) => setTweak("speed", v)}
        />
        <TweakSlider
          label="Particle density"
          value={t.density}
          min={0.4}
          max={2}
          step={0.1}
          unit="×"
          onChange={(v) => setTweak("density", v)}
        />
        <TweakSlider
          label="Glow"
          value={t.glow}
          min={0.4}
          max={1.8}
          step={0.1}
          unit="×"
          onChange={(v) => setTweak("glow", v)}
        />
        <TweakToggle label="Mouse parallax" value={t.parallax} onChange={(v) => setTweak("parallax", v)} />

        <TweakSection label="Scene" />
        <TweakToggle label="Memory chain" value={t.chain} onChange={(v) => setTweak("chain", v)} />
        <TweakToggle label="Persona legend" value={t.personas} onChange={(v) => setTweak("personas", v)} />
        <TweakToggle label="Show content" value={t.content} onChange={(v) => setTweak("content", v)} />

        <TweakSection label="Color" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#3b82f6", "#22d3ee", "#a855f7", "#34d399"]}
          onChange={setColor("accent")}
        />
        <TweakColor
          label="Abbey"
          value={t.abbey}
          options={["#34d399", "#10b981", "#2dd4bf", "#4ade80"]}
          onChange={setColor("abbey")}
        />
        <TweakColor
          label="Aviva"
          value={t.aviva}
          options={["#a855f7", "#c084fc", "#8b5cf6", "#d946ef"]}
          onChange={setColor("aviva")}
        />
        <TweakColor
          label="Abi"
          value={t.abi}
          options={["#22d3ee", "#38bdf8", "#67e8f9", "#06b6d4"]}
          onChange={setColor("abi")}
        />
      </TweaksPanel>
    </div>
  );
}
