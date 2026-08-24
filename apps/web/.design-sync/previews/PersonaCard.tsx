import type { ReactNode } from "react";
import { PersonaCard } from "mlai-corporation-www";

/** The Lab ink ground the design system is built for. */
const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ background: "#05070d", padding: 28, borderRadius: 12 }}>{children}</div>
);

/** The full roster, as it appears beside the routing explainer. */
export const FullRoster = () => (
  <Ground>
    <div style={{ maxWidth: 380 }}>
      <PersonaCard
        personas={[
          { key: "abbey", name: "Abbey", role: "Empathetic, open-ended reasoning." },
          { key: "aviva", name: "Aviva", role: "Direct answers, token-frugal." },
          { key: "abi", name: "Abi", role: "Routes between the two, or blends them." },
        ]}
      />
    </div>
  </Ground>
);

/** Custom title and a two-persona subset — the pair Abi chooses between. */
export const RoutingPair = () => (
  <Ground>
    <div style={{ maxWidth: 380 }}>
      <PersonaCard
        title="Who answers this turn"
        personas={[
          { key: "abbey", name: "Abbey", role: "Long-form reasoning when the ask is open-ended." },
          { key: "aviva", name: "Aviva", role: "Short, literal answers when the ask is closed." },
        ]}
      />
    </div>
  </Ground>
);
