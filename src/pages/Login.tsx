import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Login() {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const error = params.get("error");
  const mode = params.get("mode") === "signup" ? "signup" : "signin";

  // Already signed in — go home
  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-20 pb-20 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl relative z-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch"
      >
        <div className="hidden overflow-hidden glass-card p-10 flex-col justify-between lg:flex">
          <div>
            <div className="label-chip mb-8">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              WORKOS PROTECTED
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
              Secure access for private AI workflows.
            </h1>
            <p className="text-sm leading-relaxed text-text-dim">
              Create an MLAI account to access protected LLM APIs, private
              orchestration tools, and future team workspaces behind AuthKit
              sessions.
            </p>
          </div>
          <div className="mt-12 grid gap-4">
            {[
              "Hosted sign-in and sign-up via WorkOS AuthKit",
              "HttpOnly encrypted MLAI session cookie",
              "Protected API routes for LLM workflow features",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-bg/40 p-4 text-xs text-text-dim font-mono"
              >
                <Sparkles
                  className="h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between">
          <div className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl font-display font-black text-white text-xl shadow-lg"
              >
                M
              </Link>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              {mode === "signup"
                ? "Create your MLAI account"
                : "Welcome to MLAI"}
            </h2>
            <p className="text-sm text-text-dim mb-6">
              {mode === "signup"
                ? "Sign up with AuthKit to enter the private console"
                : "Sign in with your preferred provider via AuthKit"}
            </p>
          </div>

          <div className="space-y-4 py-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
              >
                {error === "auth_failed"
                  ? "Authentication failed. Please try again."
                  : error === "auth_not_configured"
                    ? "Authentication is not configured on this server."
                    : error === "missing_code"
                      ? "The authentication callback was missing a code. Please retry."
                      : "An error occurred. Please try again."}
              </motion.div>
            )}

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-text-dim" />
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  id="workos-primary-auth-btn"
                  onClick={() =>
                    mode === "signup" ? signup("/console") : login("/console")
                  }
                  className="w-full py-6 text-base font-semibold bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 rounded-xl transition-all cursor-pointer"
                >
                  {mode === "signup" ? "Create Account" : "Continue to Console"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    mode === "signup" ? login("/console") : signup("/console")
                  }
                  className="w-full py-6 text-base font-semibold rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/10 cursor-pointer"
                >
                  {mode === "signup"
                    ? "I already have an account"
                    : "Create a new account"}
                </Button>
              </div>
            )}

            <p className="text-center text-[10px] font-mono tracking-wide text-text-dim/80 pt-4">
              Supports Google, GitHub, Microsoft, email magic-link & SSO.
            </p>
          </div>

          <div className="flex justify-center pt-6 border-t border-white/5">
            <p className="text-xs text-text-dim">
              By continuing you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>

        {/* WorkOS branding */}
        <p className="text-center text-[11px] text-text-dim/40 mt-4 lg:col-span-2">
          Secured by{" "}
          <a
            href="https://workos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-dim transition-colors"
          >
            WorkOS AuthKit
          </a>
        </p>
      </motion.div>
    </div>
  );
}
