CREATE TABLE artifact_cleanup(id TEXT PRIMARY KEY,kind TEXT NOT NULL CHECK(kind IN ('document')),created_at INTEGER NOT NULL);
