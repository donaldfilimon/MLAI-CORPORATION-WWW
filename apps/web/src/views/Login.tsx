import { useEffect } from "react";
import { m } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui-context";

export function Login() {
  const { user, loading, login } = useAuth();
  const { openInquiry } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const error = params.get("error");
  const requesting = params.get("mode") === "request-access";

  useEffect(() => {
    if (!loading && user) navigate("/console");
  }, [user, loading, navigate]);

  const errorCopy =
    error === "organization_access_required"
      ? "This account is not an active member of the Quesar beta organization. Request access or ask your organization administrator for an invitation."
      : error === "auth_failed"
        ? "Authentication failed. Please try again."
        : error === "auth_not_configured"
          ? "Authentication is not configured on this server."
          : error === "missing_code"
            ? "The authentication callback was missing a code. Please retry."
            : error === "invalid_state"
              ? "This sign-in link expired or was already used. Start again from this page."
              : error
                ? "An error occurred. Please try again."
                : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-20 pt-20 font-sans">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-card hidden flex-col justify-between overflow-hidden p-10 lg:flex" aria-labelledby="login-context-heading">
          <div>
            <div className="label-chip mb-8"><ShieldCheck className="h-3.5 w-3.5" /> INVITE-ONLY BETA</div>
            <h1 id="login-context-heading" className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-white">A private console with a record you can inspect.</h1>
            <p className="max-w-xl text-sm leading-relaxed text-text-dim">Quesar revalidates WorkOS organization membership before every generation, routes Gemini through Cloudflare without payload logging, and stores the resulting conversation under a one-year encrypted audit policy.</p>
          </div>
          <div className="mt-12 grid gap-3">
            {["Organization membership, not open signup", "Explicit consent before the first chat", "User export and deletion; MFA-gated admin reads"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-bg/40 p-4 font-mono text-xs text-text-dim"><Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />{item}</div>)}
          </div>
        </section>

        <section className="glass-card flex flex-col justify-between" aria-labelledby="login-heading">
          <div className="pb-2 text-center">
            <div className="mb-7 flex justify-center"><Logo /></div>
            <h2 id="login-heading" className="mb-3 font-display text-2xl font-bold text-white">{requesting ? "Request Quesar access" : "Enter Quesar"}</h2>
            <p className="text-sm text-text-dim">{requesting ? "Tell MLAI which governed workflow you want to evaluate." : "Continue with the account named in your organization invitation."}</p>
          </div>

          <div className="space-y-4 py-6">
            {errorCopy && <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200">{errorCopy}</m.div>}
            {loading ? <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-text-dim" /></div> : <div className="space-y-3">
              {requesting ? <Button onClick={openInquiry} className="w-full py-6 text-base font-semibold">Start access request <ArrowRight className="h-5 w-5" /></Button> : <Button id="workos-primary-auth-btn" onClick={() => login("/console")} className="w-full py-6 text-base font-semibold">Continue with AuthKit <ArrowRight className="h-5 w-5" /></Button>}
              <Button asChild variant="outline" className="w-full py-6 text-base font-semibold"><Link to={requesting ? "/login" : "/login?mode=request-access"}>{requesting ? "I already have an invitation" : "Request beta access"}</Link></Button>
            </div>}
            <p className="pt-3 text-center font-mono text-[10px] tracking-wide text-text-dim/70">No public account creation. Membership is managed in WorkOS.</p>
          </div>

          <div className="flex justify-center border-t border-white/5 pt-6"><p className="text-xs text-text-dim">By continuing you agree to our <Link to="/terms" className="text-primary hover:text-white">Terms of Service</Link>.</p></div>
        </section>
      </m.div>
    </div>
  );
}
