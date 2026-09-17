import { expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { workspaceSlice } from "../scripts/workspace-slice";

// A fixture repository, so the test also runs inside the clean-install copy,
// which is not a Git checkout.
it("lists the root install inputs and every other workspace manifest", () => {
  const root = mkdtempSync(join(tmpdir(), "mlai-slice-test-"));
  try {
    const write = (file: string, body = "{}\n") => {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), body);
    };
    write(
      "package.json",
      JSON.stringify({
        workspaces: [
          "packages/*",
          "apps/web",
          "apps/quasar/packages/*",
          "apps/website-app",
          "apps/website-app/packages/*",
        ],
      }),
    );
    write("bun.lock");
    write("bunfig.toml", '[install]\nlinker = "isolated"\n');
    write("packages/contracts/package.json");
    write("packages/contracts/src/index.ts", "export {};\n");
    write("apps/web/package.json");
    write("apps/web/src/page.tsx", "export {};\n");
    write("apps/quasar/packages/shared/package.json");
    write("apps/quasar/templates/next-site/package.json");
    write("apps/research-sites/package.json");
    write("apps/website-app/package.json");
    write("apps/website-app/packages/ui/package.json");
    write(".gitignore", "node_modules/\n");
    write("packages/contracts/node_modules/ignored/package.json");
    execFileSync("git", ["init", "-q"], { cwd: root });

    const slice = workspaceSlice(join(root, "apps/website-app"));
    expect(slice.appPath).toBe("apps/website-app");
    expect(slice.files).toEqual([
      "apps/quasar/packages/shared/package.json",
      "apps/web/package.json",
      "bun.lock",
      "bunfig.toml",
      "package.json",
      "packages/contracts/package.json",
      "packages/contracts/src/index.ts",
    ]);
    expect(slice.sha256).toMatch(/^[0-9a-f]{64}$/);

    rmSync(join(root, "bunfig.toml"));
    expect(() => workspaceSlice(join(root, "apps/website-app"))).toThrow(
      "Workspace slice is missing bunfig.toml.",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
