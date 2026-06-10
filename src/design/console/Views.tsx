/* Secondary console views — Overview, Verifiable Memory, Settings. */
import { useState } from "react";
import { Telemetry } from "./Telemetry.tsx";

interface StatCardProps {
  value: string;
  label: string;
  tint: string;
  sub?: string;
}

function StatCard({ value, label, tint, sub }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-md)",
        padding: 20,
        boxShadow: "var(--shadow-2)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 30,
          lineHeight: 1,
          backgroundImage: `linear-gradient(135deg,#fff,${tint})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>{label}</div>
      {sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

type ActivityEvent = readonly [title: string, detail: string, color: string, ago: string];

export function Overview() {
  const events: ActivityEvent[] = [
    ["Index rebuilt", "wdbx-prod-01 · HNSW · M=16", "var(--proof)", "2m"],
    ["Abi routed 3 sessions to Abbey", "intent: learning", "var(--persona-abi)", "11m"],
    ["Memory chain verified", "142,887 blocks · 0 mismatches", "var(--proof)", "26m"],
    ["Aviva: dense-mode reply", "sharding guidance", "var(--persona-aviva)", "40m"],
    ["Shard-7 recovered", "warn → ok", "var(--signal)", "1h"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="cn-stat-grid">
        <StatCard value="142.9k" label="Memory blocks" tint="#22d3ee" sub="SHA-256 chained" />
        <StatCard value="0.8ms" label="p99 search" tint="#60a5fa" sub="illustrative" />
        <StatCard value="12" label="Shards healthy" tint="#34d399" sub="of 12" />
        <StatCard value="3" label="Personas online" tint="#a855f7" sub="Abi · Abbey · Aviva" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="cn-overview-grid">
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            padding: 22,
            boxShadow: "var(--shadow-2)",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Live · WDBX
          </div>
          <Telemetry />
        </div>
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            padding: 22,
            boxShadow: "var(--shadow-2)",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Recent activity
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {events.map(([t, d, c, ago], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "11px 0",
                  borderBottom: i < events.length - 1 ? "1px solid var(--hair)" : 0,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c,
                    boxShadow: `0 0 8px ${c}`,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: "var(--text)" }}>{t}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{d}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{ago}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function hexOf(seed: number, n = 12): string {
  const ch = "0123456789abcdef";
  let s = "";
  let x = (seed * 2654435761) >>> 0;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    s += ch[(x >>> 8) & 15] ?? "0";
  }
  return s;
}

export function Memory() {
  const [tampered, setTampered] = useState<number | null>(null);
  const blocks = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div style={{ maxWidth: 760 }}>
      <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 8px" }}>
        Every write is hashed and linked to the previous block. Tamper with one and the chain rejects it on the next read —
        memory that defends itself.
      </p>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", marginBottom: 22 }}>
        Click a block to simulate a tamper.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {blocks.map((i) => {
          const bad = tampered === i;
          const broken = tampered !== null && i >= tampered;
          const c = bad ? "var(--danger)" : broken ? "var(--signal)" : "var(--proof)";
          return (
            <div key={i}>
              <div
                onClick={() => setTampered((t) => (t === i ? null : i))}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-2)",
                  border: `1px solid ${bad ? "var(--danger)" : "var(--hair)"}`,
                  boxShadow: bad ? "0 0 0 1px var(--danger)" : "var(--shadow-2)",
                  transition: "all var(--dur-base) var(--ease-out)",
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: c,
                    boxShadow: `0 0 8px ${c}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)" }}>block #{142882 + i}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: bad ? "var(--danger)" : "var(--text-faint)" }}>
                    sha256: {bad ? "fa11ed…" + hexOf(i + 99, 6) : hexOf(i, 12)}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    padding: "3px 9px",
                    borderRadius: 999,
                    color: c,
                    background: `color-mix(in srgb, ${c} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`,
                  }}
                >
                  {bad ? "TAMPERED" : broken ? "CHAIN BROKEN" : "VERIFIED"}
                </span>
              </div>
              {i < blocks.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 14,
                    marginLeft: 36,
                    background: broken && tampered !== null && i + 1 > tampered ? "var(--danger)" : "var(--hair-strong)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ToggleProps {
  on: boolean;
  onClick: () => void;
}

function Toggle({ on, onClick }: ToggleProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: 0,
        cursor: "pointer",
        padding: 3,
        background: on ? "var(--action)" : "rgba(255,255,255,0.12)",
        transition: "background var(--dur-fast)",
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transform: on ? "translateX(18px)" : "none",
          transition: "transform var(--dur-fast) var(--ease-out)",
        }}
      />
    </button>
  );
}

type SettingKey = "local" | "telemetry" | "chain" | "dense";
type SettingsState = Record<SettingKey, boolean>;
type SettingRow = readonly [key: SettingKey, title: string, detail: string];

export function Settings() {
  const [s, setS] = useState<SettingsState>({ local: true, telemetry: false, chain: true, dense: false });
  const rows: SettingRow[] = [
    ["local", "Local-first execution", "Keep all inference and storage on this device."],
    ["chain", "Verifiable memory", "SHA-256-chain every write; verify on read."],
    ["telemetry", "Share anonymized telemetry", "Off by default — privacy-first."],
    ["dense", "Default to Aviva's dense mode", "Skip scaffolding; maximum technical density."],
  ];
  return (
    <div style={{ maxWidth: 620 }}>
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--hair)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-2)",
          overflow: "hidden",
        }}
      >
        {rows.map(([k, t, d], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              padding: "18px 22px",
              borderBottom: i < rows.length - 1 ? "1px solid var(--hair)" : 0,
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>{d}</div>
            </div>
            <Toggle on={s[k]} onClick={() => setS((v) => ({ ...v, [k]: !v[k] }))} />
          </div>
        ))}
      </div>
    </div>
  );
}

export { StatCard };
