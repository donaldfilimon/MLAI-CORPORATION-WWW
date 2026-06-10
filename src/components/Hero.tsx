import { Suspense } from "react";
import { m, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  DatabaseZap,
  GitBranch,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Magnetic } from "./Magnetic";
import dynamic from "next/dynamic";

// Decorative WebGL canvas: loaded after first paint, outside the eager route bundle.
const HeroSceneWebGPU = dynamic(() => import("./HeroScene.webgpu"), { ssr: false });

const TRUSTED_LOGOS = [
  "Private retrieval",
  "Policy-gated agents",
  "Audit-ready traces",
  "On-premise paths",
  "GPU-aware runtime",
];

const PRODUCT_SIGNALS = [
  {
    label: "WDBX",
    title: "Traceable retrieval",
    detail: "Weighted backtrace memory for evidence-aware context.",
    icon: DatabaseZap,
  },
  {
    label: "Abbey · Aviva · Abi",
    title: "Persona routing",
    detail: "Empathy, direct expertise, and adaptive moderation.",
    icon: BrainCircuit,
  },
  {
    label: "Operator layer",
    title: "Bounded autonomy",
    detail: "Approval gates, audit trails, and deployment controls.",
    icon: GitBranch,
  },
];

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden noise-overlay"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_64%_2%,rgba(99,102,241,0.24),transparent_72%),radial-gradient(44%_44%_at_18%_14%,rgba(56,189,248,0.10),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:96px_96px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.68fr)] lg:items-center">
          <m.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
            <m.div variants={fadeUp} className="label-chip mb-5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              PRIVATE AI INFRASTRUCTURE
            </m.div>

            <m.h1
              variants={fadeUp}
              id="hero-heading"
              className="mb-5 max-w-4xl font-display text-4xl font-bold leading-[1.03] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Traceable AI systems for{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-500 bg-clip-text text-transparent">
                real production constraints.
              </span>
            </m.h1>

            <m.p
              variants={fadeUp}
              className="mb-6 max-w-3xl text-base leading-relaxed text-text-dim md:text-lg"
            >
              MLAI connects WDBX memory, Abbey · Aviva · Abi routing, and
              operator controls into infrastructure for agents that need to
              explain decisions, respect boundaries, and stay observable.
            </m.p>

            <m.div variants={fadeUp} className="mb-7 flex flex-wrap gap-3 sm:gap-4">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-white px-6 font-bold text-black hover:bg-indigo-50"
                >
                  <Link to="/showcase">
                    View the System
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
                  className="group h-12 gap-3 rounded-full border border-white/10 px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/benchmarks">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all group-hover:border-indigo-400/50 group-hover:bg-indigo-400/5"
                      aria-hidden="true"
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                    WDBX Benchmarks
                  </Link>
                </Button>
              </Magnetic>
            </m.div>

            <m.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
              {PRODUCT_SIGNALS.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div
                    key={signal.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {signal.label}
                    </div>
                    <div className="text-sm font-semibold text-white">{signal.title}</div>
                    <p className="mt-1.5 text-xs leading-relaxed text-text-dim/85">
                      {signal.detail}
                    </p>
                  </div>
                );
              })}
            </m.div>
          </m.div>

          <div className="relative hidden min-h-[500px] lg:block" aria-hidden="true">
            <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-bg/20 shadow-2xl shadow-indigo-950/20 backdrop-blur-sm" />
            <div className="absolute inset-4 overflow-hidden rounded-[2rem] border border-white/8 bg-[#070914]/70">
              <Suspense fallback={<div className="h-full w-full" />}>
                <HeroSceneWebGPU />
              </Suspense>
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-bg/75 p-4 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-200/80">
                Live architecture view
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-dim">
                Retrieval, routing, and operator controls presented as one
                inspectable system.
              </p>
            </div>
          </div>
        </div>

        <m.div
          variants={fadeUp}
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          className="mt-10 border-t border-white/5 pt-6"
        >
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim/60">
            Built around production constraints
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {TRUSTED_LOGOS.map((name) => (
              <span
                key={name}
                className="text-sm font-medium text-text-dim/45 transition-colors hover:text-text-dim/80"
              >
                {name}
              </span>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};
