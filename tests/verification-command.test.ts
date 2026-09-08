import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runVerificationCommand,
  selectedLocalModel,
} from "../scripts/verification-command";

describe("owned verification commands", () => {
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
