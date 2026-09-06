ALTER TABLE jobs ADD COLUMN payload TEXT NOT NULL DEFAULT '{}';
--> statement-breakpoint
CREATE UNIQUE INDEX one_stream_per_conversation ON messages(conversation_id) WHERE status='streaming';
