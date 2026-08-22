// engine.tsx — timeline engine (ported from animations.jsx). Imports easing.
// Exports: Stage, Sprite, useTime, useTimeline, useSprite, PlaybackBar,
// TextSprite, RectSprite. Depended on by main.tsx + every scene.

import {
  createContext, useContext, useState, useRef, useEffect, useMemo, useCallback,
  type ReactNode, type CSSProperties,
} from "react";
import { Easing, clamp } from "./easing";

/* ── timeline context ─────────────────────────────────────────── */

interface TimelineValue {
  // `time` is the displayed playhead (follows scrubber-hover preview) — render off it.
  // `clock` is the true playhead (ignores hover) — fire side effects (speech) off it.
  time: number; clock: number; duration: number; playing: boolean;
  setTime: (t: number | ((t: number) => number)) => void;
  setPlaying: (p: boolean | ((p: boolean) => boolean)) => void;
}
const TimelineContext = createContext<TimelineValue>({
  time: 0, clock: 0, duration: 10, playing: false, setTime: () => {}, setPlaying: () => {},
});
export const useTime = () => useContext(TimelineContext).time;
export const useTimeline = () => useContext(TimelineContext);

/* ── sprite ───────────────────────────────────────────────────── */

interface SpriteValue { localTime: number; progress: number; duration: number; visible: boolean; }
const SpriteContext = createContext<SpriteValue>({ localTime: 0, progress: 0, duration: 0, visible: true });
export const useSprite = () => useContext(SpriteContext);

export function Sprite({ start = 0, end = Infinity, children, keepMounted = false }: {
  start?: number; end?: number; keepMounted?: boolean;
  children: ReactNode | ((v: SpriteValue) => ReactNode);
}) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value: SpriteValue = { localTime, progress, duration, visible };
  return (
    <SpriteContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </SpriteContext.Provider>
  );
}

/* ── text / rect sprites (handy primitives) ───────────────────── */

export function TextSprite({ text, x = 0, y = 0, size = 48, color = "#fff",
  font = "Inter, system-ui, sans-serif", weight = 600, entryDur = 0.45, exitDur = 0.35,
  align = "left", letterSpacing = "-0.01em" }: {
  text: string; x?: number; y?: number; size?: number; color?: string; font?: string;
  weight?: number; entryDur?: number; exitDur?: number; align?: "left" | "center" | "right"; letterSpacing?: string;
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1, ty = 0;
  if (localTime < entryDur) { const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1)); opacity = t; ty = (1 - t) * 16; }
  else if (localTime > exitStart) { const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1)); opacity = 1 - t; ty = -t * 8; }
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${tx}, ${ty}px)`, opacity,
      fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing, whiteSpace: "pre", lineHeight: 1.1 }}>
      {text}
    </div>
  );
}

export function RectSprite({ x = 0, y = 0, width = 100, height = 100, color = "#fff", radius = 8,
  entryDur = 0.4, exitDur = 0.3, render }: {
  x?: number; y?: number; width?: number; height?: number; color?: string; radius?: number;
  entryDur?: number; exitDur?: number; render?: (ctx: SpriteValue) => CSSProperties;
}) {
  const ctx = useSprite();
  const { localTime, duration } = ctx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1, scale = 1;
  if (localTime < entryDur) { const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1)); opacity = clamp(localTime / entryDur, 0, 1); scale = 0.4 + 0.6 * t; }
  else if (localTime > exitStart) { const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1)); opacity = 1 - t; scale = 1 - 0.15 * t; }
  return <div style={{ position: "absolute", left: x, top: y, width, height, background: color, borderRadius: radius,
    opacity, transform: `scale(${scale})`, transformOrigin: "center", ...(render ? render(ctx) : {}) }} />;
}

/* ── stage ────────────────────────────────────────────────────── */

export function Stage({ width = 1920, height = 1080, duration = 10, background = "#040406",
  loop = true, autoplay = true, persistKey = "animstage", ready = true, children }: {
  width?: number; height?: number; duration?: number; background?: string;
  loop?: boolean; autoplay?: boolean; persistKey?: string; ready?: boolean; children: ReactNode;
}) {
  const [time, setTime] = useState<number>(() => {
    try { const v = parseFloat(localStorage.getItem(persistKey + ":t") || "0"); return isFinite(v) ? clamp(v, 0, duration) : 0; }
    catch { return 0; }
  });
  const [playing, setPlaying] = useState(autoplay);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const timeRef = useRef(time);
  timeRef.current = time;
  const lastSaveRef = useRef(0);

  // Persist the playhead, but throttled — the clock ticks ~60Hz and writing to
  // localStorage every frame is needless main-thread work. Save at most ~1/s and
  // flush the final position when the Stage unmounts (e.g. navigating away).
  useEffect(() => {
    const now = performance.now();
    if (now - lastSaveRef.current >= 1000) {
      lastSaveRef.current = now;
      try { localStorage.setItem(persistKey + ":t", String(time)); } catch { /* ignore */ }
    }
  }, [time, persistKey]);
  useEffect(() => () => {
    try { localStorage.setItem(persistKey + ":t", String(timeRef.current)); } catch { /* ignore */ }
  }, [persistKey]);

  useEffect(() => {
    const el = stageRef.current; if (!el) return;
    const measure = () => {
      const barH = 44;
      setScale(Math.max(0.05, Math.min(el.clientWidth / width, (el.clientHeight - barH) / height)));
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [width, height]);

  useEffect(() => {
    // Hold the clock until the voice is ready, so no line is crossed before the
    // model can speak it (autoplay stays armed; it simply doesn't advance yet).
    if (!playing || !ready) { lastTsRef.current = null; return; }
    const stepFrame = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) { if (loop) next = next % duration; else { next = duration; setPlaying(false); } }
        return next;
      });
      rafRef.current = requestAnimationFrame(stepFrame);
    };
    rafRef.current = requestAnimationFrame(stepFrame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [playing, ready, duration, loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Clear any scrubber-hover preview so keyboard control isn't frozen at the
      // hovered frame when the pointer is resting on the track (mouseleave never fires).
      if (e.code === "Space") { e.preventDefault(); setHoverTime(null); setPlaying((p) => !p); }
      else if (e.code === "ArrowLeft") { setHoverTime(null); setTime((t) => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration)); }
      else if (e.code === "ArrowRight") { setHoverTime(null); setTime((t) => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration)); }
      else if (e.key === "0" || e.code === "Home") { setHoverTime(null); setTime(0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = useMemo<TimelineValue>(() => ({ time: displayTime, clock: time, duration, playing, setTime, setPlaying }),
    [displayTime, time, duration, playing]);

  return (
    <div ref={stageRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", background: "#0a0a0a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", minHeight: 0 }}>
        <div style={{ width, height, background, position: "relative", transform: `scale(${scale})`, transformOrigin: "center",
          flexShrink: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", overflow: "hidden" }}>
          <TimelineContext.Provider value={ctxValue}>{children}</TimelineContext.Provider>
        </div>
      </div>
      <PlaybackBar time={displayTime} duration={duration} playing={playing}
        onPlayPause={() => setPlaying((p) => !p)} onReset={() => setTime(0)}
        onSeek={(t) => setTime(t)} onHover={(t) => setHoverTime(t)} />
      {!ready && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(4,4,6,0.5)", backdropFilter: "blur(2px)", color: "rgba(220,220,228,0.85)",
          fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 13, letterSpacing: "0.34em" }}>
          <span style={{ animation: "mlaiVoicePulse 1.2s ease-in-out infinite" }}>PREPARING&nbsp;VOICE…</span>
          <style>{`@keyframes mlaiVoicePulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
        </div>
      )}
    </div>
  );
}

