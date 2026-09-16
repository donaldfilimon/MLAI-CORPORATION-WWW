"use client";

import { LogoMark } from "@/components/LogoMark";
import { Button } from "@/components/ui/button";

/* The pre-auth panel for /console. Two-up: the trust argument on the left, the
   single action on the right. There is no signup path by design — membership is
   managed in WorkOS, and saying so here prevents a dead-end for the reader. */

const TRUST = [
  "Organization membership, not open signup",
  "Explicit consent before the first chat",
  "User export and deletion; MFA-gated admin reads",
];

export function ConsoleGate({
  onContinue,
  onRequestAccess,
  error,
}: {
  onContinue: () => void;
  onRequestAccess: () => void;
  error?: string | null;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="glass-card hidden flex-col justify-between p-10 lg:flex"
          aria-labelledby="gate-context-heading"
        >
          <div>
            <div className="label-chip mb-7">INVITE-ONLY BETA</div>
            <h1
              id="gate-context-heading"
              className="mb-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white"
            >
              A private console with a record you can inspect.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-text-dim">
              The console revalidates organization membership before every generation, routes the
              model through a metadata-only gateway, and stores each conversation under a one-year
              encrypted audit policy.
            </p>
          </div>
          <ul className="mt-10 grid gap-2.5">
            {TRUST.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-bg/40 p-3.5 font-mono text-xs text-text-dim"
              >
                <span aria-hidden="true" className="text-cyan-400">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card flex flex-col justify-center text-center" aria-labelledby="gate-heading">
          <div className="mb-6 flex justify-center">
            <LogoMark size="md" />
          </div>
          <h2 id="gate-heading" className="mb-2.5 font-display text-2xl font-semibold text-white">
            Enter the console
          </h2>
          <p className="mb-7 text-sm text-text-dim">
            Continue with the account named in your organization invitation.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left text-sm leading-relaxed text-amber-200"
            >
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <Button onClick={onContinue} className="w-full py-6 text-base font-semibold">
              Continue with AuthKit →
            </Button>
            <Button
              variant="outline"
              onClick={onRequestAccess}
              className="w-full py-6 text-base font-semibold"
            >
              Request beta access
            </Button>
          </div>

          <p className="pt-7 font-mono text-[10px] tracking-wide text-text-dim/70">
            No public account creation. Membership is managed in WorkOS.
          </p>
        </section>
      </div>
    </div>
  );
}
