/* Nav + Command palette (⌘K) for the MLAI marketing site. */
import { useEffect, useState } from "react";
import { IChevron, ISearch } from "./Icons.tsx";

const NAV_LINKS = ["WDBX", "ABI Framework", "Personas", "Research"] as const;

const PALETTE_ITEMS: ReadonlyArray<readonly [string, string]> = [
  ["Home", "/"],
  ["WDBX runtime", "/wdbx"],
  ["ABI Framework", "/abi"],
  ["Meet Abbey", "/personas/abbey"],
  ["Benchmarks", "/benchmarks"],
  ["Research", "/research"],
  ["Docs", "/docs"],
  ["Request access", "/access"],
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function CommandPalette({ open, onClose }: CommandPaletteProps) {
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

  const items = PALETTE_ITEMS.filter((n) =>
    n[0].toLowerCase().includes(q.toLowerCase()),
  );

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
          maxWidth: 520,
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
            placeholder="Jump to a page…"
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
        <div style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
          {items.map((n) => (
            <a
              key={n[1]}
              href={n[1]}
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: "var(--text-dim)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--spectrum-cyan)" }}>
                  <IChevron s={14} />
                </span>
                {n[0]}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-faint)",
                }}
              >
                {n[1]}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface NavProps {
  onAccess: () => void;
}

export default function Nav({ onAccess }: NavProps) {
  const [cmd, setCmd] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(5,5,9,0.82)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <a
          href="/"
          onClick={(e) => e.preventDefault()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img src="/mlai-mark.svg" width="30" height="30" alt="MLAI" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "var(--text)",
              fontSize: 15,
            }}
          >
            MLAI
          </span>
        </a>
        <nav
          style={{ display: "flex", alignItems: "center", gap: 28 }}
          className="mk-navlinks"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                fontSize: 13,
                color: "var(--text-dim)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-dim)";
              }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setCmd(true)}
            title="Search (⌘K)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 10px",
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
            <span>⌘K</span>
          </button>
          <button
            onClick={onAccess}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              border: 0,
              color: "#fff",
              fontWeight: 500,
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              background: "linear-gradient(180deg,#3b82f6,#2563eb)",
              boxShadow:
                "0 8px 20px -6px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            Request access
          </button>
        </div>
      </div>
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    </header>
  );
}
