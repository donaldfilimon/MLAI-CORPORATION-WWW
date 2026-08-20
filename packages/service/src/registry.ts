import path from "node:path";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import type { Site } from "@quasar/shared";

export async function readRegistry(file: string): Promise<Site[]> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as Site[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function writeRegistry(file: string, sites: Site[]): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(sites, null, 2));
  await rename(tmp, file);
}
