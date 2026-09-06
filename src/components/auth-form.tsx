"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Brand } from "./brand";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <main id="main" className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <h1>
            Intelligence,
            <br />
            with a place
            <br />
            to work.
          </h1>
          <p>
            Your projects. Your sources.
            <br />
            Your choice of model.
          </p>
        </div>
        <Link href="/architecture" className="text-link">
          Read the architecture <ArrowRight size={16} />
        </Link>
      </div>
      <div className="auth-form-wrap">
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const response = await fetch(
                `/api/auth/${signup ? "sign-up/email" : "sign-in/email"}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...fields, callbackURL: "/app" }),
                },
              );
              const result = await response.json();
              if (!response.ok)
                throw new Error(result.message || "Sign-in failed.");
              const requested = new URLSearchParams(window.location.search).get(
                "returnTo",
              );
              router.push(
                requested?.startsWith("/app") && !requested.startsWith("//")
                  ? requested
                  : "/app",
              );
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>{signup ? "Create your workspace" : "Welcome back"}</h2>
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
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 12 : undefined}
              required
              maxLength={128}
            />
          </label>
          {signup && (
            <p className="small muted">
              Use at least 12 characters. Email is a local account identifier
              and is not automatically verified.
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
          <p>
            {signup ? "Already have an account? " : "New to MLAI? "}
            <Link href={signup ? "/sign-in" : "/sign-up"}>
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
            <Link href="/terms">terms</Link> and{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        </form>
      </div>
    </main>
  );
}
