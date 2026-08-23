/* Hero — galaxy canvas, eyebrow pill, gradient headline, CTAs, persona legend. */
import GalaxyCanvas from "./GalaxyCanvas.tsx";
import { IArrow, ILock } from "./Icons.tsx";

const PERSONAS: ReadonlyArray<readonly [name: string, role: string, color: string]> = [
  ["Abbey", "proof · verified", "var(--persona-abbey)"],
  ["Aviva", "research · vision", "var(--persona-aviva)"],
  ["Abi", "interactive · fast", "var(--persona-abi)"],
];

interface PersonaDotProps {
  name: string;
  role: string;
  color: string;
}

function PersonaDot({ name, role, color }: PersonaDotProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}`,
          flexShrink: 0,
        }}
      />
      <div style={{ lineHeight: 1.15 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-faint)",
            letterSpacing: "0.04em",
          }}
        >
          {role}
        </div>
      </div>
    </div>
  );
}

export interface HeroProps {
  onAccess: () => void;
}

export default function Hero({ onAccess }: HeroProps) {
  const [abbey, aviva, abi] = PERSONAS;
  if (!abbey || !aviva || !abi) return null;

  return (
    <section
      style={{
        position: "relative",
        minHeight: "calc(100vh - 60px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GalaxyCanvas speed={1.6} glow={1.1} chain={true} />
      {/* vignette + floor fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 72% 72% at 50% 46%, transparent 30%, rgba(5,5,9,0.8) 84%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          height: "33%",
          pointerEvents: "none",
          background: "linear-gradient(to top, var(--surface-0), transparent)",
        }}
      />

      <div
        className="mk-rise"
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 24px",
          maxWidth: 880,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--hair-strong)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            marginBottom: 28,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "var(--proof)" }}>
            <ILock s={13} />
          </span>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Privacy-first AI infrastructure
          </span>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--text-faint)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-dim)",
              letterSpacing: "0.04em",
            }}
          >
            Zig · local-first
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "var(--text)",
            fontSize: "clamp(38px, 7vw, 76px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          The infrastructure layer for
          <span
            style={{
              display: "block",
              backgroundImage: "linear-gradient(100deg,#67e8f9,#60a5fa,#c084fc)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              paddingBottom: "0.08em",
              animation: "mkSheen 6s linear infinite",
            }}
          >
            private, high-performance AI
          </span>
        </h1>
        <p
          style={{
            marginTop: 24,
            fontSize: "clamp(15px, 2vw, 20px)",
            lineHeight: 1.55,
            color: "rgba(226,232,240,0.85)",
            maxWidth: 620,
            marginInline: "auto",
          }}
        >
          From the vector engine up — WDBX, the ABI framework, and three minds in one
          system. Fast by design, private by default, verifiable by architecture.
        </p>
        <div
          style={{
            marginTop: 34,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onAccess}
            className="mk-btn-lift"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 24px",
              borderRadius: "var(--radius-pill)",
              border: 0,
              background: "#fff",
              color: "#050509",
              fontWeight: 600,
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              boxShadow: "0 12px 30px -8px rgba(34,211,238,0.5)",
            }}
          >
            Explore the stack <IArrow s={16} />
          </button>
          <button
            className="mk-btn-sec"
            style={{
              padding: "13px 24px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--hair-strong)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--text)",
              fontWeight: 500,
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Meet Abbey
          </button>
        </div>
        <div
          style={{
            marginTop: 48,
            display: "inline-flex",
            alignItems: "center",
            gap: 24,
            padding: "14px 22px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--hair)",
            backdropFilter: "blur(10px)",
          }}
        >
          <PersonaDot name={abbey[0]} role={abbey[1]} color={abbey[2]} />
          <span style={{ width: 1, height: 28, background: "var(--hair-strong)" }} />
          <PersonaDot name={aviva[0]} role={aviva[1]} color={aviva[2]} />
          <span style={{ width: 1, height: 28, background: "var(--hair-strong)" }} />
          <PersonaDot name={abi[0]} role={abi[1]} color={abi[2]} />
        </div>
      </div>

      {/* scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
          }}
        >
          scroll
        </span>
        <span
          style={{
            width: 1,
            height: 28,
            background: "linear-gradient(to bottom, var(--text-faint), transparent)",
          }}
        />
      </div>
    </section>
  );
}
