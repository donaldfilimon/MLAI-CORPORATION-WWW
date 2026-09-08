import { z } from "zod";
export const projectCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().max(4000).optional(),
  })
  .strict();
export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(16000),
  document_ids: z.array(z.string()).max(20).optional(),
});
export const interpretationSchema = z.object({
  kind: z.enum([
    "summary",
    "classification",
    "key_facts",
    "action_items",
    "comparison",
  ]),
  compare_with: z.array(z.string()).max(5).optional(),
});
export const engagementCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().min(1).max(8000),
});
export const reviewSchema = z.object({
  decision: z.enum(["approved", "changes_requested"]),
  comment: z.string().max(8000).default(""),
});
export const apiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z
    .array(z.enum(["read", "write", "chat", "documents", "console"]))
    .min(1)
    .max(5),
});
export const errorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});
