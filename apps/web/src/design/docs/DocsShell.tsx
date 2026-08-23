/* MLAI docs — shell: top nav, sidebar tree, on-this-page, search palette. */
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ISearch, IBook, IExternal } from "./Icons";
import type { TocEntry } from "./DocsContent";

/** A leaf nav entry: [route id, label]. */
export type TreeLeaf = readonly [string, string];
/** A nav group: [group label, leaves]. */
export type TreeGroup = readonly [string, readonly TreeLeaf[]];

export const TREE: readonly TreeGroup[] = [
  ["Getting started", [["quickstart", "Quickstart"]]],
  [
    "WDBX",
    [
      ["wdbx", "The vector runtime"],
      ["hnsw", "HNSW parameters"],
    ],
  ],
  ["ABI · Personas", [["personas", "Three minds, one system"]]],
];

export const FLAT: readonly TreeLeaf[] = TREE.flatMap(([, items]) => items);

export function SearchPalette({
  open,
  onClose,
  setRoute,
}: {
  open: boolean;
  onClose: () => void;
  setRoute: (id: string) => void;
}): ReactNode {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent): void => {
      if (open && e.key === "Escape") onClose();
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  const items = FLAT.filter((n) => n[1].toLowerCase().includes(q.toLowerCase()));
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        paddingTop: 110,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          height: "fit-content",
          background: "var(--surface-4)",
          border: "1px solid var(--hair-hi)",
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
            placeholder="Search the docs…"
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
        <div style={{ padding: 8, maxHeight: 320, overflowY: "auto" }}>
          {items.length === 0 && (
            <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--text-faint)" }}>No matches.</div>
          )}
          {items.map(([id, label]) => (
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
                <IBook s={15} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopNav({ onSearch }: { onSearch: () => void }): ReactNode {
  return (
    <header
      style={{
        height: 58,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid var(--hair)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        background: "rgba(5,5,9,0.82)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-label="MLAI"
          className="bg-linear-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shrink-0"
          style={{ width: 28, height: 28, borderRadius: 8 }}
        >
          <span className="text-white font-black" style={{ fontSize: 13, lineHeight: 1, fontFamily: "var(--font-display)" }}>
            M
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "var(--text)",
            fontSize: 14,
          }}
        >
          MLAI
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>docs</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            minWidth: 180,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--hair)",
            background: "var(--surface-1)",
            color: "var(--text-faint)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}
        >
          <ISearch s={14} />
          <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              border: "1px solid var(--hair)",
              borderRadius: 5,
              padding: "1px 5px",
            }}
          >
            ⌘K
          </kbd>
        </button>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            color: "var(--text-dim)",
            textDecoration: "none",
          }}
          className="dk-extlink"
        >
          GitHub <IExternal s={13} />
        </a>
      </div>
    </header>
  );
}

export function SideTree({
  route,
  setRoute,
}: {
  route: string;
  setRoute: (id: string) => void;
}): ReactNode {
  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        borderRight: "1px solid var(--hair)",
        padding: "26px 16px",
        overflowY: "auto",
      }}
      className="dk-tree"
    >
      {TREE.map(([group, items]) => (
        <div key={group} style={{ marginBottom: 22 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--text-faint)",
              padding: "0 10px",
              marginBottom: 8,
            }}
          >
            {group}
          </div>
          {items.map(([id, label]) => {
            const on = id === route;
            return (
              <button
                key={id}
                onClick={() => setRoute(id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "block",
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13.5,
                  fontWeight: on ? 600 : 400,
                  color: on ? "var(--text)" : "var(--text-dim)",
                  background: on ? "var(--action-soft)" : "transparent",
                  boxShadow: on ? "inset 2px 0 0 var(--action)" : "none",
                  transition: "all var(--dur-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!on) e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  if (!on) e.currentTarget.style.color = "var(--text-dim)";
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

export function OnThisPage({
  toc,
  active,
  onJump,
}: {
  toc: readonly TocEntry[];
  active: string | null;
  onJump: (id: string) => void;
}): ReactNode {
  return (
    <aside
      style={{ width: 200, flexShrink: 0, padding: "32px 20px", overflowY: "auto" }}
      className="dk-toc"
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--text-faint)",
          marginBottom: 12,
        }}
      >
        On this page
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 9, borderLeft: "1px solid var(--hair)" }}
      >
        {toc.map(([id, label]) => (
          <button
            key={id}
            onClick={() => onJump(id)}
            style={{
              textAlign: "left",
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 12.5,
              lineHeight: 1.3,
              padding: "0 0 0 14px",
              marginLeft: -1,
              borderLeft: `2px solid ${active === id ? "var(--spectrum-cyan)" : "transparent"}`,
              color: active === id ? "var(--text)" : "var(--text-faint)",
              transition: "color var(--dur-fast)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
