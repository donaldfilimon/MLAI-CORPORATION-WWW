/* MLAI console kit — Lucide-style inline icons.
   Converted from the in-browser Babel prototype to typed ES modules. */
import type { CSSProperties, ReactNode } from "react";

export interface IcoProps {
  /** SVG path content (one or more <path>/<circle>/<rect>/<ellipse>). */
  d?: ReactNode;
  /** Square size in px. */
  s?: number;
  style?: CSSProperties;
}

export function Ico({ d, s = 16, style }: IcoProps) {
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

/** Props accepted by every concrete icon (everything but the path `d`). */
export type IconProps = Omit<IcoProps, "d">;

export function IActivity(p: IconProps) {
  return <Ico {...p} d={<path d="M22 12h-4l-3 9L9 3l-3 9H2" />} />;
}

export function IDb(p: IconProps) {
  return (
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
}

export function IMsg(p: IconProps) {
  return <Ico {...p} d={<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />} />;
}

export function ILayers(p: IconProps) {
  return <Ico {...p} d={<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />} />;
}

export function ISettings(p: IconProps) {
  return (
    <Ico
      {...p}
      d={
        <>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </>
      }
    />
  );
}

export function ISearch(p: IconProps) {
  return (
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
}

export function IChevron(p: IconProps) {
  return <Ico {...p} d={<path d="m9 18 6-6-6-6" />} />;
}

export function ISend(p: IconProps) {
  return (
    <Ico
      {...p}
      d={
        <>
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </>
      }
    />
  );
}

export function ISpark(p: IconProps) {
  return (
    <Ico
      {...p}
      d={
        <path d="M9.94 14.66A4 4 0 0 1 5.34 10 4 4 0 0 1 10 5.34a4 4 0 0 1 4.66-4.6 4 4 0 0 1 4.6 4.66A4 4 0 0 1 18.66 10a4 4 0 0 1-4.6 4.66 4 4 0 0 1-4.12 0Z" />
      }
    />
  );
}

export function IZap(p: IconProps) {
  return (
    <Ico
      {...p}
      d={
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      }
    />
  );
}

export function IFlow(p: IconProps) {
  return (
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
}

export function IShield(p: IconProps) {
  return (
    <Ico
      {...p}
      d={
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      }
    />
  );
}

/** A concrete icon component (takes only `IconProps`). */
export type IconComponent = (props: IconProps) => ReactNode;
