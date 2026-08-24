import { z } from "zod";

export type SiteStatus = "idle" | "generating" | "error";

export interface PromptEntry {
  prompt: string;
  at: string;
}

export interface Site {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  status: SiteStatus;
  previewPort: number | null;
  promptHistory: PromptEntry[];
  lastError?: string;
}

export type GenerationEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: "list_files" | "read_file" | "write_file"; path?: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type PreviewState = "stopped" | "starting" | "running" | "crashed";

export interface PreviewStatus {
  state: PreviewState;
  port: number | null;
  url: string | null;
  logTail: string[];
}

export const CreateSiteBody = z.object({
  name: z.string().min(1).max(60),
  prompt: z.string().min(1).max(4000),
});

export const EditSiteBody = z.object({
  prompt: z.string().min(1).max(4000),
});

export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "site";
}
