/* ════════════════════════════════════════════════════════════════
   MLAI — Design System Upgrade v2
   Self-contained board entry point. Wires the foundations, depth and
   tokens sections, the sidebar nav, the scroll-progress bar, the
   ambient page glow and the Tweaks panel (which eats its own dog food
   by driving the --ds-* theming variables).
   ════════════════════════════════════════════════════════════════ */
import { useState, useEffect, type ReactNode } from "react";
import { Mark, Eyebrow, Mono, Reveal } from "./core.tsx";
import { ReviewSection, ColorSection, ElevationSection, SpacingSection, TypeSection } from "./foundations.tsx";
import { LightSection, ComponentsSection, AppliedSection, TokensSection } from "./depth.tsx";
import {
  TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakSlider, TweakToggle, useTweaks,
} from "./shell/TweaksPanel.tsx";
import {
  NAV, THEMES, CANVASES, TWEAK_DEFAULTS, type ThemeTriple, type TweakState,
} from "./tokens.ts";

/* ── Board-specific CSS ────────────────────────────────────────────
   Everything here is NOT already present in src/index.css. It is the
   runtime-themable --ds-* variable layer the Tweaks panel drives, plus
   the board chrome (sidebar nav active state, spectrum-gradient text,
   scroll-progress bar, scoped film grain, scrollbars, selection and the
   board canvas background). Scoped under .ds-board so it can't collide
   with the host app's globals. */
const BOARD_CSS = `
.ds-board {
  /* ── theming variables the Tweaks panel drives ── */
  --ds-accent: #22d3ee;          /* spectrum start (cyan)  */
  --ds-accent2: #60a5fa;         /* spectrum mid  (blue)   */
  --ds-accent3: #a855f7;         /* spectrum end  (violet) */
  --ds-canvas: #040407;          /* page background        */
  --ds-grain: 0.022;             /* film-grain opacity     */
  --ds-radius: 20px;             /* card radius            */
  --ds-glass: 14px;              /* glass blur             */
  --ds-grad: linear-gradient(100deg, var(--ds-accent), var(--ds-accent2), var(--ds-accent3));
  --ds-glow-a: rgba(34, 211, 238, 0.1);
  --ds-glow-b: rgba(168, 85, 247, 0.09);

  position: relative;
  min-height: 100vh;
  color: #fafafa;
  font-family: "Inter", system-ui, sans-serif;
  background:
    radial-gradient(130% 80% at 50% -10%, #0a1226 0%, #050813 46%, #030307 100%) fixed,
    var(--ds-canvas);
}
.ds-board *,
.ds-board *::before,
.ds-board *::after { box-sizing: border-box; }

.ds-board ::-webkit-scrollbar { width: 8px; height: 8px; }
.ds-board ::-webkit-scrollbar-track { background: transparent; }
.ds-board ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 6px; }
.ds-board ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
.ds-board ::selection { background: color-mix(in srgb, var(--ds-accent) 35%, transparent); }

/* premium film grain — scoped to the board */
.ds-board .ds-grain {
  content: "";
  position: fixed; inset: 0;
  opacity: var(--ds-grain);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.ds-board .nav-link.active { color: #fff; }
.ds-board .nav-link.active .dot { opacity: 1; transform: scale(1); }

/* dynamic spectrum gradient text — follows the theme */
.ds-board .t-grad {
  background: var(--ds-grad);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* scroll-progress bar */
.ds-board .ds-scroll-progress {
  position: fixed;
  top: 0; left: 0;
  height: 2px; width: 0%;
  z-index: 9998;
  background: var(--ds-grad);
  box-shadow: 0 0 12px color-mix(in srgb, var(--ds-accent) 60%, transparent);
  transition: width 0.1s linear;
}
`;

/* ── active-section observer ───────────────────────────────────── */
function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // ids is module-constant; observe once on mount.
  }, []);
  return active;
}

