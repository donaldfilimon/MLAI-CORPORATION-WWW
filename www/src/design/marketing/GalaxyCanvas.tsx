/* GalaxyCanvas — the signature MLAI embedding-galaxy background.
   Three persona-colored lobes (Abbey emerald / Aviva violet / Abi cyan)
   rotating slowly in a near-black void, with aura rings, a breathing core,
   a lattice constellation and a SHA-256 memory ribbon. Calm, weighty, cool.
   Adapted from the brand's hero canvas. */
import { useEffect, useRef } from "react";

type RGB = readonly [number, number, number];

const COLS: { abbey: RGB; aviva: RGB; abi: RGB } = {
  abbey: [52, 211, 153],
  aviva: [168, 85, 247],
  abi: [34, 211, 238],
};

interface Particle {
  x: number;
  y: number;
  z: number;
  ci: number;
}

interface Dust {
  x: number;
  y: number;
  r: number;
  p: number;
  vy: number;
}

interface Projected {
  px: number;
  py: number;
  n: number;
}

function sphere(n: number, clustered: boolean): Particle[] {
  return Array.from({ length: n }, () => {
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
      const lobes: ReadonlyArray<RGB> = [
        [0.62, 0.2, 0],
        [-0.4, 0.45, 0.4],
        [-0.2, -0.55, -0.45],
      ];
      const L = lobes[ci] ?? lobes[0]!;
      const b = 0.42;
      x = x * (1 - b) + L[0] * b;
      y = y * (1 - b) + L[1] * b;
      z = z * (1 - b) + L[2] * b;
    }
    return { x, y, z, ci };
  });
}

export interface GalaxyCanvasProps {
  speed?: number;
  glow?: number;
  chain?: boolean;
}

