import { z } from "zod";
import { projectCreateSchema, interpretationSchema } from "./contracts";
export const agentLimits = { steps: 8, activeMs: 300_000, sources: 20, excerptChars: 4000, list: 30 } as const;
const identifier = z.string().min(1).max(200);
const empty = z.object({}).strict();
export const agentRunRequestSchema = z.object({ conversation_id: identifier, objective: z.string().trim().min(1).max(16000), document_ids: z.array(identifier).max(20).optional() }).strict();
export const agentActionDecisionSchema = empty;
export const agentUpdateProjectSchema = z.object({ project_id: identifier, name: z.string().trim().min(1).max(120).optional(), description: z.string().max(4000).optional() }).strict().refine(v => v.name !== undefined || v.description !== undefined, "Supply a project change.");
export const agentAssociateDocumentSchema = z.object({ document_id: identifier, project_id: identifier.nullable() }).strict();
export const agentInterpretSchema = interpretationSchema.extend({ document_id: identifier }).strict();
const tools = [
  z.object({kind:z.literal("tool"),tool:z.literal("list_projects"),input:empty}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("list_documents"),input:empty}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("search_documents"),input:z.object({query:z.string().trim().min(1).max(1000)}).strict()}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("inspect_source"),input:z.object({document_id:identifier,chunk_id:identifier}).strict()}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("read_interpretations"),input:z.object({document_id:identifier}).strict()}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("create_project"),input:projectCreateSchema}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("update_project"),input:agentUpdateProjectSchema}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("associate_document"),input:agentAssociateDocumentSchema}).strict(),
  z.object({kind:z.literal("tool"),tool:z.literal("interpret_documents"),input:agentInterpretSchema}).strict(),
] as const;
export const agentToolDecisionSchema = z.discriminatedUnion("tool", tools);
export const agentDecisionSchema = z.discriminatedUnion("kind", [agentToolDecisionSchema,z.object({kind:z.literal("answer"),content:z.string().trim().min(1).max(16000)}).strict()]);
export type AgentToolDecision = z.infer<typeof agentToolDecisionSchema>;
export const agentRunStatusSchema = z.enum(["queued","running","awaiting_approval","completed","cancelled","failed"]);
export const agentActionStatusSchema = z.enum(["pending","approved","rejected","completed","stale","cancelled"]);
export type AgentRunStatus = z.infer<typeof agentRunStatusSchema>;
export type AgentActionStatus = z.infer<typeof agentActionStatusSchema>;
export const agentSourceReferenceSchema = z.object({id:z.string(),documentId:z.string(),name:z.string(),location:z.record(z.string(),z.unknown()),number:z.number().optional(),removed:z.boolean().optional()});
export const agentAffectedResourceSchema = z.object({table:z.enum(["projects","documents"]),id:z.string(),name:z.string(),revision:z.number(),values:z.record(z.string(),z.unknown())});
export const agentStepSchema = z.object({id:z.string(),tool:z.string(),count:z.number(),resource_ids:z.array(z.string()),sources:z.array(agentSourceReferenceSchema),created_at:z.number()});
export const agentActionSchema = z.object({id:z.string(),run_id:z.string(),tool:z.string(),input:z.record(z.string(),z.unknown()),target_id:z.string(),affected:z.array(agentAffectedResourceSchema),status:agentActionStatusSchema,created_at:z.number()});
export const agentResultSchema = z.object({id:z.string(),action_id:z.string().nullable(),kind:z.enum(["answer","write"]),content:z.string(),citations:z.array(agentSourceReferenceSchema),resource_id:z.string().nullable(),status:z.string(),created_at:z.number()});
export const agentRunSummarySchema = z.object({id:z.string(),conversation_id:z.string(),objective:z.string(),status:agentRunStatusSchema,revision:z.number(),step_count:z.number(),active_ms:z.number(),provider:z.string(),model:z.string(),error:z.string().nullable(),created_at:z.number(),updated_at:z.number()});
export const agentRunDetailSchema = agentRunSummarySchema.extend({steps:z.array(agentStepSchema),actions:z.array(agentActionSchema),results:z.array(agentResultSchema)});
export type AgentSourceReference = z.infer<typeof agentSourceReferenceSchema>;
export type AgentAffectedResource = z.infer<typeof agentAffectedResourceSchema>;
export type AgentStep = z.infer<typeof agentStepSchema>;
export type AgentAction = z.infer<typeof agentActionSchema>;
export type AgentRunSummary = z.infer<typeof agentRunSummarySchema>;
export type AgentRunDetail = z.infer<typeof agentRunDetailSchema>;
