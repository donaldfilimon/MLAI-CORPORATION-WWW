import { useState } from "react";

// Interactive vector-angle visualization of cosine similarity — the core
// comparison primitive of vector search. Pure math; nothing to overclaim.
export function CosineSimDemo() {
  const [a, setA] = useState(25);
  const [b, setB] = useState(115);
  const ar = (a * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  const cos = Math.cos(ar - br);
  const cx = 110, cy = 110, R = 82;
  const ax = cx + Math.cos(ar) * R;
  const ay = cy - Math.sin(ar) * R;
  const bx = cx + Math.cos(br) * R;
  const by = cy - Math.sin(br) * R;
  const col = cos > 0.5 ? "#34d399" : cos > -0.1 ? "#fbbf24" : "#f87171";

  return (
    <div className="glass-card grid items-center gap-6 p-6 sm:grid-cols-2">
      <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[220px]" aria-label="Two vectors on a unit circle">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,.08)" />
        <line x1={20} y1={cy} x2={200} y2={cy} stroke="rgba(255,255,255,.05)" />
        <line x1={cx} y1={20} x2={cx} y2={200} stroke="rgba(255,255,255,.05)" />
        <path d={`M ${cx} ${cy} L ${ax} ${ay}`} stroke="#818cf8" strokeWidth="2.5" />
        <circle cx={ax} cy={ay} r="4" fill="#818cf8" />
        <path d={`M ${cx} ${cy} L ${bx} ${by}`} stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx={bx} cy={by} r="4" fill="#38bdf8" />
        <circle cx={cx} cy={cy} r="3" fill="#fff" />
      </svg>
      <div>
        <div className="text-5xl font-black" style={{ color: col }}>
          {cos.toFixed(3)}
        </div>
        <div className="mb-5 text-xs text-text-dim">cosine similarity (a · b / ‖a‖‖b‖)</div>
        <label className="mb-1 block text-xs text-indigo-300">Vector a — {a}°</label>
        <input
          type="range" min={0} max={360} value={a}
          onChange={(e) => setA(+e.target.value)}
          className="mb-4 w-full accent-indigo-400"
        />
        <label className="mb-1 block text-xs text-sky-300">Vector b — {b}°</label>
        <input
          type="range" min={0} max={360} value={b}
          onChange={(e) => setB(+e.target.value)}
          className="w-full accent-sky-400"
        />
      </div>
    </div>
  );
}
