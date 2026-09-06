import { afterAll, expect, it, vi } from "vitest";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "mlai-rate-limit-"));
process.env.MLAI_DATA_DIR = root;
const { sqlite } = await import("../src/lib/server/db");
const { rateLimit } = await import("../src/lib/server/http");
const peer = new Database(join(root, "mlai.sqlite"));
peer.pragma("busy_timeout=1");
afterAll(() => {
  vi.restoreAllMocks();
  peer.close();
  sqlite.close();
  rmSync(root, { recursive: true, force: true });
});

it("serializes a competing connection before the rate-limit read can become a stale WAL snapshot", () => {
  const prepare = sqlite.prepare.bind(sqlite);
  let competingWriterCode: string | undefined;
  const competingWrite = () =>
    peer
      .prepare(
        "INSERT INTO rate_limits(key,count,expires_at) VALUES('worker',1,?)",
      )
      .run(Date.now() + 60000);
  const spy = vi.spyOn(sqlite, "prepare").mockImplementation((sql) => {
    const statement = prepare(sql);
    if (sql === "SELECT * FROM rate_limits WHERE key=?") {
      const get = statement.get.bind(statement);
      statement.get = (...params: unknown[]) => {
        const row = get(...params);
        try {
          competingWrite();
        } catch (error) {
          competingWriterCode = (error as { code: string }).code;
        }
        return row;
      };
    }
    return statement;
  });
  try {
    expect(() => rateLimit("request", 2)).not.toThrow();
    expect(competingWriterCode).toBe("SQLITE_BUSY");
  } finally {
    spy.mockRestore();
  }
  expect(() => competingWrite()).not.toThrow();
  expect(() => rateLimit("request", 2)).not.toThrow();
  expect(() => rateLimit("request", 2)).toThrow("Too many requests");
  expect(
    prepare("SELECT count FROM rate_limits WHERE key='request'").get(),
  ).toEqual({ count: 2 });
});
