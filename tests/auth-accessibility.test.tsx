import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthForm } from "../packages/ui/src/auth-form";
import { PublicNav } from "../packages/ui/src/public-nav";

describe("shared auth and navigation accessibility", () => {
  it("preserves heading word boundaries when decorative line breaks disappear", () => {
    const html = renderToStaticMarkup(<AuthForm />);
    const heading = html.match(/<h1>(.*?)<\/h1>/)?.[1];
    expect(heading?.replaceAll("<br/>", "")).toBe(
      "Intelligence, with a place to work.",
    );
  });

  it("associates each signup requirement with its corresponding field", () => {
    const html = renderToStaticMarkup(<AuthForm signup />);
    for (const name of ["email", "password"]) {
      const input = html.match(
        new RegExp(`<input[^>]*name="${name}"[^>]*>`),
      )?.[0];
      const description = input?.match(/aria-describedby="([^"]+)"/)?.[1];
      expect(description).toBeTruthy();
      expect(html).toContain(`id="${description}"`);
    }
    expect(html).toContain("Use at least 12 characters.");
    expect(html).toContain("aria-labelledby=");
    expect(html).toContain('aria-busy="false"');
  });

  it("does not attach signup-only requirements to sign-in fields", () => {
    const html = renderToStaticMarkup(<AuthForm />);
    expect(html).not.toContain("email-hint");
    expect(html).not.toContain("password-hint");
  });

  it("names the public navigation landmark and preserves current-page semantics", () => {
    const html = renderToStaticMarkup(
      <PublicNav currentPath="/research/example" />,
    );
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toMatch(/<a[^>]*href="\/research"[^>]*aria-current="page"/);
  });
});
