// DesignHub.tsx — the /design surface. A floating switcher (bottom-center)
// between the design boards & UI kits. Each board is code-split via lazy() and
// only the active one is downloaded/mounted, so opening the hub is cheap and the
// heavy boards (canvas demos, the system board) load on demand.

import { useState, lazy, Suspense } from "react";

const BrandBoard = lazy(() => import("./brand/BrandBoard"));
const DesignBoard = lazy(() => import("./board/DesignBoard"));
const ShowcaseBoard = lazy(() => import("./showcase/ShowcaseBoard"));
const HeroBoard = lazy(() => import("./hero/HeroBoard"));
const LabBoard = lazy(() => import("./lab/LabBoard"));
const Marketing = lazy(() => import("./marketing/Marketing"));
const Console = lazy(() => import("./console/Console"));
const Docs = lazy(() => import("./docs/Docs"));

type Board = "brand" | "system" | "showcase" | "hero" | "lab" | "marketing" | "console" | "docs";

const TABS: Array<{ key: Board; label: string }> = [
  { key: "brand", label: "Brand" },
  { key: "system", label: "System" },
  { key: "showcase", label: "Showcase" },
  { key: "hero", label: "Hero" },
  { key: "lab", label: "Lab" },
  { key: "marketing", label: "Marketing" },
  { key: "console", label: "Console" },
  { key: "docs", label: "Docs" },
];

const BOARDS: Record<Board, React.LazyExoticComponent<() => React.ReactNode>> = {
  brand: BrandBoard,
  system: DesignBoard,
  showcase: ShowcaseBoard,
  hero: HeroBoard,
  lab: LabBoard,
  marketing: Marketing,
  console: Console,
  docs: Docs,
};

export function DesignHub() {
  const [board, setBoard] = useState<Board>("brand");
  const Active = BOARDS[board];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "auto", background: "var(--surface-0)" }}>
      <Suspense
        fallback={
          <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.3em" }}>
            LOADING
          </div>
        }
      >
        <Active />
      </Suspense>

      {/* floating board switcher */}
      <div
        style={{
          position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          display: "flex", gap: 4, padding: 5, borderRadius: 999, maxWidth: "92vw", overflowX: "auto",
          background: "rgba(12,13,20,0.82)", border: "1px solid var(--hair-hi)",
          backdropFilter: "blur(14px)", boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
        }}
      >
        {TABS.map((t) => {
          const active = t.key === board;
          return (
            <button
              key={t.key}
              onClick={() => setBoard(t.key)}
              style={{
                padding: "8px 16px", borderRadius: 999, cursor: "pointer", border: "none", whiteSpace: "nowrap",
                fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em",
                color: active ? "#06120c" : "var(--text-dim)",
                background: active ? "var(--spectrum-cyan)" : "transparent",
                transition: "background var(--dur-fast), color var(--dur-fast)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DesignHub;
