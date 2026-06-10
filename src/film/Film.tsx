// Film.tsx — the MLAI brand film. A ~69s, six-scene explainer in the MLAI
// visual system (near-black substrate, electric cyan→blue→violet, Outfit /
// Inter / JetBrains Mono), hosted by the three agent voices.
//
//   Dependency graph (each module imports only what it needs):
//     tokens.ts ─► primitives.tsx ─► scenes/* ─► Film.tsx
//     easing.ts ─► fx.tsx ─► scenes/*
//     easing.ts ─► engine.tsx ─► scenes/* + Film.tsx + narration.tsx
//     chrome.tsx (SceneTag/StatusBadge/FlowNode) ─► scenes/*
//
//   Controls: space = play/pause · ←/→ scrub (shift = 1s) · 0 = restart.
//   Playhead persists across reloads; the voice toggle (top-right) mutes the
//   agents while captions keep carrying the words.

import { Grain, Vignette, GridBG } from "./primitives";
import { Stage, Sprite } from "./engine";
import { SceneOpen, SceneClose } from "./scenes/title";
import { ScenePersonaRouting, SceneVerifiableMemory } from "./scenes/core";
import { SceneGovernance, SceneNorthStar } from "./scenes/outro";
import { NarrationController, Narrator, VoiceToggle, useVoiceReady } from "./narration";

// Scene slots [start, end] in seconds — must match the narration script.
const T = {
  open: [0, 9],
  routing: [9, 22],
  memory: [22, 37],
  governance: [37, 51],
  northStar: [51, 60],
  close: [60, 69],
} as const;
const DURATION = 69;

export function Film() {
  const ready = useVoiceReady();
  return (
    <Stage width={1920} height={1080} duration={DURATION} background="#040406" persistKey="mlai-film" ready={ready}>
      {/* persistent ambient substrate */}
      <GridBG opacity={0.4} />
      <Vignette />

      <Sprite start={T.open[0]} end={T.open[1]}><SceneOpen /></Sprite>
      <Sprite start={T.routing[0]} end={T.routing[1]}><ScenePersonaRouting /></Sprite>
      <Sprite start={T.memory[0]} end={T.memory[1]}><SceneVerifiableMemory /></Sprite>
      <Sprite start={T.governance[0]} end={T.governance[1]}><SceneGovernance /></Sprite>
      <Sprite start={T.northStar[0]} end={T.northStar[1]}><SceneNorthStar /></Sprite>
      <Sprite start={T.close[0]} end={T.close[1]}><SceneClose /></Sprite>

      {/* agent voiceover — controller fires speech, Narrator draws the caption */}
      <NarrationController />
      <Narrator />
      <VoiceToggle />

      {/* film grain on top */}
      <Grain />
    </Stage>
  );
}
