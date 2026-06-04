import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const WDBX_COLOR = "#D97757";
const COMP_COLOR = "#6A9BCC";

interface Props {
  labels: string[];
  values: number[];
}

export const BarChart = forwardRef<HTMLCanvasElement, Props>(
  ({ labels, values }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // ... (rest of the effect code remains the same)
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      if (!labels.length) {
        ctx.fillStyle = "#555";
        ctx.font = "13px Inter,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No competitors selected", W / 2, H / 2);
        return;
      }

      const maxVal = Math.max(...values) || 1;
      const marginL = 6;
      const marginB = 46;
      const marginT = 18;
      const chartW = W - marginL;
      const chartH = H - marginB - marginT;
      const slot = chartW / labels.length;
      const bw = slot * 0.62;
      const gap = slot * 0.38;

      labels.forEach((lbl, i) => {
        const val = values[i];
        if (val === undefined) return;

        const bh = (val / maxVal) * chartH;
        const x = marginL + i * slot + gap / 2;
        const y = marginT + chartH - bh;
        const isHero = lbl === "WDBX" || lbl === "Abbey System";
        const color = isHero ? WDBX_COLOR : COMP_COLOR;

        // Bar with gradient
        const grad = ctx.createLinearGradient(x, y, x, y + bh);
        grad.addColorStop(0, color);
        grad.addColorStop(1, isHero ? "#1a0800" : "#060d18");

        ctx.beginPath();
        ctx.fillStyle = grad;
        const r = Math.min(4, bw / 3);
        if (ctx.roundRect) {
          ctx.roundRect(x, y, bw, bh, [r, r, 0, 0]);
        } else {
          ctx.rect(x, y, bw, bh);
        }
        ctx.fill();

        // Top stroke for definition
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle glow for Hero
        if (isHero && bh > 4) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, bw, bh, [r, r, 0, 0]);
          } else {
            ctx.rect(x, y, bw, bh);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Value label
        const fontSize = Math.max(10, Math.min(12, Math.floor(bw * 0.75)));
        const dispVal =
          val >= 10_000
            ? `${(val / 1000).toFixed(0)}k`
            : val >= 1_000
              ? `${(val / 1000).toFixed(1)}k`
              : val % 1 !== 0
                ? String(val)
                : String(val);
        ctx.fillStyle = isHero ? "#fff" : "#cbd5e1";
        ctx.font = `600 ${fontSize}px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(dispVal, x + bw / 2, Math.max(marginT + 12, y - 6));

        // X-axis label
        ctx.save();
        ctx.translate(x + bw / 2, H - marginB + 10);
        ctx.rotate(-Math.PI / 4.5);
        ctx.textAlign = "right";
        ctx.fillStyle = isHero ? color : "#64748b";
        ctx.font = `${isHero ? "700" : "500"} ${Math.max(9, Math.min(11, Math.floor(bw * 0.85)))}px Inter,sans-serif`;
        ctx.fillText(lbl, 0, 0);
        ctx.restore();
      });

      // Baseline
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, marginT + chartH);
      ctx.lineTo(W, marginT + chartH);
      ctx.stroke();
    }, [labels, values]);

    return <canvas ref={canvasRef} className="bar-canvas" />;
  },
);
