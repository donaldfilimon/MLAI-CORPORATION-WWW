import { PlatformSchema, type Platform } from '../schemas';

export const platform: Platform = PlatformSchema.parse([
  {
    title: "Trace Layer",
    description: "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as inspectable events.",
    detail: "Useful for debugging, compliance review, incident response, and customer-facing explanations."
  },
  {
    title: "Control Plane",
    description: "Defines which agents can plan, review, execute, escalate, or abstain under each workflow condition.",
    detail: "Keeps risky actions behind explicit approval gates and measurable release criteria."
  },
  {
    title: "Evaluation Mesh",
    description: "Runs regression scenarios across retrieval faithfulness, latency, safety behavior, prompt injection, and human-review burden.",
    detail: "Turns AI quality into a release gate instead of an after-the-fact dashboard."
  },
  {
    title: "Private Runtime",
    description: "Packages LLM orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first deployments.",
    detail: "Designed for teams that cannot send sensitive context to unmanaged infrastructure."
  }
]);
