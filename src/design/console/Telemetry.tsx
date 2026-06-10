/* WDBX Telemetry — arc gauges, sparkline streams, shard health.
   Simulated / illustrative live data. Adapted from the brand's lab. */
import { useEffect, useState } from "react";

interface ArcGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  decimals?: number;
}

function ArcGauge({ label, value, max, unit, color, decimals = 0 }: ArcGaugeProps) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circ = Math.PI * r * 1.5;
  const pct = Math.min(1, value / max);
  const startX = cx - r * Math.cos(Math.PI / 4);
  const startY = cy + r * Math.sin(Math.PI / 4);
  const endX = cx + r * Math.cos(Math.PI / 4);
  const endY = cy + r * Math.sin(Math.PI / 4);
  const arc = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-md)",
        padding: 14,
        boxShadow: "var(--shadow-2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg width="100%" viewBox="0 0 140 120" style={{ maxWidth: 150, display: "block" }}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset .6s var(--ease-out)" }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#fafafa" style={{ font: "700 26px JetBrains Mono, monospace" }}>
          {value.toFixed(decimals)}
        </text>
        <text x={cx} y={cy + 24} textAnchor="middle" fill="#71717a" style={{ font: "400 11px JetBrains Mono, monospace" }}>
          {unit}
        </text>
      </svg>
      <div style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color: string;
  label: string;
  unit: string;
}

function Sparkline({ data, color, label, unit }: SparklineProps) {
  const w = 300;
  const h = 70;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const span = data.length - 1 || 1;
  const pts = data
    .map((v, i) => `${(i / span) * w},${h - ((v - min) / (max - min || 1)) * (h - 8) - 4}`)
    .join(" ");
  const last = data.length > 0 ? (data[data.length - 1] as number) : 0;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-md)",
        padding: 16,
        boxShadow: "var(--shadow-2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color }}>
          {last.toFixed(1)}
          <span style={{ color: "var(--text-faint)", fontSize: 11 }}> {unit}</span>
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.08" />
      </svg>
    </div>
  );
}

interface Gauges {
  thru: number;
  p99: number;
  recall: number;
  mem: number;
}

type ShardState = "ok" | "warn" | "down";

const SHARD_COLORS: Record<ShardState, string> = { ok: "#34d399", warn: "#fbbf24", down: "#f87171" };

export function Telemetry() {
  const [g, setG] = useState<Gauges>({ thru: 78, p99: 9.4, recall: 94.6, mem: 1.48 });
  const [thruHist, setThruHist] = useState<number[]>(() => Array.from({ length: 30 }, () => 76 + Math.random() * 8));
  const [latHist, setLatHist] = useState<number[]>(() => Array.from({ length: 30 }, () => 8 + Math.random() * 3));
  const [shards, setShards] = useState<ShardState[]>(() => Array.from({ length: 12 }, (): ShardState => "ok"));

  useEffect(() => {
    const iv = setInterval(() => {
      setG((p) => ({
        thru: Math.max(60, Math.min(96, p.thru + (Math.random() - 0.5) * 7)),
        p99: Math.max(6, Math.min(16, p.p99 + (Math.random() - 0.5) * 1.6)),
        recall: Math.max(91, Math.min(97, p.recall + (Math.random() - 0.5) * 0.8)),
        mem: Math.max(1.2, Math.min(1.9, p.mem + (Math.random() - 0.5) * 0.08)),
      }));
      setThruHist((h) => [...h.slice(1), 70 + Math.random() * 22]);
      setLatHist((h) => [...h.slice(1), 7 + Math.random() * 6]);
      setShards((s) =>
        s.map((): ShardState => {
          const r = Math.random();
          return r > 0.97 ? "warn" : r > 0.995 ? "down" : "ok";
        }),
      );
    }, 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ position: "relative", display: "flex", width: 10, height: 10 }}>
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#34d399",
                opacity: 0.75,
                animation: "cnPing 1.4s cubic-bezier(0,0,.2,1) infinite",
              }}
            />
            <span style={{ position: "relative", borderRadius: "50%", width: 10, height: 10, background: "#34d399" }} />
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)" }}>wdbx-prod-01</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 999,
              border: "1px solid rgba(251,191,36,0.3)",
              color: "var(--signal)",
              background: "rgba(251,191,36,0.1)",
            }}
          >
            SIMULATED · ILLUSTRATIVE
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>live · 900ms tick</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(116px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
        className="cn-gauge-grid"
      >
        <ArcGauge label="Throughput" value={g.thru} max={100} unit="req/s" color="#22d3ee" />
        <ArcGauge label="p99 latency" value={g.p99} max={20} unit="ms" color="#a855f7" decimals={1} />
        <ArcGauge label="Recall@10" value={g.recall} max={100} unit="%" color="#34d399" decimals={1} />
        <ArcGauge label="Memory" value={g.mem} max={2} unit="GB" color="#fbbf24" decimals={2} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
        className="cn-spark-grid"
      >
        <Sparkline data={thruHist} color="#22d3ee" label="throughput stream" unit="req/s" />
        <Sparkline data={latHist} color="#a855f7" label="latency stream" unit="ms" />
      </div>
      <div>
        <div style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 500, marginBottom: 8 }}>shard health · 12 nodes</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {shards.map((s, i) => {
            const c = SHARD_COLORS[s];
            return (
              <div
                key={i}
                title={`shard-${i} · ${s}`}
                style={{
                  flex: 1,
                  minWidth: 22,
                  height: 28,
                  borderRadius: 6,
                  transition: "background .4s, box-shadow .4s",
                  background: `${c}33`,
                  border: `1px solid ${c}`,
                  boxShadow: s !== "ok" ? `0 0 10px ${c}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { ArcGauge, Sparkline };
