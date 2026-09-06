import "./env";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { dataDir } from "../src/lib/server/config";
const binary = process.env.MLAI_WDBX_BINARY;
if (!binary || !existsSync(binary))
  throw new Error(
    "Set MLAI_WDBX_BINARY to the existing ABI WDBX gateway executable in .env.local.",
  );
const directory = join(dataDir, "gateway"),
  token = join(directory, "token");
mkdirSync(directory, { recursive: true, mode: 0o700 });
if (!existsSync(token))
  writeFileSync(token, randomBytes(32).toString("hex"), {
    mode: 0o600,
    flag: "wx",
  });
const child = spawn(
  binary,
  [
    "--grpc",
    "127.0.0.1:3104",
    "--events",
    "127.0.0.1:3105",
    "--store",
    join(directory, "playground.wdbx"),
    "--token-file",
    token,
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => child.kill(signal));
child.on("error", () => {
  console.error("The configured gateway could not start.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
console.log(
  "Dedicated WDBX playground: loopback port 3104. Bind it to one workspace in Connections.",
);
