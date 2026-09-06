import { z } from "zod";
import {
  projectCreateSchema,
  chatRequestSchema,
  interpretationSchema,
  engagementCreateSchema,
  reviewSchema,
  apiKeySchema,
  errorSchema,
} from "./contracts";
const object = z.record(z.string(), z.unknown());
const schemas = {
  ProjectCreate: projectCreateSchema,
  ChatRequest: chatRequestSchema,
  Interpretation: interpretationSchema,
  EngagementCreate: engagementCreateSchema,
  Review: reviewSchema,
  ApiKeyCreate: apiKeySchema,
  Error: errorSchema,
};
export const operations: [
  path: string,
  method: string,
  summary: string,
  schema?: keyof typeof schemas | z.ZodType,
][] = [
  ["/health", "get", "Local service health"],
  [
    "/inquiries",
    "post",
    "Persist a public contact inquiry",
    z.object({
      name: z.string(),
      email: z.email(),
      company: z.string().optional(),
      message: z.string().min(10).max(8000),
    }),
  ],
  [
    "/bootstrap",
    "get",
    "Current identity, workspace memberships, projects and unread count",
  ],
  ["/workspaces", "post", "Create a workspace (session)", "ProjectCreate"],
  [
    "/workspaces/settings",
    "patch",
    "Owner: update name, selected provider, explicit hosted consent and onboarding",
    z.object({
      name: z.string().optional(),
      provider_id: z.string().nullable().optional(),
      hosted_consent: z.boolean().optional(),
      onboarded: z.boolean().optional(),
    }),
  ],
  ["/workspaces/members", "get", "List current workspace members"],
  [
    "/workspaces/members",
    "post",
    "Owner: add or update an existing local account",
    z.object({ email: z.email(), role: z.enum(["owner", "member", "viewer"]) }),
  ],
  ["/workspaces/members/{id}", "delete", "Owner: remove another member"],
  ["/projects", "get", "List workspace projects"],
  ["/projects", "post", "Create a project", "ProjectCreate"],
  [
    "/projects/{id}",
    "patch",
    "Rename, describe or archive a project",
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      archived: z.boolean().optional(),
    }),
  ],
  [
    "/projects/{id}",
    "delete",
    "Delete project; retain its documents and conversations without a project",
  ],
  ["/conversations", "get", "List conversations"],
  [
    "/conversations",
    "post",
    "Create conversation",
    z.object({
      title: z.string().optional(),
      project_id: z.string().nullable().optional(),
    }),
  ],
  [
    "/conversations/{id}",
    "get",
    "Load messages and authorized source references",
  ],
  [
    "/conversations/{id}",
    "patch",
    "Rename or move conversation",
    z.object({
      title: z.string(),
      project_id: z.string().nullable().optional(),
    }),
  ],
  ["/conversations/{id}", "delete", "Delete conversation and messages"],
  ["/conversations/{id}/export", "get", "Download conversation JSON"],
  [
    "/chat/{id}",
    "post",
    "Stream an answer: start, provider, delta, done or error; cancel by closing the stream",
    "ChatRequest",
  ],
  [
    "/documents/capabilities",
    "get",
    "Installed and fixture-verified upload formats",
  ],
  ["/documents", "get", "List documents and processing states"],
  [
    "/documents",
    "post",
    "Upload raw file bytes using X-File-Name; optional project query",
  ],
  [
    "/documents/{id}",
    "get",
    "Extraction, outline, tables, interpretations and persistent job progress",
  ],
  [
    "/documents/{id}",
    "delete",
    "Remove original, artifacts, chunks, embeddings, jobs and interpretations",
  ],
  [
    "/documents/{id}/download",
    "get",
    "Authorized original download; preview=1 for PDF/images",
  ],
  [
    "/documents/{id}/source",
    "get",
    "Resolve an authorized source using chunk query",
  ],
  [
    "/documents/{id}/cancel",
    "post",
    "Cancel extraction or interpretation jobs",
  ],
  ["/documents/{id}/reprocess", "post", "Queue extraction again"],
  [
    "/documents/{id}/interpret",
    "post",
    "Queue a persistent interpretation; poll document jobs",
    "Interpretation",
  ],
  [
    "/search",
    "get",
    "Workspace-authorized retrieval; q and optional project; reports keyword or hybrid mode",
  ],
  [
    "/connections",
    "get",
    "List operator-configured connections without secrets",
  ],
  [
    "/connections/{id}/probe",
    "post",
    "Probe configured model; hosted consent required",
  ],
  [
    "/connections/{id}/bind",
    "post",
    "Owner: bind a WDBX gateway exclusively to this workspace",
  ],
  [
    "/connections/{id}/events",
    "get",
    "WDBX mutation SSE; bounded to 60 seconds",
  ],
  [
    "/playground",
    "post",
    "Allowlisted ABI snapshot/backends or WDBX Stats, PutVector, Search, PutKv, GetKv",
    z.object({
      connection_id: z.string(),
      operation: z.string(),
      input: object.optional(),
    }),
  ],
  ["/api-keys", "get", "Owner session: list prefixes/scopes, never secrets"],
  [
    "/api-keys",
    "post",
    "Owner session: create key and return secret once",
    "ApiKeyCreate",
  ],
  ["/api-keys/{id}", "delete", "Owner session: revoke API key"],
  ["/usage", "get", "Actual request counts and provider-reported token usage"],
  ["/traces", "get", "Content-free outcomes and measured durations"],
  [
    "/engagements",
    "get",
    "List customer engagements; staff=1 lists assigned engagements and triage requests",
  ],
  [
    "/engagements",
    "post",
    "Submit customer service request",
    "EngagementCreate",
  ],
  [
    "/engagements/{id}",
    "get",
    "Authorized engagement, milestones, versioned deliverables, reviews, comments and staff",
  ],
  [
    "/engagements/{id}",
    "patch",
    "Customer onboarding or assigned-staff lifecycle status",
    z.object({
      onboarding: z.record(z.string(), z.string()).optional(),
      status: z.enum(["active", "review", "completed", "cancelled"]).optional(),
    }),
  ],
  [
    "/engagements/{id}/claim",
    "post",
    "Staff: claim an unassigned service request",
  ],
  [
    "/engagements/{id}/assign",
    "post",
    "Assigned staff: add another staff account",
    z.object({ user_id: z.string() }),
  ],
  [
    "/engagements/{id}/comments",
    "post",
    "Add customer/staff comment",
    z.object({ content: z.string().min(1).max(8000) }),
  ],
  [
    "/engagements/{id}/milestones",
    "post",
    "Assigned staff: create milestone",
    z.object({ title: z.string(), due_date: z.string().optional() }),
  ],
  [
    "/engagements/{id}/milestones/{target}",
    "patch",
    "Assigned staff: update milestone",
    z.object({ status: z.enum(["planned", "active", "complete"]) }),
  ],
  [
    "/engagements/{id}/deliverables",
    "post",
    "Assigned staff: upload raw bytes with X-File-Name; identical name creates next version",
  ],
  [
    "/engagements/{id}/deliverables/{target}",
    "get",
    "Authorized deliverable download",
  ],
  [
    "/engagements/{id}/deliverables/{target}",
    "post",
    "Customer: review exact current deliverable version",
    "Review",
  ],
  ["/staff/inquiries", "get", "Staff: triage persistent inquiries"],
  [
    "/staff/inquiries",
    "patch",
    "Staff: change inquiry status",
    z.object({
      id: z.string(),
      status: z.enum(["new", "reviewing", "closed"]),
    }),
  ],
  [
    "/staff/directory",
    "get",
    "Staff: account and workspace directory for engagement assignment",
  ],
  [
    "/staff/engagements",
    "post",
    "Staff: create assigned engagement",
    engagementCreateSchema.extend({ workspace_id: z.string() }),
  ],
  ["/notifications", "get", "Current member notifications"],
  ["/notifications", "patch", "Mark all notifications read"],
  ["/notifications/{id}", "patch", "Mark one notification read"],
  [
    "/notifications/preferences",
    "patch",
    "Set current workspace notification preference",
    z.object({ enabled: z.boolean() }),
  ],
];
export function openapi() {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const [path, method, summary, body] of operations) {
    const upload =
      method === "post" &&
      (path === "/documents" || path.endsWith("/deliverables"));
    const parameters = [
      ...Array.from(path.matchAll(/\{([^}]+)\}/g), (m) => ({
        name: m[1],
        in: "path",
        required: true,
        schema: { type: "string" },
      })),
      {
        name: "X-Workspace-ID",
        in: "header",
        required: false,
        schema: { type: "string" },
      },
    ];
    if (upload)
      parameters.push({
        name: "X-File-Name",
        in: "header",
        required: true,
        schema: { type: "string" },
      });
    paths[path] ??= {};
    paths[path][method] = {
      summary,
      operationId: `${method}_${path.replace(/[^a-zA-Z0-9]+/g, "_")}`,
      security: ["/health", "/inquiries"].includes(path)
        ? []
        : [{ session: [] }, { apiKey: [] }],
      parameters,
      ...(body || upload
        ? {
            requestBody: {
              required: true,
              content: upload
                ? {
                    "application/octet-stream": {
                      schema: { type: "string", format: "binary" },
                    },
                  }
                : {
                    "application/json": {
                      schema:
                        typeof body === "string"
                          ? { $ref: `#/components/schemas/${body}` }
                          : z.toJSONSchema(body as z.ZodType),
                    },
                  },
            },
          }
        : {}),
      responses: {
        "200": {
          description:
            "Successful operation. Creation may return 201; queued jobs return 202. Chat/events use text/event-stream.",
          content: { "application/json": { schema: {} } },
        },
        "201": { description: "Resource created" },
        "202": { description: "Job queued" },
        default: {
          description: "Stable error code with request ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "MLAI Local Application API",
      version: "1.0.0",
      description:
        "Server-side workspace/engagement authorization applies to every resource. Bearer keys have read/write/chat/documents/console scopes and cannot perform owner-session or staff operations. Cookie mutations require a same-origin Origin header. Authentication endpoints under /api/auth follow Better Auth's email/password and session API.",
    },
    servers: [{ url: "/api/v1" }],
    paths,
    components: {
      securitySchemes: {
        session: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
        },
        apiKey: { type: "http", scheme: "bearer" },
      },
      schemas: Object.fromEntries(
        Object.entries(schemas).map(([name, schema]) => [
          name,
          z.toJSONSchema(schema),
        ]),
      ),
    },
  };
}
