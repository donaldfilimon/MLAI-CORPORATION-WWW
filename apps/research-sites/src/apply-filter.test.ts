import { describe, expect, test } from "bun:test";
import { applyFilter } from "./apply-filter.ts";

type Attrs = Record<string, string>;

function control(attrs: Attrs) {
  const store: Attrs = { ...attrs };
  return {
    getAttribute(name: string): string | null {
      return store[name] ?? null;
    },
    setAttribute(name: string, value: string): void {
      store[name] = value;
    },
  };
}

function item(tag: string) {
  const base = control({ "data-publication-tag": tag });
  return {
    ...base,
    hidden: false,
  };
}

describe("applyFilter", () => {
  test("presses only the selected button and hides non-matching cards", () => {
    const all = control({ "data-filter": "All" });
    const safety = control({ "data-filter": "SAFETY" });
    const overview = item("OVERVIEW");
    const safetyCard = item("SAFETY");
    const status = { textContent: "21 publications shown." };

    applyFilter(safety, [all, safety], [overview, safetyCard], status);

    expect(all.getAttribute("aria-pressed")).toBe("false");
    expect(safety.getAttribute("aria-pressed")).toBe("true");
    expect(overview.hidden).toBe(true);
    expect(safetyCard.hidden).toBe(false);
    expect(status.textContent).toBe("1 publications shown.");
  });

  test("All shows every card", () => {
    const all = control({ "data-filter": "All" });
    const overview = item("OVERVIEW");
    const safetyCard = item("SAFETY");
    overview.hidden = true;
    const status = { textContent: "" };

    applyFilter(all, [all], [overview, safetyCard], status);

    expect(overview.hidden).toBe(false);
    expect(safetyCard.hidden).toBe(false);
    expect(status.textContent).toBe("2 publications shown.");
  });

  test("zero matches writes the empty-status sentence and ignores a null status node", () => {
    const routing = control({ "data-filter": "ROUTING" });
    const overview = item("OVERVIEW");

    applyFilter(routing, [routing], [overview], null);

    expect(overview.hidden).toBe(true);
  });
});
