// neural.tsx — React shell over @mlai/trailer-engine's NeuralScene.
// The 3D neural-network backdrop (layered MLP in rotating perspective, radial
// "fabric" warp, title bloom) is drawn by the package; this file owns the MLAI
// colour presets, the time→mode mapping, the canvas element and its lifetime.
// Reads window.__tw.neural for intensity. Exports: NeuralCanvas, NeuralLayer,
// neuralModeForTime, NL_MODES.

import { useRef, useEffect, type CSSProperties } from "react";
import { Canvas2DRenderer, NeuralScene, type NeuralModePreset } from "@mlai/trailer-engine";
import { C } from "./tokens";
import { useTime } from "./engine";

// `C` is part of the canonical token surface for film modules; referenced to keep the
// import intentional even though the scene paints its deep-black base with literal stops.
void C;

export const NL_MODES = {
  chaos:   { order: 0.05, radial: 0, hue: [255, 90, 84],  spd: 1.5, waves: 3, glow: 0.8 },
  resolve: { order: 0.55, radial: 0, hue: [90, 230, 170],  spd: 1.1, waves: 2, glow: 1.0 },
  build:   { order: 0.93, radial: 0, hue: [80, 175, 255],  spd: 1.6, waves: 2, glow: 1.15 },
  order:   { order: 1.0,  radial: 0, hue: [95, 205, 255],  spd: 2.0, waves: 3, glow: 1.2 },
  reason:  { order: 1.0,  radial: 0, hue: [120, 230, 255], spd: 2.7, waves: 4, glow: 1.4 },
  fabric:  { order: 1.0,  radial: 1, hue: [185, 140, 255], spd: 1.2, waves: 2, glow: 1.2 },
  bloom:   { order: 1.0,  radial: 1, hue: [215, 238, 255], spd: 0.8, waves: 1, glow: 1.55 },
} as const satisfies Record<string, NeuralModePreset>;

export type NeuralMode = keyof typeof NL_MODES;

export function neuralModeForTime(t: number): NeuralMode {
  if (t < 7) return 'chaos';
  if (t < 11) return 'resolve';
  if (t < 26) return 'build';
  if (t < 38) return 'order';
  if (t < 43) return 'reason';
  if (t < 59) return 'fabric';
  return 'bloom';
}

const readIntensity = (): number => {
  const tw = (window as unknown as { __tw?: { neural?: number } }).__tw || {};
  return tw.neural != null ? tw.neural : 1;
};

export function NeuralCanvas({ t, mode, opacity = 1 }: { t: number; mode: string; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stage = useRef<{ renderer: Canvas2DRenderer; scene: NeuralScene } | null>(null);
  // Fixed logical frame; Stage scales it with a CSS transform. dpr stays 2 on
  // purpose: the film has always rendered at 2× regardless of the display.
  const W = 1920, H = 1080;

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const renderer = new Canvas2DRenderer(c);
    renderer.resize(W, H, 2);
    const scene = new NeuralScene({ initial: NL_MODES.chaos, intensity: readIntensity });
    renderer.setScene(scene);
    stage.current = { renderer, scene };
    return () => {
      // Null the ref before disposing so a StrictMode re-run never draws
      // through a disposed renderer.
      stage.current = null;
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const s = stage.current; if (!s) return;
    s.scene.setMode((NL_MODES as Record<string, NeuralModePreset>)[mode] ?? NL_MODES.build);
    s.renderer.render(t);
  }, [t, mode]);

  const style: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' };
  return <canvas ref={ref} style={style} />;
}

export function NeuralLayer({ opacity = 1, mode }: { opacity?: number; mode?: string }) {
  const t = useTime();
  return <NeuralCanvas t={t} mode={mode || neuralModeForTime(t)} opacity={opacity} />;
}
