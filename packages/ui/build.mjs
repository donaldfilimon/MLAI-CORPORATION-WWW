import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { cp, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
/**
 * Each source file is compiled on its own rather than bundled, so the
 * "use client" directive stays attached to the components that need it and the
 * rest keep working as server components.
 */
async function sources(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sources(path)));
    else if (/\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}
await rm("dist", { recursive: true, force: true });
await build({
  entryPoints: await sources("src"),
  outdir: "dist",
  outbase: "src",
  format: "esm",
  target: "es2022",
  platform: "neutral",
  jsx: "automatic",
  bundle: false,
  sourcemap: true,
  logLevel: "info",
});
await cp("src/styles", "dist/styles", { recursive: true });
// TypeScript 7 does not expose ./bin/tsc through its exports map, so resolve
// the package manifest, which it does expose, and walk to the binary.
const tsc = join(
  dirname(require.resolve("typescript/package.json")),
  "bin",
  "tsc",
);
const types = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json"], {
  stdio: "inherit",
});
if (types.status !== 0) throw new Error("Declaration build failed.");
console.log("@mlai/ui built.");
