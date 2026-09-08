import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { verifyExport } from "./verify-export.ts";

const root = join(import.meta.dir, "..");
const publicDir = join(root, "public");
const outDir = join(root, "out");
// Packaging must not repair hashes or replace canonical browser code.
await verifyExport(publicDir);
await rm(outDir, { recursive: true, force: true });
await cp(publicDir, outDir, { recursive: true });
await verifyExport(outDir);
