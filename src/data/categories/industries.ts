import { IndustriesSchema, type Industries } from '../schemas';

export const industries: Industries = IndustriesSchema.parse([
  "Regulated software teams shipping AI copilots into customer workflows.",
  "Research organizations that need private retrieval over sensitive technical corpora.",
  "Security and compliance teams evaluating tool-using autonomous agents.",
  "Infrastructure teams deploying AI near edge devices, private clouds, or constrained networks."
]);
