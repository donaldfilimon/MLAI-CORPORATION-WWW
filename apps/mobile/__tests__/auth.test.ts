import { initialsFor, type AuthUser } from "@/lib/auth";

const apple = (name: string | null): AuthUser => ({ id: "x", name, email: null, provider: "apple" });

describe("initialsFor", () => {
  it("takes up to two initials from a name, uppercased", () => {
    expect(initialsFor(apple("Donald Filimon"))).toBe("DF");
    expect(initialsFor(apple("donald"))).toBe("D");
    expect(initialsFor(apple("Ada B C D"))).toBe("AB");
  });

  it("ignores stray internal whitespace", () => {
    expect(initialsFor(apple("Donald   Filimon"))).toBe("DF");
  });

  it("falls back to PV for a guest session", () => {
    expect(initialsFor({ id: "guest", name: null, email: null, provider: "guest" })).toBe("PV");
  });

  it("falls back to ID for a nameless Apple user and for null", () => {
    expect(initialsFor(apple(null))).toBe("ID");
    expect(initialsFor(null)).toBe("ID");
  });
});
