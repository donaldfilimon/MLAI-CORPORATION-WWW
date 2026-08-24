/* Marketing — the full MLAI marketing page entry point.
   Composes Nav + Hero + Features + Personas + Footer over the GalaxyCanvas
   background, plus a Request-access modal. Self-contained: all kit-specific
   CSS not already in src/index.css is inlined once via the <style> below. */
import { useState } from "react";
import Features, { Footer } from "./Features.tsx";
import Hero from "./Hero.tsx";
import { ICheck, IX } from "./Icons.tsx";
import Nav from "./Nav.tsx";
import Personas from "./Personas.tsx";

/* Kit-specific CSS from the prototype's index.html <style> that is NOT
   already present in src/index.css. Tokens (--surface-*, --hair, etc.) and
   .glass/.eyebrow-style helpers come from src/index.css; only the marketing
   kit's bespoke keyframes, hover affordances, --hair-strong alias, .eyebrow
   helper, and responsive grid overrides are declared here. */
const KIT_CSS = `
.mk-scope {
  --hair-strong: var(--hair-hi);
}
.mk-scope .eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--spectrum-cyan);
}
@keyframes mkRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes mkSheen { to { background-position: 200% center; } }
@keyframes mkFade { from { opacity: 0; } to { opacity: 1; } }
.mk-rise { animation: mkRise 0.7s var(--ease-out) both; }
.mk-btn-lift { transition: transform var(--dur-base) var(--ease-out); }
.mk-btn-lift:hover { transform: translateY(-2px); }
.mk-btn-sec:hover { background: rgba(255,255,255,0.12); }
.mk-card:hover { border-color: var(--hair-strong); transform: translateY(-3px); }
@media (max-width: 860px) {
  .mk-scope .mk-navlinks { display: none !important; }
  .mk-scope .mk-feature-grid { grid-template-columns: 1fr !important; }
  .mk-scope .mk-stat-band { grid-template-columns: repeat(2, 1fr) !important; }
  .mk-scope .mk-personas-grid { grid-template-columns: 1fr !important; }
}
@media (prefers-reduced-motion: reduce) {
  .mk-scope * { animation: none !important; }
}
`;

interface AccessModalProps {
  open: boolean;
  onClose: () => void;
}

function AccessModal({ open, onClose }: AccessModalProps) {
  const [sent, setSent] = useState(false);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation: "mkFade .2s ease-out both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-4)",
          border: "1px solid var(--hair-strong)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-4)",
          padding: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/mlai-mark.svg" width="32" height="32" alt="MLAI" />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.18em",
                fontSize: 14,
              }}
            >
              MLAI
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--text-faint)",
              cursor: "pointer",
            }}
          >
            <IX s={18} />
          </button>
        </div>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(52,211,153,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                color: "var(--proof)",
              }}
            >
              <ICheck s={24} />
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--text-h4)",
                margin: "0 0 6px",
              }}
            >
              You&apos;re on the list
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)", margin: 0 }}>
              We&apos;ll reach out when your environment is provisioned.
            </p>
          </div>
        ) : (
          <>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "var(--text-h3)",
                margin: "0 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Request access
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 20px" }}>
              Private preview of WDBX + the ABI framework.
            </p>
            <label
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--text-faint)",
              }}
            >
              Work email
            </label>
            <input
              placeholder="you@company.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: 8,
                marginBottom: 18,
                padding: "12px 14px",
                background: "var(--surface-1)",
                border: "1px solid var(--hair)",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                outline: "none",
                boxShadow: "var(--shadow-1)",
              }}
            />
            <button
              onClick={() => setSent(true)}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "var(--radius-pill)",
                border: 0,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                background: "linear-gradient(180deg,#3b82f6,#2563eb)",
                boxShadow:
                  "0 12px 30px -8px rgba(59,130,246,0.8), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              Request access
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Marketing() {
  const [access, setAccess] = useState(false);
  const open = () => setAccess(true);
  return (
    <div className="mk-scope">
      <style>{KIT_CSS}</style>
      <Nav onAccess={open} />
      <Hero onAccess={open} />
      <Features />
      <Personas />
      <Footer />
      <AccessModal open={access} onClose={() => setAccess(false)} />
    </div>
  );
}
