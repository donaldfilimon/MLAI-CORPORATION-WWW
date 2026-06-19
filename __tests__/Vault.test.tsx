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
});
