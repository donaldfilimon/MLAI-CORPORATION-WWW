import { useEffect, useRef } from "react";

export const Viewport3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const nodes = Array.from({ length: 72 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 72,
      depth: Math.sin(index * 1.7),
      speed: 0.0018 + (index % 7) * 0.00035,
    }));

    let frame = 0;
    let animationId = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.36;

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(centerX, centerY);

      const points = nodes.map((node) => {
        const angle = node.angle + frame * node.speed;
        const orbit = radius * (0.55 + (node.depth + 1) * 0.22);
        const yScale = 0.48 + node.depth * 0.08;
        return {
          x: Math.cos(angle) * orbit,
          y: Math.sin(angle) * orbit * yScale,
          alpha: 0.34 + (node.depth + 1) * 0.18,
        };
      });

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j += 9) {
          const a = points[i];
          const b = points[j];
          if (!a || !b) continue;

          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > radius * 0.5) continue;

          context.strokeStyle = `rgba(96, 165, 250, ${Math.max(0, 0.16 - (distance / radius) * 0.18)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      const core = context.createRadialGradient(0, 0, 0, 0, 0, radius * 0.6);
      core.addColorStop(0, "rgba(125, 211, 252, 0.4)");
      core.addColorStop(0.45, "rgba(37, 99, 235, 0.16)");
      core.addColorStop(1, "rgba(37, 99, 235, 0)");
      context.fillStyle = core;
      context.beginPath();
      context.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
      context.fill();

      points.forEach((point) => {
        context.fillStyle = `rgba(147, 197, 253, ${point.alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
        context.fill();
      });

      context.restore();
      frame += 1;
      animationId = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="group relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full outline-none" />
      <div className="pointer-events-none absolute bottom-4 left-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400/60">
          LIVE ARCHITECTURE MAP
        </p>
      </div>
    </div>
  );
};
