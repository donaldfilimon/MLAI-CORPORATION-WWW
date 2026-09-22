import { join } from "node:path";
import { buildResearchExport } from "../lib/research-export.ts";

const root = join(import.meta.dir, "..");
const result = await buildResearchExport(join(root, "research/public"), join(root, "research/out"));
console.log(`research export ${result.files} files ${result.sourceRevision}`);
