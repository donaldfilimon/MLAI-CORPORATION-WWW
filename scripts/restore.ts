process.argv = process.argv.filter(
  (value, index) => index < 2 || value !== "--",
);
import { resolve, join, relative, isAbsolute } from "node:path";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  copyFileSync,
  chmodSync,
  existsSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import Database from "better-sqlite3";
const [sourceArg, targetArg] = process.argv.slice(2);
if (!sourceArg || !targetArg)
  throw new Error("Usage: bun run restore BACKUP_DIRECTORY NEW_DATA_DIRECTORY");
const source = resolve(sourceArg),
  target = resolve(targetArg);
if (existsSync(target))
  throw new Error(
    "Restore requires a new, non-existing destination. It never overwrites a live installation.",
  );
const manifest = JSON.parse(
  readFileSync(join(source, "manifest.json"), "utf8"),
) as { version: number; files: Record<string, string> };
if (
  manifest.version !== 1 ||
  !manifest.files?.["mlai.sqlite"] ||
  !manifest.files?.["auth-secret"]
)
  throw new Error("Invalid backup manifest.");
for (const [name, hash] of Object.entries(manifest.files)) {
  if (
    isAbsolute(name) ||
    name.split(/[\\/]/).some((p) => p === ".." || p === "")
  )
    throw new Error("Unsafe backup path.");
  const path = resolve(source, name);
  if (relative(source, path).startsWith(".."))
    throw new Error("Unsafe backup path.");
  let current = source;
  for (const segment of name.split("/")) {
    current = join(current, segment);
    if (lstatSync(current).isSymbolicLink())
      throw new Error("Backup links are not allowed.");
  }
  if (
    !lstatSync(path).isFile() ||
    createHash("sha256").update(readFileSync(path)).digest("hex") !== hash
  )
    throw new Error(`Backup integrity mismatch: ${name}`);
}
mkdirSync(target, { recursive: true, mode: 0o700 });
for (const name of Object.keys(manifest.files)) {
  const path = join(target, name);
  mkdirSync(resolve(path, ".."), { recursive: true, mode: 0o700 });
  copyFileSync(join(source, name), path);
  chmodSync(path, 0o600);
}
const db = new Database(join(target, "mlai.sqlite"));
try {
  if (
    db.pragma("integrity_check", { simple: true }) !== "ok" ||
    (db.pragma("foreign_key_check") as unknown[]).length
  )
    throw new Error("Restored database integrity check failed.");
  db.prepare(
    "UPDATE jobs SET status='queued',worker_id=NULL,lease_until=NULL WHERE status='running'",
  ).run();
  if (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='agent_runs'").get()) {
    db.prepare("UPDATE agent_runs SET status='queued',active_ms=active_ms+CASE WHEN active_since IS NULL THEN 0 ELSE max(0,min(?,coalesce(lease_until,?))-active_since) END,active_since=NULL,worker_id=NULL,lease_until=NULL,lease_token=NULL,revision=revision+1,updated_at=? WHERE status='running'").run(Date.now(),Date.now(),Date.now());
  }
  db.prepare(
    "UPDATE messages SET status='interrupted' WHERE status='streaming'",
  ).run();
} finally {
  db.close();
}
writeFileSync(
  join(target, "RESTORED.txt"),
  "Restored locally. Check operator connection paths before starting. External credential files and environment variables must be configured separately.\n",
  { mode: 0o600 },
);
console.log(
  `Restore verified: ${target}\nStart with MLAI_DATA_DIR set to that path and an unused PORT / matching APP_URL.`,
);
