import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { Magnetic } from "./Magnetic";
import HeroSceneWebGPU from "./HeroScene.webgpu";

const TRUSTED_LOGOS = [
  "Private retrieval",
  "Policy-gated agents",
  "Audit-ready traces",
  "On-premise paths",
  "GPU-aware runtime",
];

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (shouldReduceMotion) return;
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setMouseOffset({
        x: ((e.clientX - centerX) / (rect.width / 2)) * 30,
        y: ((e.clientY - centerY) / (rect.height / 2)) * 20,
      });
    },
    [shouldReduceMotion],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldReduceMotion) return;
    section.addEventListener("mousemove", handleMouseMove);
    return () => section.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, shouldReduceMotion]);

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-6rem)] flex items-center overflow-hidden noise-overlay"
      aria-labelledby="hero-heading"
    >
      {/* Background Orbs — react to mouse position */}
      <div
        className="bg-orb w-[600px] h-[600px] bg-blue-500/20 -top-20 -right-20 animate-float"
        style={{
          transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="bg-orb w-[400px] h-[400px] bg-purple-500/10 bottom-20 -left-20 animate-float"
        style={{
          animationDelay: "-5s",
          transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="bg-orb w-[300px] h-[300px] bg-cyan-400/5 top-1/3 left-1/4 animate-float"
        style={{
          animationDelay: "-3s",
          transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      <div className="container-custom relative z-10 py-20 md:py-28">
        <div className="max-w-4xl lg:max-w-5xl">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="label-chip mb-8">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              SAFETY-CRITICAL AI INFRASTRUCTURE
            </motion.div>

            <motion.h1
              variants={fadeUp}
              id="hero-heading"
              className="text-5xl sm:text-6xl md:text-8xl font-display font-bold tracking-tight text-white mb-8 leading-[1.02] max-w-5xl"
            >
              Infrastructure for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-gradient">
                resilient intelligence.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-2xl text-text-dim mb-12 max-w-3xl leading-relaxed"
            >
              MLAI Corporation builds WDBX, Abbey, Aviva, and Abi:
              high-integrity systems for teams that need AI agents to explain
              decisions, enforce constraints, and perform under production load.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 sm:gap-6 mb-16"
            >
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-white px-6 font-bold text-black hover:bg-blue-50"
                >
                  <Link to="/research">
                    Explore Our Research
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </Magnetic>

              <Magnetic>
                <Button
                  variant="ghost"
                  asChild
                  size="lg"
                  className="h-12 gap-3 rounded-full border border-white/10 px-5 text-white hover:bg-white/10 hover:text-white group"
                >
                  <Link to="/benchmarks">
                    <div
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all group-hover:border-blue-400/50 group-hover:bg-blue-400/5"
                      aria-hidden="true"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    WDBX Benchmarks
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              variants={fadeUp}
              className="pt-8 border-t border-white/5"
            >
              <p className="text-[10px] font-mono text-text-dim/60 uppercase tracking-[0.2em] mb-5">
                Built around production constraints
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {TRUSTED_LOGOS.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-medium text-text-dim/40 hover:text-text-dim/70 transition-colors cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Hero Visual Element (Abstract 3D) */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block opacity-80"
        aria-hidden="true"
      >
        <Suspense fallback={<div className="h-full w-full" />}>
          {/* Use WebGL-based version for better performance */}
          <HeroSceneWebGPU />
          {/* Fallback to original if needed */}
          {/* <HeroScene /> */}
        </Suspense>
      </div>
    </section>
  );
};
