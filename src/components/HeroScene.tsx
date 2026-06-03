import React, { useEffect, useRef } from 'react';

export const HeroScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
      const radius = Math.min(width, height) * 0.2;

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(centerX, centerY);
      context.rotate(frame * 0.004);

      const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius * 2.8);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      glow.addColorStop(0.4, 'rgba(59, 130, 246, 0.12)');
      glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(0, 0, radius * 2.8, 0, Math.PI * 2);
      context.fill();

      for (let ring = 0; ring < 4; ring++) {
        context.save();
        context.rotate(ring * 0.78 + frame * (0.002 + ring * 0.0004));
        context.scale(1, 0.32 + ring * 0.1);
        context.strokeStyle = `rgba(125, 211, 252, ${0.28 - ring * 0.04})`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.ellipse(0, 0, radius * (1.35 + ring * 0.28), radius * (1.35 + ring * 0.28), 0, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }

      context.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      context.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18 + frame * 0.006;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        context.beginPath();
        context.moveTo(x * 0.4, y * 0.4);
        context.lineTo(x, y);
        context.stroke();
      }

      context.fillStyle = 'rgba(15, 23, 42, 0.78)';
      context.strokeStyle = 'rgba(96, 165, 250, 0.8)';
      context.lineWidth = 1.5;
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + frame * 0.01;
        const x = Math.cos(angle) * radius * 0.58;
        const y = Math.sin(angle) * radius * 0.58;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
      context.stroke();

      context.restore();
      if (reducedMotionQuery.matches) return;
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

  return <canvas ref={canvasRef} className="h-full w-full outline-none" />;
};
