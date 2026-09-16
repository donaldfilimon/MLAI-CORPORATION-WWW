import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type Pt = { x: number; y: number; vx: number; vy: number; r: number; c: string };

type Props = {
  accent?: string;
  accent2?: string;
  density?: number;
  style?: CSSProperties;
};

/** MLAI signature embedding-galaxy ambient canvas. Calm drift, reduced-motion aware. */
export function Galaxy({ accent = "#00D4FF", accent2 = "#7C3AED", density = 70, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0, h = 0;
    let pts: Pt[] = [];
    let visible = true;
    let running = false;

    const seed = () => {
      pts = Array.from({ length: density }, () => {
        const roll = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: 0.8 + Math.random() * 1.5,
          c: roll < 0.14 ? accent : roll < 0.24 ? accent2 : "#AEB9CC",
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pts.length === 0) seed();
    };

    const R = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduced) {
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            ctx.strokeStyle = "rgba(148,163,184," + (0.16 * (1 - d / R)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    };

    const frame = () => {
      running = false;
      draw();
      if (!reduced && visible) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const start = () => {
      if (reduced) {
        stop();
        draw();
        return;
      }
      if (!visible) {
        stop();
        return;
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) {
        stop();
        draw();
      } else if (visible) {
        stop();
        start();
      } else {
        draw();
      }
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { rootMargin: "80px 0px", threshold: 0 },
    );
    io.observe(canvas);

    resize();
    // First paint: reduced-motion stays on a static frame; otherwise start if onscreen.
    if (reduced) draw();
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [accent, accent2, density]);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", ...style }}
    />
  );
}
