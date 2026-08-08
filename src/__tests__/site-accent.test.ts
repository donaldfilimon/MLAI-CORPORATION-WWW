import { describe, it, expect } from "vitest";
import { accentClasses, ACCENTS, type Accent } from "@/components/site/accent";

describe("site accent axis", () => {
  it("maps every product accent to the Lab ramp it owns", () => {
    expect(accentClasses("wdbx").text).toBe("text-cyan-300");
    expect(accentClasses("abi").text).toBe("text-violet-300");
    expect(accentClasses("abbey").text).toBe("text-emerald-300");
  });

  it("gives each accent a distinct ramp", () => {
    const texts = ACCENTS.map((a) => accentClasses(a).text);
    expect(new Set(texts).size).toBe(ACCENTS.length);
  });

  it("falls back to the wdbx ramp for an unknown accent", () => {
    // Guards the runtime path when a value arrives from untyped content data.
    expect(accentClasses("nope" as Accent)).toEqual(accentClasses("wdbx"));
    expect(accentClasses(undefined)).toEqual(accentClasses("wdbx"));
  });

  it("emits complete class literals, never interpolated fragments", () => {
    // Tailwind scans source text for whole class names. A value built as
    // `text-${accent}-300` compiles to no CSS at all and the component renders
    // unstyled, so every string here must be a full, standalone utility.
    for (const accent of ACCENTS) {
      const c = accentClasses(accent);
      for (const value of [c.text, c.border, c.bg, c.dot]) {
        expect(value).not.toContain("${");
        expect(value).toMatch(/^[a-z]+(-[a-z0-9/[\].]+)+$/);
      }
    }
  });

  it("exposes glow colors as bare rgb triples for rgb(... / alpha)", () => {
    for (const accent of ACCENTS) {
      expect(accentClasses(accent).glowRgb).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
    }
  });
});

describe("site components never build class names at runtime", () => {
  // Regression guard. `Callout.tsx` shipped `a.border.replace("border-",
  // "border-l-")`, which produces `border-l-cyan-400/25` — a name Tailwind's
  // source scan never sees, so no CSS is emitted and all three accents fell
  // back to the same gray border. It fails silently: nothing throws, nothing
  // logs, the component just renders wrong. The earlier version of this suite
  // only checked for `${...}` interpolation and missed it entirely.
  const CLASS_PREFIXES =
    "text|bg|border|ring|from|via|to|fill|stroke|divide|outline|shadow|accent|decoration";

  // Both patterns must be built with `new RegExp` — a regex *literal* does not
  // interpolate `${...}`, which is how the first draft of this very test was
  // silently inert.
  const REWRITE = new RegExp(`\\.(?:replace|concat)\\(\\s*["'\`][\\w-]*(?:${CLASS_PREFIXES})-`);
  const TEMPLATE = new RegExp(`\`[^\`]*(?:${CLASS_PREFIXES})-\\$\\{`);

  const scan = (src: string, file: string): string[] =>
    src
      .split("\n")
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => !line.startsWith("//") && !line.startsWith("*"))
      .filter(({ line }) => REWRITE.test(line) || TEMPLATE.test(line))
      .map(({ line, n }) => `${file}:${n} ${line}`);

  it("catches the two shapes that produce dead classes", () => {
    // Proves the guard works, using the exact line that shipped broken.
    expect(scan(`className={a.border.replace("border-", "border-l-")}`, "x")).toHaveLength(1);
    expect(scan("const c = `text-${accent}-300`;", "x")).toHaveLength(1);
    // …and does not fire on legitimate uses.
    expect(scan('className={cn("border-l-2", a.border)}', "x")).toEqual([]);
    expect(scan("`${row.label}-${row.tag}`", "x")).toEqual([]);
  });

  it("uses no string manipulation to derive utility classes", async () => {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");

    const dir = join(process.cwd(), "src/components/site");
    const offenders = readdirSync(dir)
      .filter((f) => /\.tsx?$/.test(f))
      .flatMap((f) => scan(readFileSync(join(dir, f), "utf8"), f));

    expect(offenders).toEqual([]);
  });
});
