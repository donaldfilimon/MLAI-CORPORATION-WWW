/* Console shell — sidebar nav, top bar, and ⌘K command palette. */
import { useEffect, useState } from "react";
import {
  IActivity,
  IChevron,
  IDb,
  ILayers,
  IMsg,
  ISearch,
  ISettings,
  type IconComponent,
} from "./Icons.tsx";

export type Route = "overview" | "telemetry" | "personas" | "memory" | "settings";

type NavItem = readonly [route: Route, label: string, Icon: IconComponent];

export const NAV: NavItem[] = [
  ["overview", "Overview", IActivity],
  ["telemetry", "WDBX Telemetry", IDb],
  ["personas", "Personas", IMsg],
  ["memory", "Memory", ILayers],
  ["settings", "Settings", ISettings],
];

export const TITLES: Record<Route, string> = {
  overview: "Overview",
  telemetry: "WDBX Telemetry",
  personas: "Personas",
  memory: "Verifiable Memory",
  settings: "Settings",
};

interface CmdPaletteProps {
  open: boolean;
  onClose: () => void;
  setRoute: (route: Route) => void;
}

export function CmdPalette({ open, onClose, setRoute }: CmdPaletteProps) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  const items = NAV.filter((n) => n[1].toLowerCase().includes(q.toLowerCase()));
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        paddingTop: 120,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          height: "fit-content",
          background: "var(--surface-4)",
          border: "1px solid var(--hair-strong)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-4)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid var(--hair)",
          }}
        >
          <span style={{ color: "var(--text-faint)" }}>
            <ISearch s={16} />
          </span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Go to…"
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              outline: "none",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
            }}
          />
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-faint)",
              border: "1px solid var(--hair)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            esc
          </kbd>
        </div>
        <div style={{ padding: 8 }}>
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setRoute(id);
                onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: 0,
                background: "transparent",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: "var(--spectrum-cyan)" }}>
                <Icon s={16} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  route: Route;
  setRoute: (route: Route) => void;
}

export function Sidebar({ route, setRoute }: SidebarProps) {
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: "var(--surface-1)",
        borderRight: "1px solid var(--hair)",
        display: "flex",
        flexDirection: "column",
        padding: "18px 14px",
      }}
      className="cn-sidebar"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 18px" }}>
        <img src="/mlai-mark.svg" width="30" height="30" alt="MLAI" />
        <div style={{ lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: "var(--text)",
              fontSize: 14,
            }}
          >
            MLAI
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>console</div>
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map(([id, label, Icon]) => {
          const on = id === route;
          return (
            <button
              key={id}
              onClick={() => setRoute(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                border: 0,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                fontWeight: on ? 600 : 500,
                textAlign: "left",
                color: on ? "var(--text)" : "var(--text-dim)",
                background: on ? "var(--action-soft)" : "transparent",
                boxShadow: on ? "inset 2px 0 0 var(--action)" : "none",
                transition: "all var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                if (!on) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!on) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: on ? "var(--action)" : "var(--text-faint)" }}>
                <Icon s={17} />
              </span>
              {label}
            </button>
          );
        })}
      </nav>
      <div
        style={{
          marginTop: "auto",
          padding: 12,
          borderRadius: "var(--radius-md)",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--hair)",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", marginBottom: 8 }}>
          PERSONAS ONLINE
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(
            [
              ["Abbey", "var(--persona-abbey)"],
              ["Aviva", "var(--persona-aviva)"],
              ["Abi", "var(--persona-abi)"],
            ] as const
          ).map(([n, c]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}` }} />
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface TopbarProps {
  route: Route;
  onCmd: () => void;
}

export function Topbar({ route, onCmd }: TopbarProps) {
  return (
    <header
      style={{
        height: 58,
        flexShrink: 0,
        borderBottom: "1px solid var(--hair)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(5,5,9,0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-faint)",
        }}
      >
        <span>mlai</span>
        <IChevron s={13} />
        <span style={{ color: "var(--text-dim)" }}>{TITLES[route]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onCmd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 11px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--hair)",
            background: "transparent",
            color: "var(--text-faint)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
        >
          <ISearch s={13} />
          ⌘K
        </button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            padding: "5px 11px",
            borderRadius: 999,
            border: "1px solid rgba(52,211,153,0.3)",
            color: "var(--proof)",
            background: "rgba(52,211,153,0.1)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--proof)", boxShadow: "0 0 8px var(--proof)" }} />
          on-device
        </span>
      </div>
    </header>
  );
}
