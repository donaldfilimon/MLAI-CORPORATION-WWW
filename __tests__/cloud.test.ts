import * as SecureStore from "expo-secure-store";
import { backend, describeStatus, listItems, addItem, removeItem, updateItem, reinsertSorted, applyEdit, filterItems, type VaultStatus, type VaultItem } from "@/lib/cloud";

// The manual mock (__mocks__/expo-secure-store.js) exposes these test helpers.
const mock = SecureStore as unknown as { __reset: () => void; __seed: (k: string, v: string) => void };
const FALLBACK_KEY = "mlai.vault.local.v1";

beforeEach(() => mock.__reset());

describe("backend selection", () => {
  it("falls back to 'local' when the native CloudKit module is absent (test env)", () => {
    expect(backend).toBe("local");
  });
});

describe("describeStatus", () => {
  it("flags a local-only backend as not-ok", () => {
    const s: VaultStatus = { backend: "local", account: "local" };
    const d = describeStatus(s);
    expect(d.ok).toBe(false);
    expect(d.label).toMatch(/Local only/);
  });

  it("maps CloudKit account states to ok/labels", () => {
    expect(describeStatus({ backend: "cloudkit", account: "available" }).ok).toBe(true);
    expect(describeStatus({ backend: "cloudkit", account: "noAccount" }).ok).toBe(false);
    expect(describeStatus({ backend: "cloudkit", account: "restricted" }).ok).toBe(false);
  });
});

describe("local fallback repository", () => {
  it("returns [] for a corrupt SecureStore blob instead of throwing", async () => {
    mock.__seed(FALLBACK_KEY, "{ not valid json");
    await expect(listItems()).resolves.toEqual([]);
  });

  it("returns [] for a non-array JSON value", async () => {
    mock.__seed(FALLBACK_KEY, JSON.stringify({ rogue: true }));
    await expect(listItems()).resolves.toEqual([]);
  });

  it("round-trips add -> list -> remove", async () => {
    const created = await addItem("Title", "Body");
    expect(created.recordName).toContain("local-");

    const after = await listItems();
    expect(after.map((i) => i.title)).toEqual(["Title"]);

    await removeItem(created.recordName);
    await expect(listItems()).resolves.toEqual([]);
  });

  it("lists newest item first", async () => {
    await addItem("first", "");
    await addItem("second", "");
    const list = await listItems();
    expect(list.map((i) => i.title)).toEqual(["second", "first"]);
  });

  it("updates an item in place via the local repository, preserving createdAt", async () => {
    const created = await addItem("Title", "body");
    await updateItem(created.recordName, "Title 2", "body 2", created.createdAt);
    const list = await listItems();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      recordName: created.recordName,
      title: "Title 2",
      body: "body 2",
      createdAt: created.createdAt,
    });
  });
});

describe("reinsertSorted (failed-delete rollback)", () => {
  const mk = (name: string, createdAt: number): VaultItem => ({ recordName: name, title: name, body: "", createdAt });

  it("re-inserts the removed item WITHOUT dropping items added during the in-flight delete", () => {
    // A was optimistically removed; meanwhile C was added and B still present.
    // Rolling back must keep C — a whole-list snapshot restore would lose it.
    const current = [mk("C", 2), mk("B", 0)];
    const rolledBack = reinsertSorted(current, mk("A", 1));
    expect(rolledBack.map((i) => i.recordName)).toEqual(["C", "A", "B"]);
  });

  it("places the re-inserted item by createdAt (newest-first)", () => {
    expect(reinsertSorted([mk("X", 5)], mk("Y", 9)).map((i) => i.recordName)).toEqual(["Y", "X"]);
  });
});

describe("applyEdit", () => {
  const mk = (name: string, createdAt: number, title = name, body = ""): VaultItem => ({ recordName: name, title, body, createdAt });

  it("edits only the matching item's title/body, preserving position and createdAt", () => {
    const items = [mk("B", 2), mk("A", 1)];
    const next = applyEdit(items, "A", "A-new", "body-new");
    expect(next.map((i) => i.recordName)).toEqual(["B", "A"]); // order unchanged
    const edited = next.find((i) => i.recordName === "A")!;
    expect(edited).toMatchObject({ title: "A-new", body: "body-new", createdAt: 1 });
  });

  it("is a no-op for an unknown recordName and does not mutate the input", () => {
    const items = [mk("A", 1)];
    const next = applyEdit(items, "ZZZ", "x", "y");
    expect(next).toEqual(items);
    expect(items[0].title).toBe("A"); // input untouched
  });
});

describe("filterItems", () => {
  const items: VaultItem[] = [
    { recordName: "1", title: "Grocery list", body: "milk, eggs", createdAt: 2 },
    { recordName: "2", title: "Meeting", body: "discuss roadmap", createdAt: 1 },
  ];

  it("returns the list unchanged for an empty or whitespace query", () => {
    expect(filterItems(items, "")).toBe(items);
    expect(filterItems(items, "   ")).toBe(items);
  });

  it("matches title or body, case-insensitively", () => {
    expect(filterItems(items, "GROCERY").map((i) => i.recordName)).toEqual(["1"]);
    expect(filterItems(items, "roadmap").map((i) => i.recordName)).toEqual(["2"]);
    expect(filterItems(items, "milk").map((i) => i.recordName)).toEqual(["1"]);
  });

  it("returns [] when nothing matches", () => {
    expect(filterItems(items, "zzz")).toEqual([]);
  });
});
