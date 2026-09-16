// Re-export shim. The easing curves and the playback clock live in
// @mlai/trailer-engine (framework-agnostic, Node-testable, no React, no DOM).
// Kept so the ~13 `./easing` and `../easing` importers under src/film/ stay
// unchanged; new code should import from the package directly.
export type { EaseFn } from "@mlai/trailer-engine";
export {
  Easing,
  MAX_FRAME_DT,
  animate,
  clamp,
  fade,
  frameDelta,
  interpolate,
  step,
} from "@mlai/trailer-engine";
