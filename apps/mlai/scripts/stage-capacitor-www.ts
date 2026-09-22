import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const built = await readFile(join(root, ".next/server/app/index.html"), "utf8");
if (!built.includes("Private generation with an audit trail you control.")) {
  throw new Error("Built home page is missing the public headline");
}
const www = join(root, "capacitor/www");
await mkdir(www, { recursive: true });
await writeFile(join(www, "index.html"), built);
await cp(join(root, ".next/static"), join(www, "_next/static"), { recursive: true });
await cp(join(root, "public"), www, { recursive: true });
const refs = [...built.matchAll(/\/_next\/static\/[^"'\\\s)]+/g)].map((match) =>
  match[0].split("?")[0],
);
const missing = [];
for (const ref of refs) {
  try {
    await readFile(join(www, ref));
  } catch {
    missing.push(ref);
  }
}
if (refs.length === 0 || missing.length > 0) {
  throw new Error(
    `Capacitor webDir is not a loadable build (${refs.length} asset refs, missing ${missing.slice(0, 5).join(", ")})`,
  );
}
console.log(`capacitor www staged with ${refs.length} build assets`);
