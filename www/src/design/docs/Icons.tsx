/* MLAI docs kit — Lucide-style inline icons. */
import type { CSSProperties, ReactNode } from "react";

export interface IcoProps {
  /** Path/shape content rendered inside the svg. */
  d?: ReactNode;
  /** Square size in px. */
  s?: number;
  style?: CSSProperties;
}

export const Ico = ({ d, s = 16, style }: IcoProps): ReactNode => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {d}
  </svg>
);

/** Props passed to the concrete icon components (everything except `d`). */
export type IconProps = Omit<IcoProps, "d">;

export const ISearch = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    }
  />
);

export const IChevron = (p: IconProps): ReactNode => (
  <Ico {...p} d={<path d="m9 18 6-6-6-6" />} />
);

export const ICopy = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <rect width="14" height="14" x="8" y="8" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </>
    }
  />
);

export const ICheck = (p: IconProps): ReactNode => (
  <Ico {...p} d={<path d="M20 6 9 17l-5-5" />} />
);

export const IInfo = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    }
  />
);

export const IAlert = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    }
  />
);

export const IShield = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    }
  />
);

export const IBook = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    }
  />
);

export const IExternal = (p: IconProps): ReactNode => (
  <Ico
    {...p}
    d={
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    }
  />
);
