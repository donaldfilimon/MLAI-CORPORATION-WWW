import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NoteForm } from "@/components/NoteForm";

const base = {
  title: "",
  body: "",
  onChangeTitle: () => {},
  onChangeBody: () => {},
  onSubmit: () => {},
  submitLabel: "SAVE →",
  busy: false,
  titleLabel: "Note title",
  bodyLabel: "Note body",
};

describe("NoteForm", () => {
  it("renders composer mode (no Cancel) with the submit label", () => {
    const { getByText, queryByText } = render(<NoteForm {...base} title="hi" />);
    expect(getByText("SAVE →")).toBeTruthy();
    expect(queryByText("CANCEL")).toBeNull();
  });

  it("renders edit mode (with Cancel) and fires both callbacks", () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <NoteForm {...base} title="hi" submitLabel="UPDATE →" onSubmit={onSubmit} onCancel={onCancel} />,
    );
    fireEvent.press(getByText("CANCEL"));
    fireEvent.press(getByText("UPDATE →"));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("hides the submit label while busy (spinner shown instead)", () => {
    const { queryByText } = render(<NoteForm {...base} title="hi" busy />);
    expect(queryByText("SAVE →")).toBeNull();
  });

  it("forwards title input changes", () => {
    const onChangeTitle = jest.fn();
    const { getByLabelText } = render(<NoteForm {...base} onChangeTitle={onChangeTitle} />);
    fireEvent.changeText(getByLabelText("Note title"), "groceries");
    expect(onChangeTitle).toHaveBeenCalledWith("groceries");
  });
});
