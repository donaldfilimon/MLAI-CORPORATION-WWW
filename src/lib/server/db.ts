/**
 * SQLite via node:sqlite (DatabaseSync) — available in both Node 22.5+ and
 * Bun, so route handlers run identically under either runtime. Same database
 * file and schemas as the retired Hono server; existing data carries over.
 */
import { DatabaseSync } from "node:sqlite";

declare global {
  // Reuse one handle across dev hot-reloads instead of reopening per compile.
  var __mlaiDb: DatabaseSync | undefined;
}

/**
 * Resolve DATABASE_URL → a filesystem path DatabaseSync accepts (it takes a
 * plain path, not a URL). Accepts the documented `sqlite://` form from
 * .env.example (stripped) or a bare path; falls back to the historical
 * default so unset/blank env stays backward compatible. Pure + exported for
 * unit testing without touching the filesystem.
 */
export function resolveDbPath(databaseUrl: string | undefined): string {
  const trimmed = databaseUrl?.trim();
  if (!trimmed) return "inquiries.db";
  return trimmed.startsWith("sqlite://") ? trimmed.slice("sqlite://".length) : trimmed;
}

export function getDb(): DatabaseSync {
  if (!globalThis.__mlaiDb) {
    const db = new DatabaseSync(resolveDbPath(process.env.DATABASE_URL));
    db.exec(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        project_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Privacy-respecting telemetry: event name + page path + timestamp ONLY.
    db.exec(`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT NOT NULL,
        path TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    globalThis.__mlaiDb = db;
  }
  return globalThis.__mlaiDb;
}
