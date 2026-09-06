import "./env";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "../src/lib/server/config";
await import("../src/lib/server/db");
const result = spawnSync("uv", ["sync", "--frozen", "--project", "worker"], {
  stdio: "inherit",
});
if (result.status !== 0) throw new Error("Python worker installation failed.");
const parserSetup = spawnSync(
  "uv",
  ["run", "--project", "worker", "python", "worker/bootstrap.py"],
  { stdio: "inherit" },
);
if (parserSetup.status !== 0)
  throw new Error(
    "Document setup is incomplete. Fix the reported dependency and rerun setup.",
  );
const path = join(dataDir, "connections.json");
if (!existsSync(path))
  writeFileSync(
    path,
    JSON.stringify(
      [
        {
          id: "mlx",
          name: "MLX Core",
          kind: "local",
          url: process.env.MLAI_LOCAL_MODEL_URL || "http://127.0.0.1:8080/v1",
          model: process.env.MLAI_LOCAL_MODEL_ID || "",
        },
      ],
      null,
      2,
    ) + "\n",
    { mode: 0o600, flag: "wx" },
  );
console.log(
  "Setup complete. Operator connections:",
  path,
  "\nRun bun run dev to open MLAI on http://127.0.0.1:3100.",
);
