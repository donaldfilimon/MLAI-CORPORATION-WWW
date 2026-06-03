import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Loader2, LockKeyhole, Send, ShieldCheck, Terminal, Copy, Check, Trash2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { getInquiries, getLlmStatus, sendLlmMessage, type ChatMessage, type Inquiry, type LlmStatus } from '@/lib/api';

function loadStoredHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem('mlai_console_history');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function Console() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<LlmStatus | null>(null);
  const [prompt, setPrompt] = useState('Draft a safe rollout plan for a private retrieval agent that can summarize internal research notes.');
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredHistory);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const data = await getInquiries();
      if (data.ok) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user, fetchInquiries]);

  useEffect(() => {
    localStorage.setItem('mlai_console_history', JSON.stringify(messages));
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setReply(messages[messages.length - 1].content);
    }
  }, [messages]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setMessages([]);
    setReply('');
    localStorage.removeItem('mlai_console_history');
  };

  useEffect(() => {
    if (!loading && !user) navigate('/login?mode=signup');
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    getLlmStatus()
      .then(setStatus)
      .catch(() => setError('Could not load protected API status.'));
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user' as const, content: trimmed },
    ].slice(-8);

    setIsSending(true);
    setError('');

    try {
      const result = await sendLlmMessage(nextMessages);
      setMessages([...nextMessages, { role: 'assistant', content: result.text }]);
      setReply(result.text);
    } catch {
      setError('The protected LLM API request failed. Check server logs and provider configuration.');
    } finally {
      setIsSending(false);
    }
  }

  if (loading || (!user && !error)) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 text-text-dim">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading secure console...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom flex min-h-screen items-center justify-center pt-24">
        <Card variant="glass" className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Use WorkOS AuthKit to access the MLAI console.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => login('/console')} className="w-full">Continue with AuthKit</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom min-h-screen pt-32 pb-20 font-sans">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="label-chip mb-6">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              PRIVATE CONSOLE
            </div>
            <h1 className="section-title">Protected MLAI LLM API workspace.</h1>
            <p className="section-subtitle">This page proves the full flow: WorkOS-authenticated users can call server-side LLM endpoints without exposing provider keys to the browser.</p>
          </div>
          <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/[0.03] text-white hover:bg-white/10 cursor-pointer">
            <Link to="/docs">Read API Docs <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            <Card variant="glass" className="flex flex-col justify-between">
              <CardHeader>
                <ShieldCheck className="mb-4 h-8 w-8 text-emerald-400" />
                <CardTitle>Session</CardTitle>
                <CardDescription>Signed in via WorkOS AuthKit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-text-dim">
                <div className="break-all rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">{user.email}</div>
                <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Method: {user.authenticationMethod ?? 'AuthKit'}</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="flex flex-col justify-between">
              <CardHeader>
                <Terminal className="mb-4 h-8 w-8 text-blue-400" />
                <CardTitle>LLM API</CardTitle>
                <CardDescription>Server-side provider status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-text-dim">
                <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Provider: {status?.llm.provider ?? 'loading'}</div>
                <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Model: {status?.llm.model ?? 'loading'}</div>
                <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Configured: {status?.llm.configured ? 'yes' : 'fallback mode'}</div>
              </CardContent>
            </Card>
          </div>

          <Card variant="glass" className="flex flex-col justify-between shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <Bot className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-xl">MLAI API Test</CardTitle>
                <CardDescription>Send a prompt through `/api/llm/chat`. Provider keys stay on the Bun server.</CardDescription>
              </div>
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearHistory} className="text-text-dim hover:text-red-400" aria-label="Clear History">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={6}
                  className="min-h-40 resize-y rounded-2xl border-white/10 bg-black/40 text-white"
                />
                {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
                <Button disabled={isSending} type="submit" className="w-full rounded-xl py-6 font-bold cursor-pointer">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Protected Request
                </Button>
              </form>

              {reply && (
                <div className="mt-6 rounded-2xl border border-white/5 bg-bg/50 p-5 relative group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-blue-400">Response</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(reply)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy response"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-dim">{reply}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass" className="lg:col-span-2 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Inquiries Database</CardTitle>
                <CardDescription>Submitted partnership and system integration inquiries stored securely in SQLite.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loadingInquiries}>
                {loadingInquiries ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8 text-text-dim text-sm">
                  No inquiries submitted yet. Open the "Start Inquiry" form on the home page or blog to submit one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold text-text-dim uppercase tracking-wider">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Focus</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {inq.name}
                            <span className="block text-xs text-text-dim font-normal font-sans">{inq.email}</span>
                          </td>
                          <td className="py-3.5 px-4 text-text-dim">{inq.company}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono uppercase">
                              {inq.project_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-text-dim max-w-xs truncate" title={inq.message}>{inq.message}</td>
                          <td className="py-3.5 px-4 text-text-dim text-xs font-mono">{new Date(inq.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
