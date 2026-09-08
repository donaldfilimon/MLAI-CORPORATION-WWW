import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

/** Explicit output paths are new receipts; default paths retain legacy behavior. */
export function writeVerificationReceipt(
  defaultPath: string,
  receipt: unknown,
  args = process.argv.slice(2),
): string {
  const { values } = parseArgs({
    args,
    options: { output: { type: "string" } },
  });
  if (values.output !== undefined && !values.output.trim()) {
    throw new Error("Receipt output path must not be empty.");
  }
  const path = resolve(values.output ?? defaultPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(receipt, null, 2)}\n`, {
    flag: values.output === undefined ? "w" : "wx",
  });
  return path;
}
