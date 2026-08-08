import type { ReactNode } from "react";
import { LogoMark } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

/** The default cyan→sky gradient mark, at both sizes. */
export const Gradient = () => (
  <Ground>
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <LogoMark size="sm" />
      <LogoMark size="md" />
    </div>
  </Ground>
);

/**
 * The mono variant collapses to `currentColor`, so the wrapper sets the ink —
 * here full white, as it appears in the navbar.
 */
export const Mono = () => (
  <Ground>
    <div style={{ display: "flex", gap: 20, alignItems: "center", color: "#fff" }}>
      <LogoMark size="sm" mono />
      <LogoMark size="md" mono />
    </div>
  </Ground>
);

/**
 * In situ: the gradient mark beside the wordmark. `title` is deliberately
 * omitted — the adjacent text already names the brand, and labelling the mark
 * too would announce it twice. `Logo.tsx` composes it the same way.
 */
export const WithWordmark = () => (
  <Ground>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <LogoMark size="md" />
      <span
        style={{
          fontFamily: "Spectral, Georgia, serif",
          fontSize: 20,
          letterSpacing: "-0.01em",
          color: "#fff",
        }}
      >
        MLAI <span style={{ color: "#93a1b8" }}>Corporation</span>
      </span>
    </div>
  </Ground>
);
