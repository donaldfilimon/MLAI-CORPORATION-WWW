import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { join, resolve } from "node:path";
import { dataDir } from "./config";
import * as schema from "./schema";
const globalDb = globalThis as unknown as { mlaiSqlite?: Database.Database };
export const sqlite =
  globalDb.mlaiSqlite ?? new Database(join(dataDir, "mlai.sqlite"));
globalDb.mlaiSqlite = sqlite;
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 10000");
export const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: resolve("drizzle") });
export type Row = Record<string, unknown>;
export function one<T = Row>(sql: string, ...params: unknown[]): T | undefined {
  return sqlite.prepare(sql).get(...params) as T | undefined;
}
export function all<T = Row>(sql: string, ...params: unknown[]): T[] {
  return sqlite.prepare(sql).all(...params) as T[];
}
export function run(sql: string, ...params: unknown[]) {
  return sqlite.prepare(sql).run(...params);
}
