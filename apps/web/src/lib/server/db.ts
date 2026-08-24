import postgres, { type Sql } from "postgres";

/**
 * Cloud SQL/Postgres is the only persistent runtime store. There is
 * intentionally no SQLite fallback: silently opening a local file on Cloud Run
 * would make a deployment look healthy while losing data on the next recycle.
 */
declare global {
  var __quesarSql: Sql | undefined;
  var __quesarMigrations: Promise<void> | undefined;
}

export function normalizeDatabaseUrl(value: string | undefined): string | null {
  const url = value?.trim();
  if (!url) return null;
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must use postgres:// or postgresql://");
  }
  return url;
}

function openSql(): Sql {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  const common = {
    max: Number(process.env.DATABASE_POOL_SIZE ?? 5),
    idle_timeout: 20,
    connect_timeout: 10,
    transform: { undefined: null },
  } as const;
  if (databaseUrl) {
    return postgres(databaseUrl, {
      ...common,
      ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: true },
    });
  }

  const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME?.trim();
  const database = process.env.DATABASE_NAME?.trim();
  const username = process.env.DATABASE_USER?.trim();
  const password = process.env.DATABASE_PASSWORD;
  if (!connectionName || !database || !username || !password) {
    throw new Error(
      "DATABASE_URL or CLOUD_SQL_CONNECTION_NAME, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD are required",
    );
  }
  return postgres({
    ...common,
    host: `/cloudsql/${connectionName}`,
    database,
    username,
    password,
    ssl: false,
  });
}

export function getSql(): Sql {
  globalThis.__quesarSql ??= openSql();
  return globalThis.__quesarSql;
}

type Migration = { version: number; name: string; statements: readonly string[] };

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: "persistent_app_and_audit_store",
    statements: [
      `CREATE TABLE IF NOT EXISTS inquiries (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        project_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS telemetry_events (
        id BIGSERIAL PRIMARY KEY,
        event TEXT NOT NULL,
        path TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS chat_consents (
        subject_hash TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        consented_at TIMESTAMPTZ NOT NULL,
        withdrawn_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (subject_hash, policy_version)
      )`,
      `CREATE TABLE IF NOT EXISTS conversation_audits (
        id UUID PRIMARY KEY,
        subject_hash TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        ciphertext BYTEA NOT NULL,
        iv BYTEA NOT NULL,
        auth_tag BYTEA NOT NULL,
        wrapped_key BYTEA NOT NULL,
        kms_key_version TEXT NOT NULL,
        aad TEXT NOT NULL,
        content_digest TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS conversation_audits_subject_created_idx
        ON conversation_audits (subject_hash, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS conversation_audits_expires_idx
        ON conversation_audits (expires_at)`,
      `CREATE TABLE IF NOT EXISTS audit_access_events (
        id BIGSERIAL PRIMARY KEY,
        audit_id UUID NOT NULL,
        actor_subject_hash TEXT NOT NULL,
        actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
        action TEXT NOT NULL CHECK (action IN ('read', 'export', 'delete', 'expire')),
        reason TEXT,
        outcome TEXT NOT NULL CHECK (outcome IN ('requested', 'succeeded', 'failed')),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS audit_access_events_audit_idx
        ON audit_access_events (audit_id, occurred_at DESC)`,
    ],
  },
  {
    version: 2,
    name: "reason_logged_administrative_inventory",
    statements: [
      `ALTER TABLE audit_access_events ALTER COLUMN audit_id DROP NOT NULL`,
      `ALTER TABLE audit_access_events DROP CONSTRAINT IF EXISTS audit_access_events_action_check`,
      `ALTER TABLE audit_access_events ADD CONSTRAINT audit_access_events_action_check
        CHECK (action IN ('list', 'read', 'export', 'delete', 'expire'))`,
    ],
  },
] as const;

async function migrate(sql: Sql): Promise<void> {
  // One stable application-scoped lock prevents two cold starts racing the
  // schema. Transaction-scoped advisory locks release on commit/rollback.
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(716550217)`;
    await tx`CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    const rows = await tx<{ version: number }[]>`SELECT version FROM schema_migrations`;
    const applied = new Set(rows.map((row) => row.version));

    for (const migration of MIGRATIONS) {
      if (applied.has(migration.version)) continue;
      for (const statement of migration.statements) await tx.unsafe(statement);
      await tx`INSERT INTO schema_migrations (version, name)
        VALUES (${migration.version}, ${migration.name})`;
    }
  });
}

export async function ensureDatabase(): Promise<Sql> {
  const sql = getSql();
  globalThis.__quesarMigrations ??= migrate(sql);
  await globalThis.__quesarMigrations;
  return sql;
}

/** Test-only lifecycle helper; never call from a request handler. */
export async function closeDatabaseForTests(): Promise<void> {
  if (globalThis.__quesarSql) await globalThis.__quesarSql.end({ timeout: 1 });
  globalThis.__quesarSql = undefined;
  globalThis.__quesarMigrations = undefined;
}