/* ── Sidebar ───────────────────────────────────────────────────── */
function Sidebar({ active }: { active: string }): ReactNode {
  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 px-7 py-8 border-r border-white/7 z-20"
      style={{ background: "rgba(5,5,9,0.7)", backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <Mark size={34} />
        <div>
          <div className="font-bold tracking-[0.16em] text-white text-[15px] leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
            MLAI
          </div>
          <Mono className="text-[9.5px] text-slate-500">design system</Mono>
        </div>
      </div>
      <div className="mt-8 mb-6">
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase"
          style={{
            background: "linear-gradient(90deg,color-mix(in srgb,var(--ds-accent) 14%,transparent),color-mix(in srgb,var(--ds-accent3) 14%,transparent))",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--ds-accent)",
            letterSpacing: "0.14em",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Upgrade · v2.0
        </span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(([id, num, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className={`nav-link group flex items-center gap-3 py-2.5 text-[13.5px] text-slate-500 hover:text-white transition-colors ${active === id ? "active" : ""}`}
          >
            <Mono className="text-[10px] text-slate-600 w-5">{num}</Mono>
            <span
              className="dot w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: "var(--ds-grad)",
                opacity: active === id ? 1 : 0,
                transform: active === id ? "scale(1)" : "scale(0)",
              }}
            />
            <span className="font-medium">{label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/6">
        <Mono className="text-[10px] text-slate-600 leading-relaxed block">Outfit · Inter · JetBrains Mono</Mono>
        <Mono className="text-[10px] text-slate-700 mt-1 block">© 2026 MLAI Corporation</Mono>
      </div>
    </aside>
  );
}

const HERO_CHIPS: readonly string[] = [
  "4-tier elevation", "Reconciled color", "Spacing rhythm", "One light source", "Before / after",
];

/* ── Board ─────────────────────────────────────────────────────── */
export default function DesignBoard(): ReactNode {
  const active = useActiveSection(NAV.map((n) => n[0]));
  const [t, setTweak] = useTweaks<TweakState>(TWEAK_DEFAULTS);

  // drive the theme through CSS custom properties on the board root —
  // the board eats its own dog food.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ds-board");
    if (!root) return;
    const r = root.style;
    const th: ThemeTriple = THEMES[t.theme] ?? THEMES.Spectrum!;
    r.setProperty("--ds-accent", th.a);
    r.setProperty("--ds-accent2", th.b);
    r.setProperty("--ds-accent3", th.c);
    r.setProperty("--ds-glow-a", `color-mix(in srgb, ${th.a} 16%, transparent)`);
    r.setProperty("--ds-glow-b", `color-mix(in srgb, ${th.c} 14%, transparent)`);
    r.setProperty("--ds-canvas", CANVASES[t.canvas] ?? CANVASES.Void!);
    r.setProperty("--ds-radius", `${t.radius}px`);
    r.setProperty("--ds-glass", `${t.glass}px`);
    r.setProperty("--ds-grain", t.grain ? "0.022" : "0");
  }, [t.theme, t.canvas, t.radius, t.glass, t.grain]);

  // scroll progress bar
  useEffect(() => {
    const bar = document.getElementById("ds-scroll-progress");
    if (!bar) return;
    const onScroll = (): void => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ds-board" data-screen-label="MLAI Design Upgrade v2" style={{ background: "var(--ds-canvas)" }}>
      <style>{BOARD_CSS}</style>
      <div id="ds-scroll-progress" className="ds-scroll-progress" />
      <div className="ds-grain" />

      <Sidebar active={active} />

      {/* ambient page glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(50% 35% at 60% -5%, var(--ds-glow-a), transparent 70%), radial-gradient(40% 40% at 100% 100%, var(--ds-glow-b), transparent 70%)",
        }}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="MLAI theme" />
        <TweakRadio
          label="Spectrum"
          value={t.theme}
          options={["Spectrum", "Cyan", "Violet"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakRadio
          label="…more"
          value={t.theme}
          options={["Aurora", "Ember"]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakSelect
          label="Canvas tone"
          value={t.canvas}
          options={["Void", "Ink", "Slate", "Plum"]}
          onChange={(v) => setTweak("canvas", v)}
        />
        <TweakSection label="Form" />
        <TweakSlider
          label="Card radius"
          value={t.radius}
          min={8}
          max={28}
          step={1}
          unit="px"
          onChange={(v) => setTweak("radius", v)}
        />
        <TweakSlider
          label="Glass blur"
          value={t.glass}
          min={0}
          max={28}
          step={1}
          unit="px"
          onChange={(v) => setTweak("glass", v)}
        />
        <TweakSection label="Atmosphere" />
        <TweakToggle label="Film grain" value={t.grain} onChange={(v) => setTweak("grain", v)} />
      </TweaksPanel>

      <main className="relative z-10 lg:pl-64">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          {/* hero header */}
          <header className="pt-20 pb-16 max-w-3xl">
            <Eyebrow color="#a855f7">Design System Upgrade · Response to spec</Eyebrow>
            <h1
              className="font-bold text-white tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(40px,7vw,76px)", lineHeight: 1.0, letterSpacing: "-0.035em" }}
            >
              Not more glass.
              <br />A real <span className="t-grad">system</span> underneath.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed text-pretty">
              The upgrade spec asks for things MLAI already ships. This is the version that actually moves the needle:
              a reconciled palette, a four-tier elevation ramp, one declared light direction, formal spacing rhythm, and
              the whole thing applied to a live page.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {HERO_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-medium text-slate-300"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </header>

          <div className="space-y-28 pb-32">
            <div id="review"><Reveal><ReviewSection /></Reveal></div>
            <div id="color"><Reveal><ColorSection /></Reveal></div>
            <div id="elevation"><Reveal><ElevationSection /></Reveal></div>
            <div id="spacing"><Reveal><SpacingSection /></Reveal></div>
            <div id="type"><Reveal><TypeSection /></Reveal></div>
            <div id="light"><Reveal><LightSection /></Reveal></div>
            <div id="components"><Reveal><ComponentsSection /></Reveal></div>
            <div id="applied"><Reveal><AppliedSection /></Reveal></div>
            <div id="tokens"><Reveal><TokensSection /></Reveal></div>
          </div>

          <footer className="border-t border-white/7 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <Mark size={30} />
              <div>
                <div className="text-white font-semibold text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>MLAI Corporation</div>
                <Mono className="text-[11px] text-slate-500">Design System Upgrade · v2.0</Mono>
              </div>
            </div>
            <Mono className="text-[11px] text-slate-600">Infrastructure for resilient intelligence</Mono>
          </footer>
        </div>
      </main>
    </div>
  );
}
