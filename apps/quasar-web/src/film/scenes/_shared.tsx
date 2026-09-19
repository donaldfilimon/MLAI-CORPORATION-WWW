// scenes/_shared.tsx — helpers shared across scene modules.

import { fade } from "../easing";
import { useSprite } from "../engine";
import type { ReactNode } from "react";

// Fades a scene in/out at its edges based on the sprite's local time.
export function SceneBox({ inDur = 0.8, outDur = 0.8, children }: {
  inDur?: number; outDur?: number; children: ReactNode;
}) {
  const { localTime, duration } = useSprite();
  return <div style={{ position: "absolute", inset: 0, opacity: fade(localTime, duration, inDur, outDur) }}>{children}</div>;
}
