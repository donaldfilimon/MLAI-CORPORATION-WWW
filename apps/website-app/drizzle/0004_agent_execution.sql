ALTER TABLE agent_runs ADD COLUMN lease_token TEXT;
--> statement-breakpoint
CREATE TABLE agent_jobs(job_id TEXT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE);
--> statement-breakpoint
CREATE INDEX agent_jobs_run ON agent_jobs(run_id);
--> statement-breakpoint
CREATE TRIGGER agent_job_revision AFTER UPDATE OF status,error ON jobs BEGIN UPDATE agent_runs SET revision=revision+1,updated_at=CAST(unixepoch('subsec')*1000 AS INTEGER) WHERE id IN (SELECT run_id FROM agent_jobs WHERE job_id=new.id); END;
