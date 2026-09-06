import { describe, expect, test } from "bun:test";
import { replaceFileHash } from "./replace-file-hash.ts";

const OLD =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT =
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

describe("replaceFileHash", () => {
  test("replaces only the named 64-hex hash", () => {
    const input = `{
  "files": {
    "404.html": "${OLD}",
    "assets/filter.js": "${OLD}"
  }
}
`;
    const output = replaceFileHash(input, "assets/filter.js", NEXT);
    expect(output).toContain(`"assets/filter.js": "${NEXT}"`);
    expect(output).toContain(`"404.html": "${OLD}"`);
  });

  test("throws when the path is missing", () => {
    expect(() =>
      replaceFileHash(`{"files":{}}`, "assets/filter.js", NEXT),
    ).toThrow("assets/filter.js");
  });

  test("succeeds on an idempotent rebuild where the hash is already correct", () => {
    const input = `{"files":{"assets/filter.js": "${OLD}"}}`;
    const output = replaceFileHash(input, "assets/filter.js", OLD);
    expect(output).toBe(input);
  });
});
