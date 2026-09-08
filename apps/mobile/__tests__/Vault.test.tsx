import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { RefreshControl } from "react-native";
import * as cloud from "@/lib/cloud";
import * as SecureStore from "expo-secure-store";

// Mock the screen's two environmental deps; let the real cloud repository run
// against the in-memory expo-secure-store mock (local-fallback path).
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: { id: "guest", name: "Preview", email: null, provider: "guest" } }),
  initialsFor: () => "PV",
}));

import Vault from "@/app/(tabs)/vault";
import { NoteForm } from "@/components/NoteForm";

const store = SecureStore as unknown as { __reset: () => void };
beforeEach(() => store.__reset());

describe("Vault screen (local fallback)", () => {
  it("loads empty, then adds a note that appears in the list", async () => {
    const screen = render(<Vault />);
    await waitFor(() => expect(screen.getByText(/Nothing saved yet/)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText("Note title"), "Groceries");
    fireEvent.changeText(screen.getByLabelText("Note body"), "milk, eggs");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));

    await waitFor(() => expect(screen.getByText("Groceries")).toBeTruthy());
    expect(screen.getByText("milk, eggs")).toBeTruthy();
  });

  it("deletes a note", async () => {
    const screen = render(<Vault />);
    await waitFor(() => expect(screen.getByText(/Nothing saved yet/)).toBeTruthy());

    fireEvent.changeText(screen.getByLabelText("Note title"), "Disposable");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await waitFor(() => expect(screen.getByText("Disposable")).toBeTruthy());

    fireEvent.press(screen.getByLabelText("Delete Disposable"));
    await waitFor(() => expect(screen.queryByText("Disposable")).toBeNull());
  });

  const seedTwoNotes = async (screen: ReturnType<typeof render>) => {
    await waitFor(() => expect(screen.getByText(/Nothing saved yet/)).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText("Note title"), "Apples");
    fireEvent.changeText(screen.getByLabelText("Note body"), "fruit");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await waitFor(() => expect(screen.getByText("Apples")).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText("Note title"), "Bread");
    fireEvent.changeText(screen.getByLabelText("Note body"), "bakery");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await waitFor(() => expect(screen.getByText("Bread")).toBeTruthy());
  };

  it("filters the list by the search query", async () => {
    const screen = render(<Vault />);
    await seedTwoNotes(screen);

    fireEvent.changeText(screen.getByLabelText("Search notes"), "appl");
    await waitFor(() => expect(screen.queryByText("Bread")).toBeNull());
    expect(screen.getByText("Apples")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("Search notes"), "zzz");
    await waitFor(() => expect(screen.getByText(/No notes match/)).toBeTruthy());
  });

  it("edits a note in place", async () => {
    const screen = render(<Vault />);
    await seedTwoNotes(screen);

    fireEvent.press(screen.getByLabelText("Edit Apples"));
    fireEvent.changeText(screen.getByLabelText("Edit note title"), "Green apples");
    fireEvent.press(screen.getByText("UPDATE →"));

    await waitFor(() => expect(screen.getByText("Green apples")).toBeTruthy());
    expect(screen.queryByText("Apples")).toBeNull();
    expect(screen.getByText("Bread")).toBeTruthy(); // the other note is untouched
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe("Vault recovery", () => {
  afterEach(() => jest.restoreAllMocks());
  const note = { recordName: "saved", title: "Saved note", body: "Original", createdAt: 1 };
  async function loaded() {
    jest.spyOn(cloud, "listItems").mockResolvedValue([note]);
    const screen = render(<Vault />);
    await waitFor(() => expect(screen.getByText("Saved note")).toBeTruthy());
    return screen;
  }
  it("blocks saving during initial load while allowing drafts and retaining existing notes and status", async () => {
    const initial = deferred<cloud.VaultItem[]>();
    jest.spyOn(cloud, "listItems").mockReturnValueOnce(initial.promise);
    const add = jest.spyOn(cloud, "addItem");
    const screen = render(<Vault />);
    fireEvent.changeText(screen.getByLabelText("Note title"), "Waiting draft");
    fireEvent.changeText(screen.getByLabelText("Note body"), "Keep this text");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await act(async () => screen.UNSAFE_getByType(NoteForm).props.onSubmit());
    expect(add).not.toHaveBeenCalled();
    await act(async () => initial.resolve([note]));
    expect(screen.getByText("Saved note")).toBeTruthy();
    expect(screen.getByText(/Local only/)).toBeTruthy();
    expect(screen.getByLabelText("Note title").props.value).toBe("Waiting draft");
    expect(screen.getByLabelText("Note body").props.value).toBe("Keep this text");
    expect(screen.queryByText(/Nothing saved yet/)).toBeNull();
  });
  it("shows load recovery instead of a false empty vault on initial corruption", async () => {
    jest.spyOn(cloud, "listItems").mockRejectedValueOnce(new cloud.VaultStorageError("malformed-json", "Unreadable vault"));
    const screen = render(<Vault />);
    await waitFor(() => expect(screen.getByText("Unreadable vault")).toBeTruthy());
    expect(screen.queryByText(/Nothing saved yet/)).toBeNull();
    expect(screen.getByLabelText("Retry loading vault")).toBeTruthy();
  });
  it("retains a note on failed deletion and retries with its delete action", async () => {
    const screen = await loaded();
    jest.spyOn(cloud, "removeItem").mockRejectedValueOnce(new Error("Delete failed")).mockResolvedValueOnce(undefined);
    fireEvent.press(screen.getByLabelText("Delete Saved note"));
    await waitFor(() => expect(screen.getByText("Delete failed")).toBeTruthy());
    expect(screen.getByText("Saved note")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Delete Saved note"));
    await waitFor(() => expect(screen.queryByText("Saved note")).toBeNull());
  });
  it("retains visible notes and both drafts after refresh failure, then retries", async () => {
    const screen = await loaded();
    fireEvent.changeText(screen.getByLabelText("Note title"), "New draft");
    fireEvent.press(screen.getByLabelText("Edit Saved note"));
    fireEvent.changeText(screen.getByLabelText("Edit note title"), "Edit draft");
    jest.mocked(cloud.listItems).mockRejectedValueOnce(new Error("Storage locked"));
    fireEvent(screen.UNSAFE_getByType(RefreshControl), "refresh");
    await waitFor(() => expect(screen.getByText("Storage locked")).toBeTruthy());
    expect(screen.getByLabelText("Note title").props.value).toBe("New draft");
    expect(screen.getByLabelText("Edit note title").props.value).toBe("Edit draft");
    fireEvent.press(screen.getByLabelText("Retry loading vault"));
    await waitFor(() => expect(screen.queryByText("Storage locked")).toBeNull());
    expect(screen.getByLabelText("Edit note title").props.value).toBe("Edit draft");
  });
  it("retains add and edit drafts on failed writes and succeeds on retry", async () => {
    const screen = await loaded();
    jest.spyOn(cloud, "addItem").mockRejectedValueOnce(new Error("Write failed"))
      .mockResolvedValueOnce({ ...note, recordName: "new", title: "New draft" });
    fireEvent.changeText(screen.getByLabelText("Note title"), "New draft");
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await waitFor(() => expect(screen.getByText("Write failed")).toBeTruthy());
    expect(screen.getByLabelText("Note title").props.value).toBe("New draft");
    expect(screen.getByText("Saved note")).toBeTruthy();
    fireEvent.press(screen.getByText("SAVE TO VAULT →"));
    await waitFor(() => expect(screen.getByText("New draft")).toBeTruthy());
    jest.spyOn(cloud, "updateItem").mockRejectedValueOnce(new Error("Edit failed"))
      .mockResolvedValueOnce({ ...note, title: "Edited" });
    fireEvent.press(screen.getByLabelText("Edit Saved note"));
    fireEvent.changeText(screen.getByLabelText("Edit note title"), "Edited");
    fireEvent.press(screen.getByText("UPDATE →"));
    await waitFor(() => expect(screen.getByText("Edit failed")).toBeTruthy());
    expect(screen.getByLabelText("Edit note title").props.value).toBe("Edited");
    fireEvent.press(screen.getByText("UPDATE →"));
    await waitFor(() => expect(screen.getByText("Edited")).toBeTruthy());
  });
  it("ignores a stale refresh completing after a successful edit", async () => {
    const screen = await loaded();
    const stale = deferred<cloud.VaultItem[]>();
    jest.mocked(cloud.listItems).mockReturnValueOnce(stale.promise);
    fireEvent(screen.UNSAFE_getByType(RefreshControl), "refresh");
    jest.spyOn(cloud, "updateItem").mockResolvedValueOnce({ ...note, title: "Edited" });
    fireEvent.press(screen.getByLabelText("Edit Saved note"));
    fireEvent.changeText(screen.getByLabelText("Edit note title"), "Edited");
    fireEvent.press(screen.getByText("UPDATE →"));
    await waitFor(() => expect(screen.getByText("Edited")).toBeTruthy());
    await act(async () => stale.resolve([note]));
    expect(screen.getByText("Edited")).toBeTruthy();
    expect(screen.queryByText("Saved note")).toBeNull();
  });
  it("ignores older refresh results and errors after the latest refresh succeeds", async () => {
    const screen = await loaded();
    const older = deferred<cloud.VaultItem[]>();
    const latest = deferred<cloud.VaultItem[]>();
    jest.mocked(cloud.listItems).mockReturnValueOnce(older.promise).mockReturnValueOnce(latest.promise);
    fireEvent(screen.UNSAFE_getByType(RefreshControl), "refresh");
    fireEvent(screen.UNSAFE_getByType(RefreshControl), "refresh");
    await act(async () => latest.resolve([{ ...note, title: "Latest" }]));
    await act(async () => older.reject(new Error("Stale error")));
    expect(screen.getByText("Latest")).toBeTruthy();
    expect(screen.queryByText("Stale error")).toBeNull();
  });
  it("keeps an edit draft visible when refresh removes the note and search excludes it", async () => {
    const screen = await loaded();
    fireEvent.press(screen.getByLabelText("Edit Saved note"));
    fireEvent.changeText(screen.getByLabelText("Edit note title"), "Keep me");
    fireEvent.changeText(screen.getByLabelText("Search notes"), "unrelated");
    expect(screen.getByLabelText("Edit note title").props.value).toBe("Keep me");
    jest.mocked(cloud.listItems).mockResolvedValueOnce([]);
    await act(async () => fireEvent(screen.UNSAFE_getByType(RefreshControl), "refresh"));
    expect(screen.getByLabelText("Edit note title").props.value).toBe("Keep me");
  });
});
