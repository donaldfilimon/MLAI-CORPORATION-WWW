import type { Stats } from '../schemas';

export const stats: Stats = ([
  { value: "295x", label: "GPU Speedup Target", detail: "Matrix workload benchmark track" },
  { value: "0.8ms", label: "Search Latency Goal", detail: "1M-vector local retrieval target" },
  { value: "16.5k", label: "Throughput Target", detail: "WDBX stress-test objective" },
  { value: "3", label: "Agent Control Roles", detail: "Planning, review, and execution" },
  { value: "90d", label: "Pilot Window", detail: "Audit-to-production roadmap" },
  // Was `value: "SOC 2"`, which `Stats.tsx` renders at text-4xl/5xl — a
  // certification badge with the hedge in small print underneath. No SOC 2
  // program, controls matrix, or auditor exists in this repo or in
  // docs/master-reference.md, so the value carries the posture and the detail
  // says plainly that no audit is engaged.
  { value: "Audit-ready", label: "Controls track", detail: "Designed to produce audit evidence; no third-party audit engaged" }
]);
