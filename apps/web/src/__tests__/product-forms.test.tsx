import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: {
    userId: "user-1",
    email: "member@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    avatarUrl: null,
    organizationId: "org-1",
    authenticationMethod: "password",
    company: "MLAI",
    useCase: "Research",
  },
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }: React.PropsWithChildren<{ to: string }>) =>
    React.createElement("a", { href: to, ...props }, children),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock("framer-motion", () => ({
  m: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement("div", props, children),
  },
}));

vi.mock("../lib/auth", () => ({
  useAuth: () => ({
    user: state.user,
    loading: false,
    login: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../lib/ui-context", () => ({ useUI: () => ({ openInquiry: vi.fn() }) }));

vi.mock("../lib/api", () => ({
  createCheckout: vi.fn(),
  getAuthFeatures: vi.fn(),
  getBillingPlans: vi.fn(),
  updateProfile: vi.fn(),
  verifyWorkosUser: vi.fn(),
}));

import { Login } from "../views/Login";
import { Profile } from "../views/Profile";

describe("product forms", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses product language for the primary sign-in action", () => {
    const loginHtml = renderToStaticMarkup(<Login />);
    expect(loginHtml).toContain("Sign in to Quesar");
    expect(loginHtml).not.toContain("Continue with AuthKit");
  });

  it("limits the profile use case to the server's accepted length", () => {
    const html = renderToStaticMarkup(<Profile />);
    expect(html).toMatch(/id="useCase"[^>]*maxLength="240"/);
  });
});
