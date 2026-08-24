import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  Copy,
  Download,
  Eye,
  KeyRound,
  Loader2,
  LockKeyhole,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  acceptChatConsent,
  deleteConversationAudit,
  getAdminConversationAudit,
  getAdminConversationAudits,
  getChatConsent,
  getConversationAudit,
  getConversationAudits,
  getLlmStatus,
  sendLlmMessage,
  withdrawChatConsent,
  type ChatConsent,
  type ChatMessage,
  type ConversationAudit,
  type ConversationAuditSummary,
  type LlmStatus,
} from "@/lib/api";

const LEGACY_HISTORY_KEYS = ["quesar_console_history", "mlai_console_history"];

function downloadJson(audit: ConversationAudit) {
  const blob = new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `quesar-audit-${audit.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Console() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<LlmStatus | null>(null);
  const [consent, setConsent] = useState<ChatConsent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState(
    "Draft a safe rollout plan for a private retrieval agent that summarizes internal research notes.",
  );
  const [reply, setReply] = useState("");
  const [audits, setAudits] = useState<ConversationAuditSummary[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<ConversationAudit | null>(null);
  const [adminAudits, setAdminAudits] = useState<ConversationAuditSummary[]>([]);
  const [adminReason, setAdminReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const refreshAudits = useCallback(async () => {
    const result = await getConversationAudits();
    setAudits(result.audits);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    // Conversation content is session-memory only. Remove keys written by
    // earlier builds so a shared browser cannot disclose one user's prompts
    // to the next account that signs in.
    for (const key of LEGACY_HISTORY_KEYS) localStorage.removeItem(key);
    Promise.all([getLlmStatus(), getChatConsent(), getConversationAudits()])
      .then(([nextStatus, nextConsent, nextAudits]) => {
        setStatus(nextStatus);
        setConsent(nextConsent.consent);
        setAudits(nextAudits.audits);
      })
      .catch((cause) => {
        const message = cause instanceof Error ? cause.message : "Protected console unavailable";
        setError(message);
      });
  }, [user]);

  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role === "assistant") setReply(last.content);
  }, [messages]);

  async function acceptPolicy() {
    if (!consent) return;
    setBusy(true);
    setError("");
    try {
      const result = await acceptChatConsent(consent.policyVersion);
      setConsent({
        policyVersion: result.consent.policyVersion,
        accepted: true,
        consentedAt: result.consent.consentedAt,
        withdrawnAt: null,
      });
    } catch {
      setError("The conversation audit policy could not be recorded.");
    } finally {
      setBusy(false);
    }
  }

  async function withdrawPolicy() {
    setBusy(true);
    try {
      await withdrawChatConsent();
      const next = await getChatConsent();
      setConsent(next.consent);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || !consent?.accepted) return;
    const nextMessages = [...messages, { role: "user" as const, content }].slice(-12);
    setBusy(true);
    setError("");
    try {
      const result = await sendLlmMessage(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: result.text }]);
      setReply(result.text);
      await refreshAudits();
    } catch {
      setError("Protected generation failed before a durable audit could be returned.");
    } finally {
      setBusy(false);
    }
  }

  async function viewAudit(id: string, admin = false) {
    setBusy(true);
    setError("");
    try {
      const result = admin
        ? await getAdminConversationAudit(id, adminReason.trim())
        : await getConversationAudit(id);
      setSelectedAudit(result.audit);
    } catch {
      setError(admin ? "Admin audit access requires MFA and a reason of at least 8 characters." : "Audit unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAdminAudits() {
    if (adminReason.trim().length < 8) return;
    setBusy(true);
    setError("");
    try {
      const result = await getAdminConversationAudits(adminReason.trim());
      setAdminAudits(result.audits);
    } catch {
      setAdminAudits([]);
      setError("Administrator inventory requires active organization membership, verified MFA policy, fresh authentication, and a recorded reason.");
    } finally {
      setBusy(false);
    }
  }

  async function exportAudit(id: string) {
    const result = await getConversationAudit(id, true);
    downloadJson(result.audit);
  }

  async function removeAudit(id: string) {
    if (!window.confirm("Delete this live encrypted audit now? Encrypted backups age out under the one-year retention policy.")) return;
    setBusy(true);
    try {
      await deleteConversationAudit(id);
      if (selectedAudit?.id === id) setSelectedAudit(null);
      setMessages([]);
      setReply("");
      await refreshAudits();
    } finally {
      setBusy(false);
    }
  }

  if (loading || (!user && !error)) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 text-text-dim">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Opening Quesar…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom flex min-h-screen items-center justify-center pt-24">
        <Card variant="glass" className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invitation required</CardTitle>
            <CardDescription>Quesar is available to active members of the MLAI beta organization.</CardDescription>
          </CardHeader>
          <CardContent><Button onClick={() => login("/console")} className="w-full">Continue with AuthKit</Button></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container-custom min-h-screen pb-24 pt-32 font-sans">
      <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-10 grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="label-chip mb-5"><LockKeyhole className="h-3.5 w-3.5" /> INVITE-ONLY BETA</div>
            <h1 className="section-title">Quesar private operations console.</h1>
            <p className="section-subtitle">Gemini generation through a metadata-only Cloudflare gateway, with WorkOS organization access and a KMS-encrypted audit trail you control.</p>
          </div>
          <Button asChild variant="outline"><Link to="/security">Review the trust boundary <ArrowRight className="h-4 w-4" /></Link></Button>
        </header>

        {error && <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="grid content-start gap-4">
            <Card variant="glass">
              <CardHeader><ShieldCheck className="mb-3 h-7 w-7 text-emerald-400" /><CardTitle>Authorized session</CardTitle><CardDescription>Active WorkOS organization membership is revalidated before generation.</CardDescription></CardHeader>
              <CardContent className="space-y-2 font-mono text-xs text-text-dim"><div className="break-all rounded-lg bg-black/30 p-3">{user.email}</div><div className="rounded-lg bg-black/30 p-3">org: {status?.user.organizationId ?? "verifying"}</div></CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader><KeyRound className="mb-3 h-7 w-7 text-cyan-400" /><CardTitle>Generation boundary</CardTitle><CardDescription>No user email is sent to the model provider.</CardDescription></CardHeader>
              <CardContent className="space-y-2 font-mono text-xs text-text-dim"><div className="rounded-lg bg-black/30 p-3">{status?.llm.model ?? "loading"}</div><div className="rounded-lg bg-black/30 p-3">{status?.llm.gateway ?? "cloudflare-ai-gateway"}</div><div className="rounded-lg bg-black/30 p-3">payload logs: disabled</div></CardContent>
            </Card>

            <Card variant="glass" className={consent?.accepted ? "border-emerald-400/20" : "border-amber-400/30"}>
              <CardHeader><CalendarClock className="mb-3 h-7 w-7 text-amber-300" /><CardTitle>One-year audit policy</CardTitle><CardDescription>Prompts and responses are encrypted with per-record keys, retained for 365 days, and available to you and MFA-gated administrators. Every admin read is reason-logged.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-xs text-text-dim">policy {consent?.policyVersion ?? "loading"}</div>
                {consent?.accepted ? <Button variant="outline" onClick={withdrawPolicy} disabled={busy} className="w-full">Withdraw consent</Button> : <Button onClick={acceptPolicy} disabled={busy || !consent} className="w-full"><Check className="h-4 w-4" /> Accept before first chat</Button>}
              </CardContent>
            </Card>
          </aside>

          <section className="grid content-start gap-6" aria-label="Quesar generation workspace">
            <Card variant="glass" className="shadow-2xl">
              <CardHeader className="flex-row items-start justify-between"><div><Bot className="mb-3 h-8 w-8 text-cyan-400" /><CardTitle>Private generation</CardTitle><CardDescription>A response is returned only after its encrypted audit record is durable. Browser chat stays only in this tab's memory.</CardDescription></div>{messages.length > 0 && <Button variant="ghost" size="icon" aria-label="Clear local conversation" onClick={() => { setMessages([]); setReply(""); }}><Trash2 className="h-4 w-4" /></Button>}</CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} maxLength={16000} aria-label="Prompt" className="min-h-40 resize-y rounded-2xl border-white/10 bg-black/40 text-white" />
                  <Button type="submit" disabled={busy || !consent?.accepted} className="w-full py-6">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Generate with audit</Button>
                </form>
                {reply && <div className="group relative mt-6 rounded-2xl border border-white/5 bg-bg/50 p-5"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Quesar response</span><Button variant="ghost" size="icon" aria-label="Copy response" onClick={async () => { await navigator.clipboard.writeText(reply); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}</Button></div><p className="whitespace-pre-wrap text-sm leading-relaxed text-text-dim">{reply}</p></div>}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader><CardTitle>Your encrypted audits</CardTitle><CardDescription>Read, export, or delete your live conversation records. Backup copies age out under the retention policy.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {audits.length === 0 ? <p className="text-sm text-text-dim">No durable conversations yet.</p> : audits.map((audit) => <div key={audit.id} className="grid gap-3 rounded-xl border border-white/8 bg-black/20 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="font-mono text-xs text-white">{audit.model}</div><div className="mt-1 text-xs text-text-dim">{new Date(audit.createdAt).toLocaleString()} · expires {new Date(audit.expiresAt).toLocaleDateString()}</div></div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="View audit" onClick={() => viewAudit(audit.id)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Export audit" onClick={() => exportAudit(audit.id)}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Delete audit" onClick={() => removeAudit(audit.id)}><Trash2 className="h-4 w-4 text-red-300" /></Button></div></div>)}
                {selectedAudit && <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-xs text-cyan-300">audit {selectedAudit.id}</span><Button variant="ghost" size="sm" onClick={() => setSelectedAudit(null)}>Close</Button></div><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-text-dim">{JSON.stringify(selectedAudit.content, null, 2)}</pre></div>}
              </CardContent>
            </Card>

            <Card variant="glass" className="border-violet-400/20"><CardHeader><CardTitle>Administrator audit access</CardTitle><CardDescription>Inventory and decrypted reads are organization-scoped, MFA-gated, fresh-auth gated, and reason-logged.</CardDescription></CardHeader><CardContent className="space-y-3"><Textarea value={adminReason} onChange={(event) => setAdminReason(event.target.value)} rows={2} maxLength={200} placeholder="Reason for this audit access (minimum 8 characters)" /><Button variant="outline" disabled={busy || adminReason.trim().length < 8} onClick={loadAdminAudits}>Load reason-logged inventory</Button>{adminAudits.slice(0, 20).map((audit) => <div key={audit.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/25 p-3"><div className="min-w-0"><div className="truncate font-mono text-xs">{audit.subjectHash}</div><div className="text-xs text-text-dim">{new Date(audit.createdAt).toLocaleString()}</div></div><Button variant="outline" size="sm" disabled={adminReason.trim().length < 8} onClick={() => viewAudit(audit.id, true)}>Read</Button></div>)}</CardContent></Card>
          </section>
        </div>
      </m.div>
    </main>
  );
}
