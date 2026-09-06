export interface Workspace {
  id: string;
  name: string;
  provider_id: string | null;
  hosted_consent: number;
  onboarded: number;
  role?: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  archived: number;
  created_at: number;
  updated_at: number;
}
export interface Connection {
  id: string;
  name: string;
  kind: "local" | "hosted" | "abi" | "wdbx";
  model: string | null;
  bound?: boolean;
}
export interface Bootstrap {
  user: { id: string; name: string };
  staff: boolean;
  role: "owner" | "member" | "viewer";
  workspace: Workspace;
  workspaces: Workspace[];
  projects: Project[];
  unread: number;
  notificationsEnabled: boolean;
}
export interface Conversation {
  id: string;
  title: string;
  project_id: string | null;
  updated_at: number;
  messages?: Message[];
}
export interface Citation {
  id: string;
  number?: number;
  documentId: string;
  name: string;
  content: string;
  location: Record<string, unknown>;
  removed?: boolean;
}
export interface Message {
  id: string;
  role: string;
  content: string;
  status: string;
  citations: Citation[];
  created_at: number;
}
export interface DocumentRecord {
  id: string;
  name: string;
  extension: string;
  status: string;
  progress: string;
  size: number;
  project_id: string | null;
  created_at: number;
  updated_at: number;
  warnings: string[] | string;
  metadata: Record<string, unknown> | string;
  extraction?: {
    text: string;
    chunks: { content: string; location: Record<string, unknown> }[];
    tables: {
      name: string;
      rows: string[][];
      location: Record<string, unknown>;
    }[];
    outline: string[];
  };
  jobs?: {
    id: string;
    kind: string;
    status: string;
    error: string | null;
    attempts: number;
  }[];
  insights?: {
    citations: string;
    id: string;
    kind: string;
    content: string;
    provider: string;
    created_at: number;
  }[];
}
export interface Engagement {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  status: string;
  onboarding: string;
  created_at: number;
  updated_at: number;
  canManage?: boolean;
  milestones?: {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
  }[];
  deliverables?: {
    id: string;
    name: string;
    version: number;
    size: number;
    decision: string | null;
    created_at: number;
  }[];
  comments?: {
    id: string;
    name: string;
    content: string;
    created_at: number;
  }[];
  reviews?: {
    id: string;
    deliverable_id: string;
    name: string;
    decision: string;
    comment: string;
    created_at: number;
  }[];
  assignments?: { id: string; name: string }[];
}
export interface Notification {
  id: string;
  title: string;
  href: string;
  read_at: number | null;
  created_at: number;
}
export interface Trace {
  id: string;
  operation: string;
  provider: string | null;
  status: string;
  duration_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: number;
}
