import { Link } from "react-router-dom";
import { m, useReducedMotion } from "framer-motion";
import { Clapperboard, Film as FilmIcon, Layers, Mic, Play, Sparkles } from "lucide-react";

type Surface = {
  to: string;
  index: string;
  title: string;
  duration: string;
  blurb: string;
  icon: typeof Play;
  // poster atmosphere — each surface projects its own light
  glow: string;
  edge: string;
  accent: string;
};

const SURFACES: Surface[] = [
  {
    to: "/showcase/film",
    index: "01",
    title: "Brand Film",
    duration: "69s · six scenes",
    blurb:
      "The MLAI story — persona routing, verifiable memory, and governance — hosted by Abbey, Aviva, and Abi with on-device neural narration.",
    icon: FilmIcon,
    glow: "radial-gradient(80% 90% at 30% 0%, rgba(99,102,241,0.32), transparent 65%)",
    edge: "rgba(129,140,248,0.45)",
    accent: "text-indigo-300",
  },
  {
    to: "/showcase/trailer",
    index: "02",
    title: "Vision Trailer",
    duration: "62s · high-octane cut",
    blurb:
      "A faster, sharper cut of the vision: the spectrum identity, the three minds, and the architecture in motion.",
    icon: Play,
    glow: "radial-gradient(80% 90% at 70% 0%, rgba(56,189,248,0.30), transparent 65%)",
    edge: "rgba(125,211,252,0.45)",
    accent: "text-sky-300",
  },
  {
    to: "/showcase/mega",
    index: "03",
    title: "Mega-Trailer",
    duration: "282s · the longest cut",
    blurb:
      "Every scene, a camera rig, and a neural background — the full-length cinematic treatment of the platform.",
    icon: Clapperboard,
    glow: "radial-gradient(80% 90% at 50% 0%, rgba(232,121,249,0.26), transparent 65%)",
    edge: "rgba(240,171,252,0.4)",
    accent: "text-fuchsia-300",
  },
  {
    to: "/showcase/explainer",
    index: "04",
    title: "Explainer Film",
    duration: "extended explainer",
    blurb:
      "The deep-dive explainer: storage, routing, math, and the north star, with karaoke captions synced to the voices.",
    icon: Sparkles,
    glow: "radial-gradient(80% 90% at 30% 0%, rgba(129,140,248,0.28), transparent 65%)",
    edge: "rgba(165,180,252,0.4)",
    accent: "text-indigo-200",
  },
  {
    to: "/showcase/design",
    index: "05",
    title: "Design Lab",
    duration: "8 boards",
    blurb:
      "The design-system boards behind the films — brand, foundations, hero studies, marketing and console UI kits, and docs.",
    icon: Layers,
    glow: "radial-gradient(80% 90% at 70% 0%, rgba(56,189,248,0.26), transparent 65%)",
    edge: "rgba(125,211,252,0.4)",
    accent: "text-sky-200",
  },
];

// SVG noise — film grain without an asset request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Showcase() {
  const shouldReduceMotion = useReducedMotion();

  const enter = (i: number) =>
    shouldReduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 36, rotate: i % 2 ? 0.6 : -0.6 },
          whileInView: { opacity: 1, y: 0, rotate: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.7, delay: (i % 3) * 0.09, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="relative pt-10">
      {/* projection-room atmosphere: a cone of light from above, grain on top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            "radial-gradient(55% 60% at 50% -10%, rgba(99,102,241,0.16), transparent 70%), radial-gradient(35% 45% at 82% 5%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <section className="section-y relative">
        <div className="container-custom">
          {/* marquee header — oversized, cinema lobby */}
          <div className="mb-20 max-w-4xl">
            <m.p
              {...(shouldReduceMotion
                ? { initial: false }
                : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 } })}
              className="mb-5 font-mono text-[11px] uppercase tracking-[0.42em] text-indigo-300/80"
            >
              Now showing · rendered live · no video files
            </m.p>
            <m.h1
              {...(shouldReduceMotion
                ? { initial: false }
                : {
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.7, delay: 0.08 },
                  })}
              className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-white md:text-7xl"
            >
              The projection
              <br />
              room<span className="text-indigo-400">.</span>
            </m.h1>
            <m.p
              {...(shouldReduceMotion
                ? { initial: false }
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.7, delay: 0.16 },
                  })}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-text-dim"
            >
              Films and trailers drawn frame-by-frame by a timeline engine in
              your browser, narrated by the three MLAI minds with a neural
              voice that never leaves your device.
            </m.p>
          </div>

          {/* poster wall — letterboxed cards, film-frame chrome */}
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((s, i) => {
              const Icon = s.icon;
              return (
                <m.div key={s.to} {...enter(i)} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
                  <Link
                    to={s.to}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d16] transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
                    style={{ boxShadow: "0 18px 50px -22px rgba(0,0,0,0.8)" }}
                  >
                    {/* poster glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: s.glow }}
                    />
                    {/* sprocket strip — film-frame chrome */}
                    <div className="relative flex items-center justify-between border-b border-white/8 px-5 py-2.5">
                      <span className="font-mono text-[10px] tracking-[0.3em] text-text-dim/60">
                        REEL {s.index}
                      </span>
                      <span aria-hidden="true" className="flex gap-1.5">
                        {[0, 1, 2, 3].map((d) => (
                          <span key={d} className="h-1.5 w-2.5 rounded-[2px] bg-white/12" />
                        ))}
                      </span>
                    </div>

                    {/* letterboxed marquee area */}
                    <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden">
                      <Icon
                        className={`${s.accent} transition-transform duration-700 group-hover:scale-110`}
                        size={52}
                        strokeWidth={1.1}
                        aria-hidden="true"
                      />
                      {/* play affordance sweeps in */}
                      <span
                        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:bg-black/30 group-hover:opacity-100"
                        aria-hidden="true"
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full border"
                          style={{ borderColor: s.edge, background: "rgba(10,11,18,0.6)" }}
                        >
                          <Play size={20} className="ml-0.5 text-white" />
                        </span>
                      </span>
                    </div>

                    {/* bill copy */}
                    <div className="relative flex flex-1 flex-col gap-3 border-t border-white/8 p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                          {s.title}
                        </h2>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim/70">
                          {s.duration}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-text-dim">{s.blurb}</p>
                    </div>
                  </Link>
                </m.div>
              );
            })}

            {/* voice card completes the wall — same chrome, different content */}
            <m.div {...enter(5)}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-indigo-400/20 bg-[#0c0d16]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(90% 100% at 50% 110%, rgba(99,102,241,0.22), transparent 60%)",
                  }}
                />
                <div className="relative flex items-center justify-between border-b border-white/8 px-5 py-2.5">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-indigo-300/70">
                    VOICE SYSTEM
                  </span>
                  <Mic size={13} className="text-indigo-300/70" aria-hidden="true" />
                </div>
                <div className="relative flex flex-1 flex-col gap-3 p-6">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                    On-device neural voice
                  </h2>
                  <p className="text-sm leading-relaxed text-text-dim">
                    Narration is synthesized in your browser by the Kokoro-82M
                    text-to-speech model (WebGPU, with a WASM fallback) — each
                    persona has its own voice and prosody, and nothing is sent
                    to a server. The first playback downloads the model; if
                    your browser can&apos;t run it, captions carry the words.
                  </p>
                  <p className="mt-auto border-t border-white/8 pt-4 font-mono text-[11px] leading-relaxed text-text-dim/70">
                    space play/pause · ←/→ scrub · 0 restart
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </div>
  );
}
