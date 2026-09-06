ALTER TABLE projects ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE documents ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE TRIGGER project_revision AFTER UPDATE OF name,description,archived ON projects BEGIN UPDATE projects SET revision=old.revision+1 WHERE id=new.id; END;
--> statement-breakpoint
CREATE TRIGGER document_revision AFTER UPDATE OF name,project_id,status,metadata ON documents BEGIN UPDATE documents SET revision=old.revision+1 WHERE id=new.id; END;
--> statement-breakpoint
CREATE TABLE agent_runs(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,objective TEXT NOT NULL,document_ids TEXT NOT NULL,project_id TEXT,status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','awaiting_approval','completed','cancelled','failed')),revision INTEGER NOT NULL DEFAULT 1,step_count INTEGER NOT NULL DEFAULT 0,active_ms INTEGER NOT NULL DEFAULT 0,active_since INTEGER,lease_until INTEGER,worker_id TEXT,selection TEXT NOT NULL,provider TEXT NOT NULL,model TEXT NOT NULL,error TEXT,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE agent_steps(id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,tool TEXT NOT NULL,count INTEGER NOT NULL,resource_ids TEXT NOT NULL,sources TEXT NOT NULL DEFAULT '[]',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE agent_actions(id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,tool TEXT NOT NULL,input TEXT NOT NULL,target_id TEXT NOT NULL,affected TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed','stale','cancelled')),created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE agent_decisions(action_id TEXT PRIMARY KEY REFERENCES agent_actions(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id),decision TEXT NOT NULL CHECK(decision IN ('approved','rejected')),created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE agent_results(id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,action_id TEXT UNIQUE REFERENCES agent_actions(id) ON DELETE CASCADE,kind TEXT NOT NULL,content TEXT NOT NULL DEFAULT '',citations TEXT NOT NULL DEFAULT '[]',resource_id TEXT,status TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE agent_sources(run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,chunk_id TEXT NOT NULL,document_id TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(run_id,chunk_id));
--> statement-breakpoint
CREATE INDEX agent_queue ON agent_runs(status,lease_until,created_at);
--> statement-breakpoint
CREATE INDEX agent_history ON agent_runs(conversation_id,created_at);
--> statement-breakpoint
CREATE INDEX agent_action_queue ON agent_actions(run_id,status);
--> statement-breakpoint
CREATE INDEX agent_source_document ON agent_sources(document_id);
--> statement-breakpoint
CREATE UNIQUE INDEX agent_active_conversation ON agent_runs(conversation_id) WHERE status IN ('queued','running','awaiting_approval');
