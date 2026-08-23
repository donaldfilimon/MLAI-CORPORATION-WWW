import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

// Mock the screen's two environmental deps; let the real cloud repository run
// against the in-memory expo-secure-store mock (local-fallback path).
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: { id: "guest", name: "Preview", email: null, provider: "guest" } }),
  initialsFor: () => "PV",
}));

import Vault from "@/app/(tabs)/vault";

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
