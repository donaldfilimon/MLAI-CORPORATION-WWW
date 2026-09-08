"use client";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Brand } from "./brand.js";
import { Anchor, type LinkComponent } from "./link.js";
export type AuthFormValues = Record<string, FormDataEntryValue>;
export interface AuthFormProps {
  signup?: boolean;
  /**
   * Authenticates and navigates on success. Credential transport and routing
   * belong to the application, not to the design system. Without a handler the
   * form reports that it is unwired rather than reporting a signed-in state.
   */
  onSubmit?: (values: AuthFormValues) => Promise<void>;
  architectureHref?: string;
  signInHref?: string;
  signUpHref?: string;
  termsHref?: string;
  privacyHref?: string;
  brandMark?: string;
  Link?: LinkComponent;
}
async function unconfigured(): Promise<void> {
  throw new Error("This form has no authentication handler configured.");
}
export function AuthForm({
  signup = false,
  onSubmit = unconfigured,
  architectureHref = "/architecture",
  signInHref = "/sign-in",
  signUpHref = "/sign-up",
  termsHref = "/terms",
  privacyHref = "/privacy",
  brandMark,
  Link = Anchor,
}: AuthFormProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const formId = useId();
  return (
    <main id="main" className="auth-page">
      <div className="auth-story">
        <Brand mark={brandMark} Link={Link} />
        <div>
          <h1>
            Intelligence, <br />
            with a place <br />
            to work.
          </h1>
          <p>
            Your projects. Your sources.
            <br />
            Your choice of model.
          </p>
        </div>
        <Link href={architectureHref} className="text-link">
          Read the architecture <ArrowRight size={16} />
        </Link>
      </div>
      <div className="auth-form-wrap">
        <form
          className="auth-form"
          aria-labelledby={`${formId}-heading`}
          aria-describedby={error ? `${formId}-error` : undefined}
          aria-busy={busy}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fields = Object.fromEntries(
              new FormData(e.currentTarget),
            ) as AuthFormValues;
            try {
              await onSubmit(fields);
            } catch (e) {
              setError(
                e instanceof Error && e.message
                  ? e.message
                  : "Authentication could not be completed. Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 id={`${formId}-heading`}>
            {signup ? "Create your workspace" : "Welcome back"}
          </h2>
          <p className="muted">
            {signup
              ? "A local account. A private place to begin."
              : "Sign in to your MLAI workspace."}
          </p>
          {signup && (
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength={100} />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              aria-describedby={signup ? `${formId}-email-hint` : undefined}
              required
            />
          </label>
          {signup && (
            <p id={`${formId}-email-hint`} className="small muted">
              Email is a local account identifier and is not automatically
              verified.
            </p>
          )}
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 12 : undefined}
              aria-describedby={signup ? `${formId}-password-hint` : undefined}
              required
              maxLength={128}
            />
          </label>
          {signup && (
            <p id={`${formId}-password-hint`} className="small muted">
              Use at least 12 characters.
            </p>
          )}
          {error && (
            <p id={`${formId}-error`} className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
          <p>
            {signup ? "Already have an account? " : "New to MLAI? "}
            <Link href={signup ? signInHref : signUpHref}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          {!signup && (
            <details className="recovery">
              <summary>Need to reset your password?</summary>
              <p>
                This local release uses operator-assisted recovery. Ask the
                installation operator to run the account reset command for your
                email.
              </p>
            </details>
          )}
          <p className="small muted">
            By using the local application, you agree to the{" "}
            <Link href={termsHref}>terms</Link> and{" "}
            <Link href={privacyHref}>privacy policy</Link>.
          </p>
        </form>
      </div>
    </main>
  );
}
