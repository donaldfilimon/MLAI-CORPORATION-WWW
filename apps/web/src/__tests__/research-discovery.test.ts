import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

function harness(search = "") {
  type Event = { target?: unknown; preventDefault(): void };
  const listeners: Record<string, (event: Event) => void> = {};
  const makeField = (values: string[]) => ({
    value: "",
    focused: false,
    focus() {
      this.focused = true;
    },
    options: values.map((value) => ({ value, dataset: {} })),
    append(option: { value: string; dataset: {} }) {
      this.options.push(option);
    },
  });
  const fields = {
    q: makeField([]),
    topic: makeField(["", "wdbx", "ai"]),
    type: makeField(["", "research-note", "implementation-study"]),
  };
  const cards = [
    {
      dataset: {
        publicationTag: "RESEARCH",
        topics: "wdbx",
        type: "research-note",
      },
      textContent: "Memory and traceable retrieval",
      hidden: false,
    },
    {
      dataset: { topics: "ai wdbx", type: "implementation-study" },
      textContent: "Six-layer agent behavior",
      hidden: false,
    },
  ];
  const nodes = Object.fromEntries(
    ["publication-status", "clear-search", "reset-filters", "clear-all"].map(
      (id) => [
        id,
        {
          textContent: "",
          hidden: false,
          addEventListener: (_event: string, fn: (event: Event) => void) => {
            listeners[id] = fn;
          },
        },
      ],
    ),
  );
  const location = {
    pathname: "/research",
    search,
    hash: "#publications-heading",
  };
  const saved: { mode: string; url: string }[] = [];
  const save =
    (mode: string) => (_state: unknown, _title: string, url: string) => {
      saved.push({ mode, url });
      location.search = new URL(url, "http://example.test").search;
    };
  runInNewContext(readFileSync("scripts/research-discovery.js", "utf8"), {
    URLSearchParams,
    location,
    history: { replaceState: save("replace"), pushState: save("push") },
    window: {
      addEventListener: (event: string, fn: (event: Event) => void) => {
        listeners[event] = fn;
      },
    },
    document: {
      querySelector: () => ({
        elements: { namedItem: (key: keyof typeof fields) => fields[key] },
        addEventListener: (event: string, fn: (event: Event) => void) => {
          listeners[event] = fn;
        },
      }),
      querySelectorAll: () => cards,
      createElement: () => ({
        value: "",
        textContent: "",
        dataset: {},
        remove() {},
      }),
      getElementById: (id: string) => nodes[id],
    },
  });
  const fire = (name: string, target?: unknown) =>
    listeners[name]!({ target, preventDefault() {} });
  return { fields, cards, nodes, location, saved, fire };
}

it("discovers studies across every area and retains unrelated URL state and fragments", () => {
  const h = harness(
    "?q=six-layer&topic=wdbx&type=implementation-study&campaign=review",
  );
  expect(h.cards.map((c) => c.hidden)).toEqual([true, false]);
  expect(h.nodes["publication-status"]!.textContent).toBe(
    "1 research documents shown.",
  );
  h.fields.topic.value = "ai";
  h.fire("change", h.fields.topic);
  expect(h.cards.map((c) => c.hidden)).toEqual([true, false]);
  expect(h.saved.at(-1)).toEqual({
    mode: "push",
    url: "/research?q=six-layer&topic=ai&type=implementation-study&campaign=review#publications-heading",
  });
  h.fields.q.value = "absent";
  h.fire("input", h.fields.q);
  expect(h.saved.at(-1)?.mode).toBe("replace");
  expect(h.nodes["publication-status"]!.textContent).toBe(
    "No research matches your search and filters.",
  );
  expect(h.nodes["clear-all"]!.hidden).toBe(false);
  h.fire("clear-all");
  expect(h.cards.every((c) => !c.hidden)).toBe(true);
  expect(h.fields.q.focused).toBe(true);
  expect(h.saved.at(-1)?.url).toBe(
    "/research?campaign=review#publications-heading",
  );
});

it("keeps independent recovery controls and restores browser navigation and legacy area URLs", () => {
  const h = harness("?q=absent");
  expect(h.nodes["publication-status"]!.textContent).toBe(
    "No research matches your search.",
  );
  h.location.search = "?track=wdbx&type=implementation-study";
  h.fire("popstate");
  expect(h.cards.map((c) => c.hidden)).toEqual([true, false]);
  h.fields.q.value = "six-layer";
  h.fire("input", h.fields.q);
  h.fire("reset-filters");
  expect(h.fields.q.value).toBe("six-layer");
  expect(h.fields.topic.value).toBe("");
  h.fields.topic.value = "ai";
  h.fire("change", h.fields.topic);
  h.fire("clear-search");
  expect(h.fields.topic.value).toBe("ai");
  expect(h.fields.q.value).toBe("");
});

it("represents invalid URL filters rather than silently showing unrelated results", () => {
  const h = harness("?topic=unknown&type=unrecognized");
  expect(h.fields.topic.value).toBe("unknown");
  expect(h.cards.every((c) => c.hidden)).toBe(true);
  expect(h.nodes["publication-status"]!.textContent).toBe(
    "No research matches these filters.",
  );
  h.fire("reset-filters");
  expect(h.cards.every((c) => !c.hidden)).toBe(true);
});
