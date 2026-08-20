import path from "node:path";
import { realpath } from "node:fs/promises";

export class PathGuardError extends Error {}
export const MAX_FILE_BYTES = 512 * 1024;
const BLOCKED = new Set([".git", "node_modules", ".next"]);

export async function resolveSitePath(siteDir: string, relPath: string): Promise<string> {
  if (path.isAbsolute(relPath)) throw new PathGuardError(`absolute path not allowed: ${relPath}`);
  const segments = relPath.split(/[\\/]+/).filter(Boolean);
  if (segments.some((s) => s === "..")) throw new PathGuardError(`path traversal not allowed: ${relPath}`);
  if (segments.some((s) => BLOCKED.has(s.toLowerCase()))) throw new PathGuardError(`blocked path segment in: ${relPath}`);
  const rootReal = await realpath(siteDir);
  const abs = path.join(rootReal, ...segments);
  // realpath the deepest existing ancestor to catch symlink escapes
  let probe = abs;
  while (true) {
    try {
      const real = await realpath(probe);
      if (real !== rootReal && !real.startsWith(rootReal + path.sep)) {
        throw new PathGuardError(`path escapes site dir: ${relPath}`);
      }
      break;
    } catch (err) {
      if (err instanceof PathGuardError) throw err;
      const parent = path.dirname(probe);
      if (parent === probe) throw new PathGuardError(`unresolvable path: ${relPath}`);
      probe = parent;
    }
  }
  return path.join(rootReal, ...segments);
}
