import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Galaxy } from "./Galaxy";

/** Canonical public site origin (matches sitemap / OG). */
export const SITE_URL = "https://mlai.dev";

/** Primary inbound for access / pilot requests. */
export const CONTACT_EMAIL = "enterprise@mlai.dev";

export const CONTACT_CHANNELS = [
  { label: "Enterprise", email: "enterprise@mlai.dev" },
  { label: "Investors", email: "invest@mlai.dev" },
  { label: "Careers", email: "careers@mlai.dev" },
] as const;

export const mono: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: "uppercase",
};

export const shell: CSSProperties = { maxWidth: 1152, margin: "0 auto", padding: "0 24px" };

export function Kicker({ color = "#00D4FF", children }: { color?: string; children: ReactNode }) {
  return (
    <p style={{ ...mono, fontSize: 12, letterSpacing: "0.24em", color, margin: 0 }}>{children}</p>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.12, letterSpacing: "-0.02em", color: "#fff", margin: "18px 0 0", maxWidth: 640 }}>
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 17, lineHeight: 1.7, color: "#94A3B8", maxWidth: 560, margin: "16px 0 0" }}>{children}</p>
  );
}

/** Full-bleed page band; tint=true renders on the raised panel color. */
export function Band({ tint = false, children }: { tint?: boolean; children: ReactNode }) {
  return (
    <div style={{ background: tint ? "#0A0E16" : undefined, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ ...shell, padding: "clamp(56px, 10vw, 96px) 24px" }}>{children}</div>
    </div>
  );
}

export function PillLink({ to, primary = false, color = "#00D4FF", children }: { to: string; primary?: boolean; color?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={primary ? "mlai-pill mlai-pill--primary" : "mlai-pill mlai-pill--ghost"}
      style={{ ["--pill" as string]: color }}
    >
      {children}
    </Link>
  );
}

/** Product-page hero: galaxy canvas + 64px grid (radial mask) + key light + floor fade. */
export function Hero({ accent, accent2, keyLight, children }: { accent: string; accent2: string; keyLight: string; children: ReactNode }) {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <Galaxy accent={accent} accent2={accent2} density={60} />
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 35% 20%,black,transparent)",
          maskImage: "radial-gradient(ellipse 70% 70% at 35% 20%,black,transparent)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 30% -10%," + keyLight + ",transparent 62%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, background: "linear-gradient(180deg,transparent,#05070B)" }} />
      <div style={{ position: "relative", ...shell, padding: "clamp(96px, 15vw, 132px) 24px 56px" }}>{children}</div>
    </div>
  );
}

/** Responsive 4-up stat row for product heroes — collapses via `.mlai-g4` media queries. */
export function HeroStats({ children }: { children: ReactNode }) {
  return (
    <div className="mlai-g4" style={{ marginTop: 48, width: "100%", minWidth: 0 }}>
      {children}
    </div>
  );
}

export function HeroTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      className="mlai-cta-title"
      style={{
        fontSize: "clamp(2.25rem, 6vw, 4rem)",
        margin: "22px 0 0",
        maxWidth: 900,
        animation: "mlaiRise 700ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {children}
    </h1>
  );
}

export function HeroSub({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 18, lineHeight: 1.7, color: "#94A3B8", maxWidth: 680, margin: "20px 0 0" }}>{children}</p>
  );
}

export const page: CSSProperties = {
  minHeight: "100vh",
  background: "#05070B",
  color: "#CBD5E1",
  fontFamily: "'Manrope', system-ui, sans-serif",
};