/* ── playback bar ─────────────────────────────────────────────── */

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }: {
  time: number; duration: number; playing: boolean;
  onPlayPause: () => void; onReset: () => void; onSeek: (t: number) => void; onHover: (t: number | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const timeFromEvent = useCallback((e: { clientX: number }) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return clamp((e.clientX - rect.left) / rect.width, 0, 1) * duration;
  }, [duration]);

  useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e: MouseEvent) => { if (trackRef.current) onSeek(timeFromEvent(e)); };
    window.addEventListener("mouseup", onUp); window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mouseup", onUp); window.removeEventListener("mousemove", onMove); };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t: number) => {
    const total = Math.max(0, t), m = Math.floor(total / 60), s = Math.floor(total % 60), cs = Math.floor((total * 100) % 100);
    return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };
  const mono = "JetBrains Mono, ui-monospace, monospace";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: "rgba(20,20,20,0.92)",
      borderTop: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 680, alignSelf: "center", borderRadius: 8,
      color: "#f6f4ef", userSelect: "none", flexShrink: 0 }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing
          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="2" width="3" height="10" fill="currentColor" /><rect x="8" y="2" width="3" height="10" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>}
      </IconButton>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: "tabular-nums", width: 64, textAlign: "right" }}>{fmt(time)}</div>
      <div ref={trackRef}
        onMouseMove={(e) => (dragging ? onSeek(timeFromEvent(e)) : onHover(timeFromEvent(e)))}
        onMouseLeave={() => { if (!dragging) onHover(null); }}
        onMouseDown={(e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); }}
        style={{ flex: 1, height: 22, position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: 4, background: "oklch(72% 0.12 250)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", width: 12, height: 12, marginLeft: -6, marginTop: -6, background: "#fff", borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.4)" }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: "tabular-nums", width: 64, textAlign: "left", color: "rgba(246,244,239,0.55)" }}>{fmt(duration)}</div>
    </div>
  );
}

function IconButton({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        background: hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6, color: "#f6f4ef", cursor: "pointer", padding: 0, transition: "background 120ms" }}>
      {children}
    </button>
  );
}
