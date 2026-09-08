import "./env";
import { spawn } from "node:child_process";
import { appUrl } from "../src/lib/server/config";
await import("../src/lib/server/db");
const production = process.argv.includes("--production");
const port = new URL(appUrl).port || "3100";
const children = [
  spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      production ? "start" : "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      port,
    ],
    { stdio: "inherit" },
  ),
  spawn(process.execPath, ["--import", "tsx", "scripts/worker.ts"], {
    stdio: "inherit",
  }),
];
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
}
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, stop);
for (const child of children)
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code || 1;
      stop();
    }
  });
