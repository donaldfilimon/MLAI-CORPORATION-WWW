import { createHash } from "node:crypto";
import { cp, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

export async function verifyResearchExport(root: string) {
  const manifest = JSON.parse(await readFile(join(root, "research-manifest.json"), "utf8"));
  if (
    manifest.format !== "mlai-research-review" ||
    manifest.version !== 1 ||
    manifest.sourceDirty !== false ||
    !/^[a-f0-9]{40}$/.test(manifest.sourceRevision) ||
    !manifest.files ||
    typeof manifest.files !== "object" ||
    Array.isArray(manifest.files)
  ) {
    throw new Error("Invalid clean canonical export manifest");
  }
  async function files(directory: string, prefix = ""): Promise<string[]> {
    const result: string[] = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isDirectory()) result.push(...(await files(join(directory, entry.name), `${relative}/`)));
      else if (entry.isFile()) result.push(relative);
      else throw new Error(`Non-regular export entry: ${relative}`);
    }
    return result;
  }
  const actual = (await files(root)).filter((path) => path !== "research-manifest.json").sort();
  const declared = Object.keys(manifest.files).sort();
  if (JSON.stringify(actual) !== JSON.stringify(declared)) {
    throw new Error("Export file inventory mismatch");
  }
  for (const name of declared) {
    const expected = manifest.files[name];
    const bytes = await readFile(join(root, name));
    if (
      typeof expected !== "string" ||
      !/^[a-f0-9]{64}$/.test(expected) ||
      createHash("sha256").update(bytes).digest("hex") !== expected
    ) {
      throw new Error(`Export hash mismatch: ${name}`);
    }
  }
  return { sourceRevision: manifest.sourceRevision as string, files: actual.length };
}

/** Verifies the canonical export, copies it to the build output, and verifies that copy. */
export async function buildResearchExport(sourceDir: string, outDir: string) {
  await verifyResearchExport(sourceDir);
  await rm(outDir, { recursive: true, force: true });
  await cp(sourceDir, outDir, { recursive: true });
  return verifyResearchExport(outDir);
}
