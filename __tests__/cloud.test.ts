import * as SecureStore from "expo-secure-store";
import { backend, describeStatus, listItems, addItem, removeItem, type VaultStatus } from "@/lib/cloud";

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
});
