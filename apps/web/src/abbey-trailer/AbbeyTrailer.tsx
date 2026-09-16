// AbbeyTrailer.tsx — the "MLAI & Abbey" trailer shell.
//
// The picture is a SceneSequencer over the extracted engine; this file owns
// the Stage (clock, transport, scrub bar, persistence), the canvas element and
// the caption overlay. The canvas redraws once per timeline tick, so the host
// keeps cadence and the sequencer keeps the lifecycle honest. Scrubs are
// forwarded as seek() so a jump lands on the frame playing would have reached;
// ordinary playback goes through draw(), which clamps stalls.

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Canvas2DRenderer, ParticleBuffer, SceneSequencer } from "@mlai/trailer-engine";
import { C, FONT, PERSONAS } from "../film/tokens";
import { fade } from "../film/easing";
import { Stage, useTimeline } from "../film/engine";
import { Grain, Vignette } from "../film/primitives";
import { buildAbbeyTimeline, captionAt, type AbbeyTimeline } from "./scenes";

const W = 1920, H = 1080;
/** A jump larger than this between ticks is a scrub, not a stall. */
const SCRUB_THRESHOLD = 0.5;

function useAbbeyTimeline(): AbbeyTimeline {
  return useMemo(
    () => buildAbbeyTimeline({ abi: PERSONAS.abi.color, aviva: PERSONAS.aviva.color, abbey: PERSONAS.abbey.color, ink: C.bg, text: C.text, dim: C.dim }),
    [],
  );
}

function AbbeyCanvas({ timeline }: { timeline: AbbeyTimeline }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stage = useRef<{ renderer: Canvas2DRenderer; sequencer: SceneSequencer } | null>(null);
  const lastT = useRef<number | null>(null);
  const { time } = useTimeline();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const renderer = new Canvas2DRenderer(c);
    renderer.resize(W, H, 2);
    const sequencer = new SceneSequencer(timeline.cues, { particles: new ParticleBuffer(1600) });
    renderer.setScene(sequencer);
    stage.current = { renderer, sequencer };
    lastT.current = null;
    return () => {
      stage.current = null;
      sequencer.dispose();
      renderer.dispose();
    };
  }, [timeline]);

  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    const prev = lastT.current;
    lastT.current = time;
    if (prev !== null && Math.abs(time - prev) > SCRUB_THRESHOLD) s.sequencer.seek(time, W, H);
    s.renderer.render(time);
  }, [time]);

  const style: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" };
  return <canvas ref={ref} style={style} aria-hidden="true" />;
}

function AbbeyCaption({ timeline }: { timeline: AbbeyTimeline }) {
  const { time } = useTimeline();
  const line = captionAt(timeline.captions, time);
  const persona = line?.who ? PERSONAS[line.who] : null;
  const opacity = line ? fade(time - line.start, line.end - line.start, 0.25, 0.3) : 0;
  return (
    <div aria-live="polite" style={{ position: "absolute", left: 0, right: 0, bottom: 72, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, opacity, maxWidth: 1500, padding: "0 40px" }}>
        {persona && (
          <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.28em", color: persona.color, flexShrink: 0 }}>{persona.name.toUpperCase()}</span>
        )}
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 34, letterSpacing: "-0.01em", color: C.text, textShadow: "0 2px 24px rgba(0,0,0,0.85)" }}>
          {line?.text ?? ""}
        </span>
      </div>
    </div>
  );
}

export function AbbeyTrailer() {
  const timeline = useAbbeyTimeline();
  return (
    <Stage width={W} height={H} duration={timeline.duration} background={C.bg} persistKey="mlai-abbey">
      <AbbeyCanvas timeline={timeline} />
      <Vignette />
      <AbbeyCaption timeline={timeline} />
      <Grain />
    </Stage>
  );
}
