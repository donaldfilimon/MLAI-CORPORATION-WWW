import { T } from "@/lib/tokens";

const REGIONS = [
  { x: 48, label: "INFERENCE", sub: "ABI", color: T.abi },
  { x: 168, label: "INDEX", sub: "WDBX", color: T.wdbx },
  { x: 288, label: "DATA", sub: "blocks", color: T.abbey },
];

/** The signature visual: one boundary, three regions, no crossing. */
export function ChipDiagram() {
  return (
    <svg viewBox="0 0 420 260" className="block h-auto w-full" role="img"
      aria-label="Inference, index, and data inside one unified-memory boundary">
      <defs>
        <linearGradient id="die-stroke" x1="0" y1="0" x2="420" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={T.wdbx} stopOpacity="0.5" />
          <stop offset="1" stopColor={T.aviva} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="die-fill" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={T.wdbx} stopOpacity="0.05" />
          <stop offset="1" stopColor={T.aviva} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <rect x="14" y="26" width="392" height="212" rx="20" fill="url(#die-fill)" stroke="url(#die-stroke)" strokeWidth="1.5" />
      <rect x="26" y="38" width="368" height="188" rx="14" fill="none" stroke={T.line} strokeDasharray="3 5" />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} opacity="0.4">
          <line x1={60 + i * 62} y1="20" x2={60 + i * 62} y2="26" stroke={T.dim} strokeWidth="2" />
          <line x1={60 + i * 62} y1="238" x2={60 + i * 62} y2="244" stroke={T.dim} strokeWidth="2" />
        </g>
      ))}

      <text x="210" y="16" textAnchor="middle" className="font-mono" fontSize="9.5"
        letterSpacing="2.4" fill={T.faint}>UNIFIED MEMORY</text>

      {REGIONS.map((r) => (
        <g key={r.label}>
          <rect x={r.x} y="86" width="84" height="84" rx="10" fill={`${r.color}0F`} stroke={`${r.color}55`} />
          <rect x={r.x + 8} y="94" width="68" height="4" rx="2" fill={r.color} opacity="0.45" />
          <text x={r.x + 42} y="126" textAnchor="middle" className="font-mono" fontSize="9.5"
            letterSpacing="1.4" fill={r.color}>{r.label}</text>
          <text x={r.x + 42} y="144" textAnchor="middle" className="font-mono" fontSize="9"
            fill={T.faint}>{r.sub}</text>
        </g>
      ))}

      {[[132, 168], [252, 288]].map(([a, b], i) => (
        <g key={i}>
          <line x1={a} y1="128" x2={b} y2="128" stroke={T.lineHi} strokeWidth="1"
            strokeDasharray="4 4" className="dash" />
          <circle r="2.6" fill={T.signal} cy="128">
            <animate attributeName="cx" values={`${a};${b};${a}`} dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="3.2s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      <text x="210" y="200" textAnchor="middle" className="font-mono" fontSize="9"
        letterSpacing="1.2" fill={T.faint}>NO NETWORK BOUNDARY CROSSED</text>
      <text x="210" y="252" textAnchor="middle" className="font-mono" fontSize="9"
        letterSpacing="2" fill={T.dim}>APPLE SILICON</text>
    </svg>
  );
}
