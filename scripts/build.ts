import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { replaceFileHash } from "./replace-file-hash.ts";

const root = join(import.meta.dir, "..");
const filterSource = join(root, "src/filter.ts");
const filterOut = join(root, "public/assets/filter.js");
const publicDir = join(root, "public");
const outDir = join(root, "out");
const manifestPath = join(publicDir, "research-manifest.json");

const build = await Bun.$`bun build ${filterSource} --outfile ${filterOut} --target=browser --format=iife --minify`.nothrow();
if (build.exitCode !== 0) {
  const err = build.stderr.toString();
  if (err) process.stderr.write(err);
  process.exit(build.exitCode ?? 1);
}

const bytes = await Bun.file(filterOut).arrayBuffer();
const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
const manifestText = await Bun.file(manifestPath).text();
await Bun.write(
  manifestPath,
  replaceFileHash(manifestText, "assets/filter.js", hash),
);

await rm(outDir, { recursive: true, force: true });
await cp(publicDir, outDir, { recursive: true });