export default function GalaxyCanvas({
  speed = 1,
  glow = 1,
  chain = true,
}: GalaxyCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ tx: 0, ty: 0, x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ptr.current.tx = (e.clientX / innerWidth - 0.5) * 2;
      ptr.current.ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;
    const ctx: CanvasRenderingContext2D = x;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cloud: Particle[] = [];
    let lat: Particle[] = [];
    let dust: Dust[] = [];
    const tC = Math.cos(0.34);
    const tS = Math.sin(0.34);
    const palette: RGB[] = [COLS.abbey, COLS.aviva, COLS.abi];

    const build = () => {
      cloud = sphere(Math.min(640, Math.floor((w * h) / 5200)), true);
      lat = sphere(42, false);
      dust = Array.from({ length: Math.floor((w * h) / 14000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3,
        p: Math.random() * 6.28,
        vy: 0.04 + Math.random() * 0.08,
      }));
    };

    const rs = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    rs();
    addEventListener("resize", rs);

    const proj = (
      p: Particle,
      cr: number,
      sr: number,
      cx: number,
      cy: number,
      S: number,
      ox: number,
      oy: number,
    ): Projected => {
      const y1 = p.y * tC - p.z * tS;
      const z1 = p.y * tS + p.z * tC;
      const x2 = p.x * cr + z1 * sr;
      const z2 = -p.x * sr + z1 * cr;
      const pe = 1 / (2.4 - z2);
      const nm = Math.max(0, Math.min(1, (pe - 0.29) / 0.42));
      return {
        px: cx + x2 * pe * S + ox * (0.4 + nm),
        py: cy + y1 * pe * S + oy * (0.4 + nm),
        n: nm,
      };
    };

    const chainPath = (t: number, cy: number): [number, number] => [
      w * (0.06 + 0.88 * t),
      cy + h * 0.3 + Math.sin(t * Math.PI * 2) * h * 0.045,
    ];

    const PERIOD = 8000 / speed;

    const draw = (now: number) => {
      const loop = (now % PERIOD) / PERIOD;
      const P = ptr.current;
      P.x += (P.tx - P.x) * 0.05;
      P.y += (P.ty - P.y) * 0.05;
      const ox = P.x * 24;
      const oy = P.y * 16;
      const breath = 1 + 0.04 * Math.sin(loop * Math.PI * 2);
      const cx = w / 2 + ox;
      const cy = h * 0.46 + oy;
      const S = Math.min(w, h) * 0.42 * breath;
      const rot = loop * Math.PI * 2 + P.x * 0.22;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.78);
      bg.addColorStop(0, "#0b1530");
      bg.addColorStop(0.55, "#05081a");
      bg.addColorStop(1, "#020308");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const d of dust) {
        d.y -= d.vy;
        if (d.y < -2) {
          d.y = h + 2;
          d.x = Math.random() * w;
        }
        const a = (0.16 + 0.22 * Math.sin(now * 0.001 + d.p)) * glow;
        ctx.fillStyle = `rgba(150,190,230,${a})`;
        ctx.beginPath();
        ctx.arc(d.x + ox * 0.3, d.y, d.r, 0, 6.3);
        ctx.fill();
      }

      for (const off of [0, 0.33, 0.66]) {
        const lpRing = (loop + off) % 1;
        const rr = lpRing * Math.min(w, h) * 0.66;
        const a = (1 - lpRing) * 0.3 * glow;
        const cc = COLS.abi;
        ctx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, 6.3);
        ctx.stroke();
      }

      const core = 0.5 + 0.5 * Math.sin(now * 0.004);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.5);
      cg.addColorStop(0, `rgba(120,210,255,${(0.1 + core * 0.08) * glow})`);
      cg.addColorStop(1, "rgba(120,210,255,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.5, 0, 6.3);
      ctx.fill();
      ctx.fillStyle = `rgba(150,225,255,${(0.5 + core * 0.4) * glow})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2 + core * 1.8, 0, 6.3);
      ctx.fill();

      const lp = lat.map((p) => proj(p, cr, sr, cx, cy, S, ox, oy));
      const thr = Math.min(w, h) * 0.19;
      for (let i = 0; i < lp.length; i++) {
        const a0 = lp[i];
        const lati = lat[i];
        if (!a0 || !lati) continue;
        for (let j = i + 1; j < lp.length; j++) {
          const b0 = lp[j];
          const latj = lat[j];
          if (!b0 || !latj) continue;
          const dx = a0.px - b0.px;
          const dy = a0.py - b0.py;
          const dd = Math.hypot(dx, dy);
          if (dd < thr) {
            const ci = palette[lati.ci] ?? palette[0]!;
            const cj = palette[latj.ci] ?? palette[0]!;
            const a = (1 - dd / thr) * 0.22 * (0.4 + a0.n) * glow;
            ctx.strokeStyle = `rgba(${((ci[0] + cj[0]) / 2) | 0},${((ci[1] + cj[1]) / 2) | 0},${((ci[2] + cj[2]) / 2) | 0},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a0.px, a0.py);
            ctx.lineTo(b0.px, b0.py);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < lp.length; i++) {
        const p = lp[i];
        const lati = lat[i];
        if (!p || !lati) continue;
        const cc = palette[lati.ci] ?? palette[0]!;
        ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${(0.4 + p.n * 0.5) * glow})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1 + p.n * 1.6, 0, 6.3);
        ctx.fill();
      }

      for (let i = 0; i < cloud.length; i++) {
        const ci = cloud[i];
        if (!ci) continue;
        const p = proj(ci, cr, sr, cx, cy, S, ox, oy);
        const cc = palette[ci.ci] ?? palette[0]!;
        ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${(0.14 + p.n * 0.6) * glow})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 0.6 + p.n * 1.7, 0, 6.3);
        ctx.fill();
      }

      if (chain) {
        const cc = COLS.abi;
        const NB = 7;
        const bw = Math.max(20, Math.min(w, h) * 0.03);
        const bh = bw * 0.66;
        ctx.strokeStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.18)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let s = 0; s <= 60; s++) {
          const [bx, by] = chainPath(s / 60, cy);
          if (s) ctx.lineTo(bx, by);
          else ctx.moveTo(bx, by);
        }
        ctx.stroke();
        for (let i = 0; i < NB; i++) {
          const t = (i + 0.5) / NB;
          const [bx, by] = chainPath(t, cy);
          let fd = Math.abs(loop - t);
          fd = Math.min(fd, 1 - fd);
          const flare = Math.exp(-fd * fd * 130);
          ctx.strokeStyle = `rgba(${cc[0] + flare * 80},${cc[1]},${cc[2]},${0.26 + flare * 0.7})`;
          ctx.lineWidth = 1.2 + flare * 1.5;
          ctx.beginPath();
          ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 4);
          ctx.stroke();
          ctx.fillStyle = `rgba(190,245,255,${0.3 + flare * 0.6})`;
          ctx.beginPath();
          ctx.arc(bx, by, 1.1, 0, 6.3);
          ctx.fill();
        }
        for (let k = 0; k < 6; k++) {
          const tp = (loop - k * 0.012 + 1) % 1;
          const [px, py] = chainPath(tp, cy);
          ctx.fillStyle = `rgba(190,245,255,${(1 - k / 6) * 0.9})`;
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
      removeEventListener("resize", rs);
    };
  }, [speed, glow, chain]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
