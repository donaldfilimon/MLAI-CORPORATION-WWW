/** The MLAI mark. Three nodes = Abbey (emerald), core, Aviva (violet). */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role="img" aria-label="MLAI">
      <defs>
        <linearGradient id="mk-c" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22D3EE" /><stop offset="0.48" stopColor="#3B82F6" /><stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <radialGradient id="mk-s" cx="0.3" cy="0.12" r="0.7">
          <stop offset="0" stopColor="#FFF" stopOpacity="0.35" /><stop offset="0.55" stopColor="#FFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="128" height="128" rx="36" fill="url(#mk-c)" />
      <rect x="6.4" y="6.4" width="115.2" height="115.2" rx="29" fill="none" stroke="#fff" strokeOpacity="0.28" />
      <rect width="128" height="128" rx="36" fill="url(#mk-s)" />
      <text x="64" y="60" textAnchor="middle" dominantBaseline="central" fontFamily="Sora, sans-serif"
        fontWeight="800" fontSize="64" letterSpacing="-3.2" fill="#fff">M</text>
      <line x1="38.4" y1="102.4" x2="89.6" y2="102.4" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.8" />
      <circle cx="38.4" cy="102.4" r="5.6" fill="#34D399" />
      <circle cx="64" cy="102.4" r="5.6" fill="#FFFFFF" />
      <circle cx="89.6" cy="102.4" r="5.6" fill="#C4B5FD" />
    </svg>
  );
}
