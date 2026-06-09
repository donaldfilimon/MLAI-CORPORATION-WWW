/**
 * Shared tag → Tailwind class map for research/blog category chips.
 * Single source of truth (was duplicated across Research and ResearchPaper).
 */
export const tagColors: Record<string, string> = {
  "CORE ARCHITECTURE": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "ETHICS & SAFETY": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  SCALABILITY: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ENGINEERING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  RESEARCH: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  SAFETY: "text-rose-400 bg-rose-500/10 border-rose-400/20",
};

export const DEFAULT_TAG_COLOR =
  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

export const tagColor = (tag: string): string =>
  tagColors[tag] ?? DEFAULT_TAG_COLOR;
