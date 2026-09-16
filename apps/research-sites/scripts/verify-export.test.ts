import { test, expect } from "bun:test";
import { mkdtemp, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { verifyExport } from "./verify-export.ts";

test("packaging verifies canonical bytes and fails closed without repairing evidence", async () => {
  const root = await mkdtemp(join(tmpdir(), "research-package-"));
  const manifest = {
    format: "mlai-research-review",
    version: 1,
    sourceDirty: false,
    sourceRevision: "a".repeat(40),
    files: {
      "index.html": createHash("sha256").update("review").digest("hex"),
    },
  };
  const receipt = join(root, "research-manifest.json");
  try {
    await writeFile(receipt, JSON.stringify(manifest));
    await writeFile(join(root, "index.html"), "review");
    expect((await verifyExport(root)).files).toBe(1);
    await writeFile(join(root, "index.html"), "changed");
    await expect(verifyExport(root)).rejects.toThrow("hash mismatch");
    await writeFile(join(root, "index.html"), "review");
    await writeFile(join(root, "untracked.js"), "extra");
    await expect(verifyExport(root)).rejects.toThrow("inventory mismatch");
    await rm(join(root, "untracked.js"));
    await rm(join(root, "index.html"));
    await expect(verifyExport(root)).rejects.toThrow("inventory mismatch");
    await symlink(receipt, join(root, "index.html"));
    await expect(verifyExport(root)).rejects.toThrow("Non-regular");
    await rm(join(root, "index.html"));
    await writeFile(join(root, "index.html"), "review");
    await writeFile(
      receipt,
      JSON.stringify({ ...manifest, sourceDirty: true }),
    );
    await expect(verifyExport(root)).rejects.toThrow("Invalid clean");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
