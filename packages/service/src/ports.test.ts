import { test, expect } from "bun:test";
import { allocatePort } from "./ports";

test("allocatePort with no taken ports returns default base 4710", () => {
  expect(allocatePort([])).toBe(4710);
});

test("allocatePort skips taken ports and ignores nulls", () => {
  expect(allocatePort([4710, 4711, null])).toBe(4712);
});

test("allocatePort respects a custom base", () => {
  expect(allocatePort([], 5000)).toBe(5000);
  expect(allocatePort([5000], 5000)).toBe(5001);
});

test("allocatePort finds first gap when ports are non-contiguous", () => {
  expect(allocatePort([4710, 4712])).toBe(4711);
});
