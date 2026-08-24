import { describe, expect, it } from "vitest";
import { MIGRATIONS, normalizeDatabaseUrl } from "@/lib/server/db";

describe("Postgres database configuration", () => {
  it("requires an explicit Postgres URL", () => {
    expect(normalizeDatabaseUrl(undefined)).toBeNull();
    expect(normalizeDatabaseUrl("  ")).toBeNull();
    expect(normalizeDatabaseUrl("postgres://localhost/quesar")).toBe(
      "postgres://localhost/quesar",
    );
    expect(normalizeDatabaseUrl("postgresql://localhost/quesar")).toBe(
      "postgresql://localhost/quesar",
    );
  });

  it("rejects the former ephemeral SQLite configuration", () => {
    expect(() => normalizeDatabaseUrl("sqlite:///app/data/inquiries.db")).toThrow(
      /postgres/i,
    );
  });

  it("ships a versioned baseline covering every persistent surface", () => {
    const schema = MIGRATIONS.flatMap((migration) => migration.statements).join("\n");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS inquiries");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS telemetry_events");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS chat_consents");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS conversation_audits");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS audit_access_events");
    expect(schema).toContain("ALTER COLUMN audit_id DROP NOT NULL");
    expect(schema).toContain("'list'");
  });
});
