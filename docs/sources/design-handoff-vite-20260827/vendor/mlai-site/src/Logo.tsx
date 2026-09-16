import * as React from "react";

/* ── MLAI logo system ────────────────────────────────────────────────────────
   The mark encodes the company thesis literally: "three layers, one chip."
   A rounded-square chip (Apple-flat language) holds three nested layers —
   storage (cyan) / compute (violet) / application (emerald), bottom to top —
   the same order the products stack on silicon. The notches read as chip pins.

   Variants:
     <LogoMark/>      glyph only (square), for favicons / app icons / tight spots
     <Logo/>          glyph + "MLAI" wordmark lockup (default, for the nav)
     <LogoMark mono/> single-color glyph that inherits currentColor
*/

export function LogoMark({
  size = 32,
  mono = false,
  title = "MLAI",
}: {
  size?: number;
  mono?: boolean;
  title?: string;
}) {
  const uid = React.useId();
  const g = `mlai-grad-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={g} x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00D4FF" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* chip body — rounded square, Apple-flat */}
      <rect
        x="4.5"
        y="4.5"
        width="39"
        height="39"
        rx="11"
        stroke={mono ? "currentColor" : `url(#${g})`}
        strokeWidth="2.5"
        opacity={mono ? 0.9 : 1}
      />

      {/* chip pins — top & bottom */}
      {[16, 24, 32].map((x) => (
        <React.Fragment key={x}>
          <rect x={x - 1} y="1.5" width="2" height="3.5" rx="1" fill={mono ? "currentColor" : `url(#${g})`} opacity="0.55" />
          <rect x={x - 1} y="43" width="2" height="3.5" rx="1" fill={mono ? "currentColor" : `url(#${g})`} opacity="0.55" />
        </React.Fragment>
      ))}

      {/* three nested layers — storage / compute / application (bottom→top) */}
      {mono ? (
        <>
          <rect x="13" y="28" width="22" height="4.5" rx="2.25" fill="currentColor" opacity="0.55" />
          <rect x="13" y="21.75" width="22" height="4.5" rx="2.25" fill="currentColor" opacity="0.78" />
          <rect x="13" y="15.5" width="22" height="4.5" rx="2.25" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="13" y="28" width="22" height="4.5" rx="2.25" fill="#00D4FF" />
          <rect x="13" y="21.75" width="22" height="4.5" rx="2.25" fill="#7C3AED" />
          <rect x="13" y="15.5" width="22" height="4.5" rx="2.25" fill="#10B981" />
        </>
      )}
    </svg>
  );
}

export function Logo({
  size = 30,
  mono = false,
  className = "",
}: {
  size?: number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} mono={mono} />
      <span className="font-display text-xl font-bold tracking-[0.18em] text-white">MLAI</span>
    </span>
  );
}
