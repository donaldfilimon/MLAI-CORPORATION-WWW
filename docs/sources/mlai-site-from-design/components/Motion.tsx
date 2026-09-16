'use client';
import { useEffect, useRef, useState } from 'react';

/* Reveal — fade+rise on scroll. IO + rect-sweep fallback + settle snap,
   ported from site/site.js (the pattern that survives embed contexts). */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: any;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    const show = () => setShown(true);
    try {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { show(); io?.disconnect(); } }, { threshold: 0.16 });
      io.observe(el);
    } catch {}
    const sweep = () => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.94 && r.bottom > 0) { show(); detach(); }
    };
    const detach = () => { removeEventListener('scroll', sweep); removeEventListener('resize', sweep); };
    addEventListener('scroll', sweep, { passive: true });
    addEventListener('resize', sweep);
    const t1 = setTimeout(sweep, 60), t2 = setTimeout(sweep, 700);
    return () => { io?.disconnect(); detach(); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* settle: snap final state if CSS transitions are frozen (embeds/snapshots) */
  useEffect(() => {
    if (!shown) return;
    const el = ref.current;
    const t = setTimeout(() => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; }
    }, 950 + delay);
    return () => clearTimeout(t);
  }, [shown, delay]);

  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* Counter — eased count-up with a guaranteed final value (rAF can freeze). */
export function Counter({
  to, decimals = 0, prefix = '', suffix = '', dur = 1300,
}: { to: number; decimals?: number; prefix?: string; suffix?: string; dur?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sweep = () => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.96 && r.bottom > 0) { setArmed(true); detach(); }
    };
    const detach = () => { removeEventListener('scroll', sweep); removeEventListener('resize', sweep); };
    addEventListener('scroll', sweep, { passive: true });
    addEventListener('resize', sweep);
    const t = setTimeout(sweep, 80);
    return () => { detach(); clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (!armed) return;
    let raf = 0, s = 0;
    const step = (t: number) => {
      if (!s) s = t;
      const p = Math.min((t - s) / dur, 1);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const settle = setTimeout(() => setV(to), dur + 350);
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [armed, to, dur]);

  return <span ref={ref}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}
