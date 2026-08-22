import { test, expect } from "bun:test";
import { slugify, CreateSiteBody } from "./index";

test("slugify normalizes names", () => {
  expect(slugify("My Cool Site!")).toBe("my-cool-site");
  expect(slugify("--Weird__ Name--")).toBe("weird-name");
  expect(slugify("!!!")).toBe("site");
});

test("CreateSiteBody rejects empty prompt", () => {
  expect(CreateSiteBody.safeParse({ name: "a", prompt: "" }).success).toBe(false);
  expect(CreateSiteBody.safeParse({ name: "a", prompt: "hi" }).success).toBe(true);
});
