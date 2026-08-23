import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorScreen } from "@/components/ErrorScreen";

describe("ErrorScreen", () => {
  it("shows the headline and the error message", () => {
    const { getByText } = render(<ErrorScreen error={new Error("kaboom in render")} retry={() => {}} />);
    expect(getByText("Something broke.")).toBeTruthy();
    expect(getByText("kaboom in render")).toBeTruthy();
  });

  it("falls back to 'Unknown error' when there is no message", () => {
    const { getByText } = render(<ErrorScreen error={null} retry={() => {}} />);
    expect(getByText("Unknown error")).toBeTruthy();
  });

  it("calls retry when TRY AGAIN is pressed", () => {
    const retry = jest.fn();
    const { getByText } = render(<ErrorScreen error={new Error("x")} retry={retry} />);
    fireEvent.press(getByText("TRY AGAIN →"));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
