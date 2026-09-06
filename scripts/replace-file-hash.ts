export function replaceFileHash(
  manifestText: string,
  relPath: string,
  hash: string,
): string {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error(`expected 64 lowercase hex chars, got ${hash}`);
  }
  const escaped = JSON.stringify(relPath).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const pattern = new RegExp(`(${escaped}:\\s*")[a-f0-9]{64}(")`);
  const next = manifestText.replace(pattern, `$1${hash}$2`);
  if (next === manifestText) {
    throw new Error(`no hash entry for ${relPath}`);
  }
  return next;
}
