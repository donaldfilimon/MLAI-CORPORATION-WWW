import { useEffect, useRef } from "react";

interface Props {
  scores: number[];
  color: string;
}

export function Sparkline({ scores, color }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || scores.length < 2) return;

    const dpr    = window.devicePixelRatio || 1;
    const rect   = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    // Fill gradient under line
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "40");
    grad.addColorStop(1, color + "00");

    const n  = scores.length;
    const dx = W / (n - 1);
    const pts: [number, number][] = scores.map((v, i) => [i * dx, H - v * (H - 2) - 1]);

    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = "round";
    ctx.stroke();

    // Area fill
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }, [scores, color]);

  return <canvas ref={ref} className="spark-canvas" />;
}
