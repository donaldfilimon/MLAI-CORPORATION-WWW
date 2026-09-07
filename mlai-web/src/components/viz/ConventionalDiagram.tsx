import { T } from "@/lib/tokens";

const BOXES = [
  { x: 20, label: "INFERENCE", sub: "GPU host" },
  { x: 168, label: "INDEX", sub: "vector svc" },
  { x: 316, label: "DATA", sub: "object store" },
];

/** The contrast case: three services, two network hops. */
export function ConventionalDiagram() {
  return (
    <svg viewBox="0 0 420 260" className="block h-auto w-full" role="img"
      aria-label="Conventional architecture with network hops between separate services">
      <text x="210" y="16" textAnchor="middle" className="font-mono" fontSize="9.5"
        letterSpacing="2.4" fill={T.dim}>SEPARATE SERVICES</text>

      {BOXES.map((r) => (
        <g key={r.label}>
          <rect x={r.x} y="86" width="84" height="84" rx="10" fill="rgba(255,255,255,0.015)" stroke={T.line} />
          <rect x={r.x + 8} y="94" width="68" height="4" rx="2" fill={T.dim} opacity="0.5" />
          <text x={r.x + 42} y="126" textAnchor="middle" className="font-mono" fontSize="9.5"
            letterSpacing="1.4" fill={T.faint}>{r.label}</text>
          <text x={r.x + 42} y="144" textAnchor="middle" className="font-mono" fontSize="9"
            fill={T.dim}>{r.sub}</text>
        </g>
      ))}

      {([[104, 168], [252, 316]] as const).map(([a, b], i) => {
        const mid = (a + b) / 2;
        return (
          <g key={i}>
            <line x1={a} y1="128" x2={b} y2="128" stroke={T.dim} strokeWidth="1" strokeDasharray="2 6" />
            <text x={mid} y="118" textAnchor="middle" className="font-mono" fontSize="8.5" fill={T.dim}>network</text>
            <path d={`M${mid - 5} 136 l5 5 l5 -5`} stroke={T.dim} strokeWidth="1" fill="none" />
          </g>
        );
      })}

      <text x="210" y="200" textAnchor="middle" className="font-mono" fontSize="9"
        letterSpacing="1.2" fill={T.dim}>SERIALIZE · TRANSFER · DESERIALIZE · REPEAT</text>
    </svg>
  );
}
