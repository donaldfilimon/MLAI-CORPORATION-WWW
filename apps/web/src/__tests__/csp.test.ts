import { describe, it, expect } from "vitest";
import { buildCsp } from "@/lib/csp";

const prod = buildCsp({ dev: false });
const dev = buildCsp({ dev: true });

/** Pull one directive out of a joined CSP string. */
function directive(csp: string, name: string): string {
  const found = csp
    .split("; ")
    .find((d) => d === name || d.startsWith(`${name} `));
  if (!found) throw new Error(`missing directive: ${name}`);
  return found;
}

describe("CSP policy", () => {
  it("never ships 'unsafe-eval' in production", () => {
    // Token-exact on purpose: a substring check would also match the
    // legitimate 'wasm-unsafe-eval' and pass no matter what we shipped.
    for (const d of prod.split("; ")) {
      expect(d.split(" ")).not.toContain("'unsafe-eval'");
    }
  });

  it("grants 'unsafe-eval' in development so React Refresh can hot-reload", () => {
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
  });

  it("differs between dev and production ONLY by 'unsafe-eval'", () => {
    expect(dev.replace(" 'unsafe-eval'", "")).toBe(prod);
  });

  it("keeps 'wasm-unsafe-eval' in both — it is not the eval escape hatch", () => {
    // 'wasm-unsafe-eval' only permits WebAssembly compilation (the Kokoro
    // voice runtime); it must survive the production strip above.
    expect(directive(prod, "script-src")).toContain("'wasm-unsafe-eval'");
  });

  it("locks down the framing and object surface", () => {
    for (const csp of [prod, dev]) {
      expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
      expect(directive(csp, "object-src")).toBe("object-src 'none'");
      expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
      expect(directive(csp, "form-action")).toBe("form-action 'self'");
      expect(directive(csp, "default-src")).toBe("default-src 'self'");
    }
  });

  it("never widens a directive to a bare https: wildcard", () => {
    for (const csp of [prod, dev]) {
      for (const d of csp.split("; ")) {
        expect(d.split(" ")).not.toContain("https:");
        expect(d.split(" ")).not.toContain("*");
      }
    }
  });

  it("keeps the external origins the real runtime surface needs", () => {
    // Kokoro neural voice, PoseNet checkpoints, team avatars, Google Fonts.
    expect(directive(prod, "script-src")).toContain("https://cdn.jsdelivr.net");
    expect(directive(prod, "connect-src")).toContain("https://storage.googleapis.com");
    expect(directive(prod, "connect-src")).toContain("https://huggingface.co");
    expect(directive(prod, "img-src")).toContain("https://avatars.githubusercontent.com");
    expect(directive(prod, "style-src")).toContain("https://fonts.googleapis.com");
    expect(directive(prod, "font-src")).toContain("https://fonts.gstatic.com");
  });

  // The two assertions below do not exist in the upstream original: this
  // monorepo's policy carries a Turnstile surface and violation reporting that
  // the pre-monorepo tree never had. Without them, a future extraction could
  // silently drop either and still pass every test above.
  it("keeps the Cloudflare Turnstile challenge surface", () => {
    for (const csp of [prod, dev]) {
      expect(directive(csp, "script-src")).toContain("https://challenges.cloudflare.com");
      expect(directive(csp, "frame-src")).toBe("frame-src https://challenges.cloudflare.com");
    }
  });

  it("keeps violation reporting on both directives", () => {
    // `report-to` is current; `report-uri` is kept because Safari and older
    // Firefox still only implement that one. Losing either blinds the
    // hand-curated allowlist to its own breakage.
    for (const csp of [prod, dev]) {
      expect(directive(csp, "report-to")).toBe("report-to csp-endpoint");
      expect(directive(csp, "report-uri")).toBe("report-uri /api/csp-report");
    }
  });
});
