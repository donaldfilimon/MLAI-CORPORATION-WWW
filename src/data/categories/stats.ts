import { StatsSchema, type Stats } from '../schemas';

export const stats: Stats = StatsSchema.parse([
  { value: "295x", label: "GPU Speedup Target", detail: "Matrix workload benchmark track" },
  { value: "0.8ms", label: "Search Latency Goal", detail: "1M-vector local retrieval target" },
  { value: "16.5k", label: "Throughput Target", detail: "WDBX stress-test objective" },
  { value: "100%", label: "Private-First Design", detail: "Offline and VPC deployment paths" },
  { value: "24/7", label: "Operational Visibility", detail: "Logs, traces, and evaluation gates" },
  { value: "3", label: "Agent Control Roles", detail: "Planning, review, and execution" },
  { value: "90d", label: "Pilot Window", detail: "Audit-to-production roadmap" },
  { value: "SOC 2", label: "Readiness Track", detail: "Controls designed for audit evidence" }
]);
