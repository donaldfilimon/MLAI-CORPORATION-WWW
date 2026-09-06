CREATE TABLE user(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,emailVerified INTEGER NOT NULL DEFAULT 0,image TEXT,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE session(id TEXT PRIMARY KEY,expiresAt INTEGER NOT NULL,token TEXT NOT NULL UNIQUE,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL,ipAddress TEXT,userAgent TEXT,userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE);
--> statement-breakpoint
CREATE TABLE account(id TEXT PRIMARY KEY,accountId TEXT NOT NULL,providerId TEXT NOT NULL,userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,accessToken TEXT,refreshToken TEXT,idToken TEXT,accessTokenExpiresAt INTEGER,refreshTokenExpiresAt INTEGER,scope TEXT,password TEXT,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE verification(id TEXT PRIMARY KEY,identifier TEXT NOT NULL,value TEXT NOT NULL,expiresAt INTEGER NOT NULL,createdAt INTEGER,updatedAt INTEGER);
--> statement-breakpoint
CREATE TABLE workspaces(id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at INTEGER NOT NULL,provider_id TEXT,hosted_consent INTEGER NOT NULL DEFAULT 0,onboarded INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE memberships(workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN ('owner','member','viewer')),notifications INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(workspace_id,user_id));
--> statement-breakpoint
CREATE TABLE staff(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE);
--> statement-breakpoint
CREATE TABLE projects(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',archived INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE conversations(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,title TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE messages(id TEXT PRIMARY KEY,conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,role TEXT NOT NULL,content TEXT NOT NULL,citations TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL DEFAULT 'complete',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE documents(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,name TEXT NOT NULL,extension TEXT NOT NULL,size INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'queued',progress TEXT NOT NULL DEFAULT 'Waiting for worker',warnings TEXT NOT NULL DEFAULT '[]',metadata TEXT NOT NULL DEFAULT '{}',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE chunks(id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,ordinal INTEGER NOT NULL,content TEXT NOT NULL,location TEXT NOT NULL);
--> statement-breakpoint
CREATE VIRTUAL TABLE chunks_fts USING fts5(content,chunk_id UNINDEXED,workspace_id UNINDEXED);
--> statement-breakpoint
CREATE TRIGGER chunk_insert AFTER INSERT ON chunks BEGIN INSERT INTO chunks_fts(content,chunk_id,workspace_id) VALUES(new.content,new.id,new.workspace_id); END;
--> statement-breakpoint
CREATE TRIGGER chunk_delete AFTER DELETE ON chunks BEGIN DELETE FROM chunks_fts WHERE chunk_id=old.id; END;
--> statement-breakpoint
CREATE TABLE embeddings(chunk_id TEXT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,space TEXT NOT NULL,vector TEXT NOT NULL,PRIMARY KEY(chunk_id,space));
--> statement-breakpoint
CREATE TABLE jobs(id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,kind TEXT NOT NULL DEFAULT 'extract',status TEXT NOT NULL DEFAULT 'queued',attempts INTEGER NOT NULL DEFAULT 0,lease_until INTEGER,worker_id TEXT,error TEXT,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE insights(id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,kind TEXT NOT NULL,content TEXT NOT NULL,citations TEXT NOT NULL,provider TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE bindings(connection_id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE);
--> statement-breakpoint
CREATE TABLE api_keys(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,name TEXT NOT NULL,prefix TEXT NOT NULL,hash TEXT NOT NULL UNIQUE,scopes TEXT NOT NULL,created_at INTEGER NOT NULL,revoked_at INTEGER,last_used_at INTEGER);
--> statement-breakpoint
CREATE TABLE traces(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,operation TEXT NOT NULL,provider TEXT,status TEXT NOT NULL,duration_ms INTEGER NOT NULL,input_tokens INTEGER,output_tokens INTEGER,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE inquiries(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,company TEXT NOT NULL DEFAULT '',message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE engagements(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,title TEXT NOT NULL,description TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'requested',onboarding TEXT NOT NULL DEFAULT '{}',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE assignments(engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,PRIMARY KEY(engagement_id,user_id));
--> statement-breakpoint
CREATE TABLE milestones(id TEXT PRIMARY KEY,engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,title TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'planned',due_date TEXT,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE deliverables(id TEXT PRIMARY KEY,engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,name TEXT NOT NULL,version INTEGER NOT NULL,size INTEGER NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE reviews(id TEXT PRIMARY KEY,deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id),decision TEXT NOT NULL CHECK(decision IN ('approved','changes_requested')),comment TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE comments(id TEXT PRIMARY KEY,engagement_id TEXT NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id),content TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE notifications(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,title TEXT NOT NULL,href TEXT NOT NULL,read_at INTEGER,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX document_workspace ON documents(workspace_id);
--> statement-breakpoint
CREATE INDEX chunk_workspace ON chunks(workspace_id,document_id);
--> statement-breakpoint
CREATE INDEX job_queue ON jobs(status,lease_until);
--> statement-breakpoint
CREATE INDEX trace_workspace ON traces(workspace_id,created_at);
--> statement-breakpoint
CREATE TABLE rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
