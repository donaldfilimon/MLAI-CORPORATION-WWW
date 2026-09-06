import { it, expect } from "vitest";
import { execFileSync, spawn } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { releaseSource } from "../scripts/release-source";
import {
  portAvailable,
  stopProcessTree,
} from "../scripts/verification-process";

it("includes new workspace sources and detects edits without hashing generated output or receipts", () => {
  const root = mkdtempSync(join(tmpdir(), "mlai-source-test-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: root, stdio: "pipe" });
  try {
    git("init");
    writeFileSync(
      join(root, ".gitignore"),
      "node_modules/\n.data/\npackages/*/dist/\n",
    );
    git("add", ".gitignore");
    git(
      "-c",
      "user.name=Release fixture",
      "-c",
      "user.email=fixture@example.test",
      "commit",
      "-m",
      "fixture",
    );
    for (const path of [
      "packages/ui/src",
      "packages/ui/dist",
      ".data",
      "docs/verification",
    ])
      mkdirSync(join(root, path), { recursive: true });
    writeFileSync(
      join(root, "packages/ui/src/index.ts"),
      "export const value = 1;",
    );
    writeFileSync(join(root, ".data/secret"), "fixture secret");
    const first = releaseSource(root);
    expect(first.files.map(({ file }) => file)).toContain(
      "packages/ui/src/index.ts",
    );
    expect(first.files.map(({ file }) => file)).not.toContain(".data/secret");
    writeFileSync(join(root, "packages/ui/dist/index.js"), "generated");
    writeFileSync(join(root, "docs/verification/result.json"), "{}");
    expect(releaseSource(root).runtimeSourceSha256).toBe(
      first.runtimeSourceSha256,
    );
    writeFileSync(
      join(root, "packages/ui/src/index.ts"),
      "export const value = 2;",
    );
    expect(releaseSource(root).runtimeSourceSha256).not.toBe(
      first.runtimeSourceSha256,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

it("loads the built UI through native ESM and preserves interactive client boundaries", () => {
  const output = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      'import {createElement} from "react"; import {renderToStaticMarkup} from "react-dom/server"; import {Brand, AuthForm} from "@mlai/ui"; console.log(renderToStaticMarkup(createElement(Brand))); if (typeof AuthForm !== "function") throw Error("Missing AuthForm");',
    ],
    { encoding: "utf8" },
  );
  expect(output).toContain("MLAI");
  for (const name of [
    "auth-form",
    "contact-form",
    "content-index",
    "public-nav",
  ])
    expect(
      readFileSync(`packages/ui/dist/${name}.js`, "utf8").trimStart(),
    ).toMatch(/^"use client";/);
});

it("stops a wrapper and its listening grandchild before reusing the verification port", async () => {
  const listener =
    'const s=require("node:net").createServer(); s.listen(0,"127.0.0.1",()=>console.log(s.address().port));';
  const wrapper = `require("node:child_process").spawn(process.execPath,["-e",${JSON.stringify(listener)}],{stdio:"inherit"});`;
  const child = spawn(process.execPath, ["-e", wrapper], {
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const port = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.stdout!.once("data", (data) => resolve(Number(String(data).trim())));
  });
  try {
    expect(await portAvailable(port)).toBe(false);
  } finally {
    await stopProcessTree(child, port);
  }
  expect(await portAvailable(port)).toBe(true);
});
