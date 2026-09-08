import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { writeVerificationReceipt } from "../scripts/verification-receipt";

it("preserves historical defaults and refuses to overwrite an explicit receipt", () => {
  const root = mkdtempSync(join(tmpdir(), "mlai-receipt-"));
  try {
    const historical = join(root, "historical.json");
    const current = join(root, "run", "current.json");
    writeVerificationReceipt(historical, { status: "old" }, []);
    writeVerificationReceipt(historical, { status: "new" }, [
      "--output",
      current,
    ]);
    expect(JSON.parse(readFileSync(historical, "utf8"))).toEqual({
      status: "old",
    });
    expect(JSON.parse(readFileSync(current, "utf8"))).toEqual({
      status: "new",
    });
    expect(() =>
      writeVerificationReceipt(historical, {}, ["--output", current]),
    ).toThrow();
    expect(JSON.parse(readFileSync(current, "utf8"))).toEqual({
      status: "new",
    });
    writeVerificationReceipt(historical, { status: "legacy" }, []);
    expect(JSON.parse(readFileSync(historical, "utf8"))).toEqual({
      status: "legacy",
    });
    expect(() =>
      writeVerificationReceipt(historical, {}, ["--output", " "]),
    ).toThrow(/empty/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
