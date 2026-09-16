import { describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runVerificationCommand,
  selectedLocalModel,
  verificationCommandEnvironment,
  signalVerificationGroup,
} from "../scripts/verification-command";

describe("owned verification commands", () => {
  it.skipIf(process.platform !== "darwin")(
    "corroborates an EPERM probe with the process table",
    () => {
      const currentGroup = Number(
        execFileSync("/bin/ps", ["-o", "pgid=", "-p", String(process.pid)], {
          encoding: "utf8",
        }).trim(),
      );
      const error = Object.assign(new Error("kill EPERM"), { code: "EPERM" });
      const kill = vi.spyOn(process, "kill").mockImplementation(() => {
        throw error;
      });
      try {
        expect(signalVerificationGroup(2_000_000_000, 0)).toBe(false);
        expect(() => signalVerificationGroup(currentGroup, 0)).toThrow(error);
      } finally {
        kill.mockRestore();
      }
    },
  );
  it("lets check fixtures own their registries without changing setup selection", () => {
    const env = {
      ...process.env,
      MLAI_CONNECTIONS_FILE: "/isolated/clean/connections.json",
      MLAI_DATA_DIR: "/isolated/clean",
      MLAI_LOCAL_MODEL_URL: "http://127.0.0.1:3102/v1",
      MLAI_LOCAL_MODEL_ID: "selected-model",
    };
    const check = verificationCommandEnvironment(["run", "check"], env);
    expect(check).not.toHaveProperty("MLAI_CONNECTIONS_FILE");
    expect(check.MLAI_DATA_DIR).toBe(env.MLAI_DATA_DIR);
    expect(check.MLAI_LOCAL_MODEL_URL).toBe(env.MLAI_LOCAL_MODEL_URL);
    expect(check.MLAI_LOCAL_MODEL_ID).toBe(env.MLAI_LOCAL_MODEL_ID);
    expect(verificationCommandEnvironment(["run", "setup"], env)).toEqual(env);
    expect(
      verificationCommandEnvironment(["install", "--frozen-lockfile"], env),
    ).toEqual(env);
    expect(env.MLAI_CONNECTIONS_FILE).toBe("/isolated/clean/connections.json");
  });
  it("stops the restarted server before writing a successful clean receipt", () => {
    const source = readFileSync("scripts/verify-clean-install.ts", "utf8");
    const persistenceCheck = source.indexOf("const projects = await fetch");
    const receipt = source.indexOf(
      'join(origin, "docs/verification/clean-install.json")',
    );
    const shutdown = source.indexOf("await stopServer();", persistenceCheck);
    expect(persistenceCheck).toBeGreaterThan(-1);
    expect(shutdown).toBeGreaterThan(persistenceCheck);
    expect(receipt).toBeGreaterThan(shutdown);
    expect(source.indexOf("passed = true;", receipt)).toBeGreaterThan(receipt);
  });
  it("reports success and nonzero exit", async () => {
    await runVerificationCommand(
      process.execPath,
      ["-e", "process.exit(0)"],
      {},
    );
    await expect(
      runVerificationCommand(process.execPath, ["-e", "process.exit(7)"], {}),
    ).rejects.toThrow("exited with 7");
  });
  it("kills a TERM-resistant grandchild before rejecting a timeout", async () => {
    const directory = mkdtempSync(join(tmpdir(), "mlai-process-test-"));
    const pidFile = join(directory, "pid");
    try {
      const grandchild = `process.on('SIGTERM',()=>{});require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setInterval(()=>{},100);`;
      const parent = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{stdio:'ignore'});setInterval(()=>{},100);`;
      await expect(
        runVerificationCommand(process.execPath, ["-e", parent], {}, 1000, 100),
      ).rejects.toThrow("timed out");
      const pid = Number(readFileSync(pidFile, "utf8"));
      expect(() => process.kill(pid, 0)).toThrow();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it("reports missing executables without hanging", async () => {
    await expect(
      runVerificationCommand("/nonexistent/mlai-verifier", [], {}),
    ).rejects.toThrow("ENOENT");
  });
  it("cleans descendants even when the command exits successfully", async () => {
    const directory = mkdtempSync(join(tmpdir(), "mlai-process-success-"));
    const pidFile = join(directory, "pid");
    try {
      const grandchild = `process.on('SIGTERM',()=>{});require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setInterval(()=>{},100);`;
      const parent = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{stdio:'ignore'}).unref();const timer=setInterval(()=>{if(require('node:fs').existsSync(${JSON.stringify(pidFile)}))clearInterval(timer)},10);`;
      await runVerificationCommand(
        process.execPath,
        ["-e", parent],
        {},
        1000,
        100,
      );
      expect(() =>
        process.kill(Number(readFileSync(pidFile, "utf8")), 0),
      ).toThrow();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("explicit clean model selection", () => {
  it("maps live verifier selection to setup without changing the model", () => {
    expect(
      selectedLocalModel({
        MLAI_MODEL_URL: "http://127.0.0.1:3102/v1",
        MLAI_MODEL_ID: "selected-model",
      }),
    ).toEqual({
      MLAI_LOCAL_MODEL_URL: "http://127.0.0.1:3102/v1",
      MLAI_LOCAL_MODEL_ID: "selected-model",
    });
  });
  it("rejects missing, hosted and conflicting selection", () => {
    expect(() => selectedLocalModel({})).toThrow("explicitly selected");
    expect(() =>
      selectedLocalModel({
        MLAI_MODEL_URL: "https://example.com/v1",
        MLAI_MODEL_ID: "model",
      }),
    ).toThrow("loopback");
    expect(() =>
      selectedLocalModel({
        MLAI_MODEL_URL: "http://127.0.0.1:3102/v1",
        MLAI_LOCAL_MODEL_URL: "http://127.0.0.1:8080/v1",
        MLAI_MODEL_ID: "model",
      }),
    ).toThrow("Conflicting");
  });
});
