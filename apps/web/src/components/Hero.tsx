import { useEffect } from "react";
import { m, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  GitBranch,
  Network,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Magnetic } from "./Magnetic";
import { BacktracePanel } from "./BacktracePanel";

const TRUSTED_LOGOS = [
  "WorkOS organization access",
  "Gemini 3.7 Flash",
  "Cloudflare AI Gateway",
  "Cloud SQL Postgres",
  "Google Cloud KMS",
];

const PRODUCT_SIGNALS = [
  {
    label: "Identity",
    title: "Invite-only organization access",
    detail: "Membership checked at sign-in and before each protected request; revocation fails closed.",
    icon: ShieldCheck,
  },
  {
    label: "Provider",
    title: "Metadata-only gateway",
    detail: "Operational metadata only; payload logging off; no user email to the provider.",
    icon: Network,
  },
  {
    label: "Audit",
    title: "User-controlled records",
    detail: "Per-record encryption, one-year expiry, export, and deletion.",
    icon: GitBranch,
  },
];

export const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  // React is the sole owner of the neural host DOM. The script never auto-mounts
  // during DOMContentLoaded; doing so raced hydration by appending a canvas to
  // server HTML before React committed. If afterInteractive has not loaded yet,
  // wait for its explicit ready event.
  useEffect(() => {
    const neural = () =>
      (window as unknown as {
        MLAINeural?: { mount: () => void; unmount: () => void };
      }).MLAINeural;
    const mount = () => neural()?.mount();
    mount();
    window.addEventListener("mlai-neural-ready", mount);
    return () => {
      window.removeEventListener("mlai-neural-ready", mount);
      neural()?.unmount();
    };
  }, []);

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
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_64%_2%,rgba(34,211,238,0.22),transparent_72%),radial-gradient(44%_44%_at_18%_14%,rgba(96,165,250,0.10),transparent_68%)]"
        aria-hidden="true"
      />
      {/* Signature drifting constellation — the Lab "net" backdrop (cyan). */}
      <div
        data-neural="net"
        data-color="34,211,238"
        data-op="0.6"
        className="pointer-events-none absolute inset-0 z-0 opacity-70 mask-[linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[96px_96px] opacity-30 mask-[linear-gradient(to_bottom,black,transparent_78%)]"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.68fr)] lg:items-center">
          <m.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
            <m.div variants={fadeUp} className="label-chip mb-5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              QUESAR BY MLAI
            </m.div>

            <m.h1
              variants={fadeUp}
              id="hero-heading"
              className="mb-5 max-w-4xl font-display text-4xl font-bold leading-[1.03] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Private generation with{" "}
              <span className="bg-linear-to-r from-cyan-300 via-sky-200 to-cyan-500 bg-clip-text text-transparent">
                an audit trail you control.
              </span>
            </m.h1>

            <m.p
              variants={fadeUp}
              className="mb-6 max-w-3xl text-base leading-relaxed text-text-dim md:text-lg"
            >
              Only invited WorkOS members can generate. Traffic crosses a
              metadata-only Cloudflare AI Gateway—no payload logging, no user
              email to the provider—and becomes a KMS-wrapped audit you can
              consent to, export, or delete. If any step fails, nothing returns.
            </m.p>

            <m.div variants={fadeUp} className="mb-7 flex flex-wrap gap-3 sm:gap-4">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-white px-6 font-bold text-black hover:bg-cyan-50"
                >
                  <Link to="/login">
                    Enter Quesar
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
                  <Link to="/security">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5"
                      aria-hidden="true"
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                    Review the trust boundary
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
                    <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
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

          <div className="relative mt-2 min-w-0 lg:mt-0 lg:min-h-125">
            {/* Hero signature: the weighted backtrace (see BacktracePanel).
                This replaced the tri-persona particle "galaxy" canvas — a
                drifting point cloud reads as generic AI and could sit on any
                competitor's page, whereas the backtrace is this product's own
                instrument and mirrors the node-graph logo mark. The faint
                `data-neural="net"` backdrop above is kept as atmosphere.
                Shown on mobile too (the galaxy it replaced was lg-only, which
                hid the page's single most product-specific element from
                phone traffic).
                `min-w-0` is load-bearing: grid items default to
                `min-width: auto`, so the panel's unshrinkable monospace
                (hashes, block ids) blew the column past the viewport and
                shifted/clipped the ENTIRE hero on phones. Same reason the
                copy column carries it. */}
            <BacktracePanel />
          </div>
        </div>

        <m.div
          variants={fadeUp}
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          className="mt-10 border-t border-white/5 pt-6"
        >
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim/60">
            Production boundary
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
