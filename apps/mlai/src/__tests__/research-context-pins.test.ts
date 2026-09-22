import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { researchContext } from "../data/categories/research-context";

// Pins into this repository, plus the imported mlai-website-app whose history
// was merged here on 2026-09-16, resolve locally. The abbey and specimen pins
// live in other repositories and are not checkable from this checkout.
const LOCAL_REPOS = [
  "https://github.com/donaldfilimon/MLAI-CORPORATION-WWW/blob/",
  "https://github.com/donaldfilimon/mlai-website-app/blob/",
];

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const localPins = researchContext.flatMap((study) =>
  study.sources.flatMap((source) => {
    const prefix = LOCAL_REPOS.find((p) => source.url.startsWith(p));
    if (!prefix) return [];
    const [sha, ...rest] = source.url.slice(prefix.length).split("/");
    return [{ slug: study.slug, source, sha, path: rest.join("/") }];
  }),
);

describe("research context source pins", () => {
  it("covers the locally checkable pins", () => {
    expect(localPins.length).toBeGreaterThan(0);
  });

  it.each(localPins)(
    "$slug: $path exists at the pinned commit with the recorded digest",
    ({ source, sha, path }) => {
      expect(sha).toBe(source.revision);
      // `git show` fails (and throws) when the path is absent at that commit.
      const bytes = execFileSync("git", ["show", `${sha}:${path}`], {
        cwd: repoRoot,
        maxBuffer: 16 * 1024 * 1024,
      });
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        source.sha256,
      );
    },
  );
});
