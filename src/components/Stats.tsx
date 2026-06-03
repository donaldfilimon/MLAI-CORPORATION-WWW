import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { content } from '../data';
import { Card, CardContent } from '@/components/ui/card';

function useCountUp(target: string, inView: boolean, shouldReduceMotion: boolean | null) {
  const [display, setDisplay] = useState(target);
  const hasRun = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(target);
      return;
    }
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    // Extract numeric portion and suffix (updated to support currency symbols)
    const match = target.match(/^([<>$]?\s*)?([\d,.]+)(\+?%?\s*.*)$/);
    if (!match) { setDisplay(target); return; }

    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const num = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = num * eased;
      const formatted = isDecimal
        ? current.toFixed(numStr.split('.')[1].length)
        : Math.round(current).toLocaleString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (step >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [inView, shouldReduceMotion, target]);

  return display;
}

interface StatCardProps {
  key?: React.Key;
  stat: typeof content.stats[0];
  index: number;
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const displayValue = useCountUp(stat.value, inView, shouldReduceMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={shouldReduceMotion ? undefined : { delay: index * 0.1 }}
    >
      <Card className="text-center p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/20 transition-all duration-300 group h-full">
        <CardContent className="p-0 flex flex-col justify-center h-full">
          <div className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 mb-3 tabular-nums">
            {displayValue}
          </div>
          <div className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">{stat.label}</div>
          <div className="text-xs text-text-dim leading-relaxed">{stat.detail}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const Stats = () => {
  return (
    <section id="impact" className="py-24 bg-surface/20 relative" aria-labelledby="stats-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="label-chip mx-auto mb-6 w-fit">
            VERIFIED METRICS
          </div>
          <h2 id="stats-heading" className="section-title">Verified Impact</h2>
          <p className="section-subtitle mx-auto">
            Production metrics demonstrating the structural reliability of the MLAI architecture under real-world conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
