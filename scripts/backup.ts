process.argv = process.argv.filter(
  (value, index) => index < 2 || value !== "--",
);
import "./env";
import { resolve, join } from "node:path";
import {
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  chmodSync,
} from "node:fs";
import { createHash } from "node:crypto";
import Database from "better-sqlite3";
import { sqlite, all } from "../src/lib/server/db";
import { dataDir, uploadsDir, deliveriesDir } from "../src/lib/server/config";
const destination = resolve(
  process.argv[2] ||
    join("backups", new Date().toISOString().replace(/[:.]/g, "-")),
);
if (existsSync(destination))
  throw new Error("Backup destination must not exist.");
mkdirSync(destination, { recursive: true, mode: 0o700 });
const manifest: {
  version: 1;
  createdAt: string;
  files: Record<string, string>;
} = { version: 1, createdAt: new Date().toISOString(), files: {} };
function copy(source: string, relative: string) {
  const dest = join(destination, relative);
  mkdirSync(resolve(dest, ".."), { recursive: true, mode: 0o700 });
  copyFileSync(source, dest);
  chmodSync(dest, 0o600);
  manifest.files[relative] = createHash("sha256")
    .update(readFileSync(dest))
    .digest("hex");
}
// Hold the writer lock while a second connection snapshots the committed database
// and referenced artifacts. Uploads are published only inside their DB transaction.
sqlite.exec("BEGIN IMMEDIATE");
try {
  const reader = new Database(join(dataDir, "mlai.sqlite"), { readonly: true });
  try {
    await reader.backup(join(destination, "mlai.sqlite"));
  } finally {
    reader.close();
  }
  chmodSync(join(destination, "mlai.sqlite"), 0o600);
  manifest.files["mlai.sqlite"] = createHash("sha256")
    .update(readFileSync(join(destination, "mlai.sqlite")))
    .digest("hex");
  copy(join(dataDir, "auth-secret"), "auth-secret");
  if (existsSync(join(dataDir, "connections.json")))
    copy(join(dataDir, "connections.json"), "connections.json");
  for (const row of all<{ id: string; extension: string }>(
    "SELECT id,extension FROM documents",
  )) {
    copy(
      join(uploadsDir, row.id, `original.${row.extension}`),
      `documents/${row.id}/original.${row.extension}`,
    );
    if (existsSync(join(uploadsDir, row.id, "result.json")))
      copy(
        join(uploadsDir, row.id, "result.json"),
        `documents/${row.id}/result.json`,
      );
  }
  for (const row of all<{ id: string }>("SELECT id FROM deliverables"))
    copy(
      join(deliveriesDir, row.id, "original"),
      `deliverables/${row.id}/original`,
    );
  writeFileSync(
    join(destination, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    { mode: 0o600 },
  );
} finally {
  sqlite.exec("ROLLBACK");
}
console.log(`Backup created: ${destination}`);
