/* MLAI marketing kit — Lucide-style inline icons (stroke 2, round caps).
   Matches the brand's icon system (lucide.dev). */
import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface IconProps {
  /** Pixel size of the square icon. */
  s?: number;
  style?: CSSProperties;
}

/** A marketing-kit icon: takes IconProps, renders an inline SVG. */
export type IconComponent = (props: IconProps) => ReactElement;

interface IcoProps extends IconProps {
  d: ReactNode;
}

function Ico({ d, s = 16, style }: IcoProps) {
  return (
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
}

export const ILock = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    }
  />
);

export const IArrow = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    }
  />
);

export const ISearch = (p: IconProps) => (
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

export const IChevron = (p: IconProps) => <Ico {...p} d={<path d="m9 18 6-6-6-6" />} />;

export const IX = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <>
        <path d="M18 6 6 18" />
        <path d="M6 6l12 12" />
      </>
    }
  />
);

export const ICheck = (p: IconProps) => <Ico {...p} d={<path d="M20 6 9 17l-5-5" />} />;

export const IDb = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    }
  />
);

export const ILayers = (p: IconProps) => (
  <Ico {...p} d={<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />} />
);

export const ISpark = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <path d="M9.94 14.66A4 4 0 0 1 5.34 10 4 4 0 0 1 10 5.34a4 4 0 0 1 4.66-4.6 4 4 0 0 1 4.6 4.66A4 4 0 0 1 18.66 10a4 4 0 0 1-4.6 4.66 4 4 0 0 1-4.12 0Z" />
    }
  />
);

export const IShield = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    }
  />
);

export const IZap = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    }
  />
);

export const IFlow = (p: IconProps) => (
  <Ico
    {...p}
    d={
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
        <path d="M6 9v6a2 2 0 0 0 2 2h7" />
      </>
    }
  />
);
