import * as nativeCloud from "@/modules/mlai-cloudkit";
import * as SecureStore from "expo-secure-store";
import { backend, getStatus, describeStatus, listItems, addItem, removeItem, updateItem, reinsertSorted, applyEdit, filterItems, type VaultStatus, type VaultItem } from "@/lib/cloud";

// The manual mock (__mocks__/expo-secure-store.js) exposes these test helpers.
const mock = SecureStore as unknown as { __reset: () => void; __seed: (k: string, v: string) => void; __store: Map<string, string> };
const FALLBACK_KEY = "mlai.vault.local.v1";

beforeEach(() => {
  mock.__reset(); jest.clearAllMocks();
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => mock.__store.get(key) ?? null);
  jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => { mock.__store.set(key, value); });
});
afterEach(() => jest.restoreAllMocks());

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
    expect(describeStatus({ backend: "cloudkit", account: "available" })).toEqual({ ok: true, label: "Private iCloud account available" });
    expect(describeStatus({ backend: "cloudkit", account: "noAccount" }).ok).toBe(false);
    expect(describeStatus({ backend: "cloudkit", account: "restricted" }).ok).toBe(false);
  });
});

describe("local fallback repository", () => {
  it("only treats an absent record as empty", async () => {
    await expect(listItems()).resolves.toEqual([]);
    mock.__seed(FALLBACK_KEY, "");
    await expect(listItems()).rejects.toMatchObject({ code: "malformed-json" });
  });

  it.each([
    ["{ invalid", "malformed-json"],
    ['{"rogue":true}', "invalid-records"],
    ['[null]', "invalid-records"],
    ['[{"recordName":"a","title":1,"body":"","createdAt":1}]', "invalid-records"],
    ['[{"recordName":"a","title":"","body":"","createdAt":1e400}]', "invalid-records"],
    ['[{"recordName":"a","title":"","body":"","createdAt":1},{"recordName":"a","title":"","body":"","createdAt":1}]', "invalid-records"],
  ])("preserves corrupt bytes through reads and every mutation: %s", async (raw, code) => {
    mock.__seed(FALLBACK_KEY, raw);
    await expect(listItems()).rejects.toMatchObject({ code });
    await expect(addItem("new", "")).rejects.toMatchObject({ code });
    await expect(updateItem("a", "new", "", 1)).rejects.toMatchObject({ code });
    await expect(removeItem("a")).rejects.toMatchObject({ code });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(await SecureStore.getItemAsync(FALLBACK_KEY)).toBe(raw);
  });

  it("does not overwrite storage when reads fail", async () => {
    const read = jest.spyOn(SecureStore, "getItemAsync").mockRejectedValue(new Error("locked"));
    await expect(listItems()).rejects.toMatchObject({ code: "read" });
    await expect(addItem("A", "")).rejects.toMatchObject({ code: "read" });
    await expect(updateItem("a", "A", "", 1)).rejects.toMatchObject({ code: "read" });
    await expect(removeItem("a")).rejects.toMatchObject({ code: "read" });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    read.mockRestore();
  });

  it("reports write failure and releases the queue for a retry", async () => {
    const original = await addItem("original", "");
    const bytes = await SecureStore.getItemAsync(FALLBACK_KEY);
    jest.spyOn(SecureStore, "setItemAsync").mockRejectedValueOnce(new Error("full"));
    await expect(updateItem(original.recordName, "changed", "", original.createdAt)).rejects.toMatchObject({ code: "write" });
    expect(await SecureStore.getItemAsync(FALLBACK_KEY)).toBe(bytes);
    await addItem("retry", "");
    expect((await listItems()).map((i) => i.title)).toEqual(expect.arrayContaining(["original", "retry"]));
  });

  it("serializes concurrent adds, edits and deletes without losing unrelated notes", async () => {
    const [a, b] = await Promise.all([addItem("A", ""), addItem("B", "")]);
    await Promise.all([
      updateItem(a.recordName, "A edited", "body", a.createdAt),
      removeItem(b.recordName),
      addItem("C", ""),
      addItem("D", ""),
    ]);
    expect((await listItems()).map((i) => i.title).sort()).toEqual(["A edited", "C", "D"]);
  });

  it("does not claim an edit succeeded when its record was removed", async () => {
    mock.__seed(FALLBACK_KEY, "[]");
    await expect(updateItem("missing", "draft", "body", 1)).rejects.toMatchObject({ code: "missing-record" });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
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

  it("gives locally-added notes unique recordNames even within the same millisecond", async () => {
    const now = jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    try {
      const a = await addItem("A", "");
      const b = await addItem("B", ""); // same frozen createdAt as a
      expect(a.recordName).not.toBe(b.recordName);
      // deleting one must leave the other (a shared recordName would drop both)
      await removeItem(a.recordName);
      expect((await listItems()).map((i) => i.title)).toEqual(["B"]);
    } finally {
      now.mockRestore();
    }
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


describe("native failures never fall back to local storage", () => {
  it("propagates CloudKit read/write/delete/account errors without touching SecureStore", async () => {
    const failure = new Error("Native unavailable");
    jest.spyOn(nativeCloud, "getCloudKit").mockReturnValue({
      getAccountStatus: jest.fn().mockRejectedValue(failure),
      query: jest.fn().mockRejectedValue(failure),
      save: jest.fn().mockRejectedValue(failure),
      remove: jest.fn().mockRejectedValue(failure),
    });
    await expect(getStatus()).rejects.toBe(failure);
    await expect(listItems()).rejects.toBe(failure);
    await expect(addItem("a", "b")).rejects.toBe(failure);
    await expect(updateItem("a", "b", "c", 1)).rejects.toBe(failure);
    await expect(removeItem("a")).rejects.toBe(failure);
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
