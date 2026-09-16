// @mlai/trailer-engine — framework-agnostic cinematic playback core.
//
// Nothing here may import React or reach for a bundler global. Browser APIs are
// allowed only where the capability is inherently one — Web Audio, canvas, rAF —
// and never at module scope, so importing this package stays safe in Node. The
// modules below are pure and fully Node-testable; React bindings stay in
// apps/web/src/film/.
export { MAX_FRAME_DT, frameDelta } from "./clock";
export type { EaseFn } from "./easing";
export { Easing, animate, clamp, fade, interpolate, step } from "./easing";
export type { AdvanceResult } from "./timeline";
export { advance } from "./timeline";
export { createRandom } from "./random";
export { ParticleBuffer } from "./particles";
export type { PlaybackHooks, PlaybackState } from "./playback";
export { PlaybackController } from "./playback";
