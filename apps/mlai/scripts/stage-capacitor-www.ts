import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const built = await readFile(join(root, ".next/server/app/index.html"), "utf8");
if (!built.includes("Private generation with an audit trail you control.")) {
  throw new Error("Built home page is missing the public headline");
}
const www = join(root, "capacitor/www");
await mkdir(www, { recursive: true });
await writeFile(join(www, "index.html"), built);
console.log("capacitor www staged from the Next production build");
