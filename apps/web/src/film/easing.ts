// easing.ts — easing curves + tween helpers. Pure functions, zero imports.
// The single source of truth for easing across the graph (fx, engine, scenes).

export type EaseFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,

  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  easeOutBack: (t: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
} satisfies Record<string, EaseFn>;

export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

// progress 0..1 of a window [start, start+dur], eased
export function step(lt: number, start: number, dur: number, ease: EaseFn = Easing.easeOutCubic): number {
  return ease(clamp((lt - start) / dur, 0, 1));
}

// fade in then out across a sprite's local time
export function fade(lt: number, dur: number, inDur = 0.5, outDur = 0.5): number {
  const i = clamp(lt / inDur, 0, 1);
  const o = clamp((dur - lt) / outDur, 0, 1);
  return Math.min(Easing.easeOutCubic(i), Easing.easeInCubic(o));
}

// interpolate([0,0.5,1],[0,100,50], ease?) → fn(t). Easing may be one fn or per-segment array.
export function interpolate(input: number[], output: number[], ease: EaseFn | EaseFn[] = Easing.linear) {
  const last = output[output.length - 1] ?? 0;
  return (t: number): number => {
    if (t <= (input[0] ?? 0)) return output[0] ?? 0;
    if (t >= (input[input.length - 1] ?? 0)) return last;
    for (let i = 0; i < input.length - 1; i++) {
      const a = input[i]!, b = input[i + 1]!, oa = output[i]!, ob = output[i + 1]!;
      if (t >= a && t <= b) {
        const span = b - a;
        const local = span === 0 ? 0 : (t - a) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        return oa + (ob - oa) * easeFn(local);
      }
    }
    return last;
  };
}

// animate({from,to,start,end,ease})(t) — single-segment tween.
export function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }: {
  from?: number; to?: number; start?: number; end?: number; ease?: EaseFn;
}) {
  return (t: number): number => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}
