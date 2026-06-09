import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, KeyRound, Loader2, Save, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { createCheckout, getAuthFeatures, getBillingPlans, updateProfile, verifyWorkosUser } from '@/lib/api';

type AuthFeatures = Awaited<ReturnType<typeof getAuthFeatures>>;
type BillingPlans = Awaited<ReturnType<typeof getBillingPlans>>;
type VerifiedUser = Awaited<ReturnType<typeof verifyWorkosUser>>;

export function Profile() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<AuthFeatures | null>(null);
  const [billing, setBilling] = useState<BillingPlans | null>(null);
  const [verified, setVerified] = useState<VerifiedUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [useCase, setUseCase] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login?mode=signup');
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    Promise.allSettled([getAuthFeatures(), getBillingPlans(), verifyWorkosUser()]).then((results) => {
      if (results[0].status === 'fulfilled') setFeatures(results[0].value);
      if (results[1].status === 'fulfilled') setBilling(results[1].value);
      if (results[2].status === 'fulfilled') setVerified(results[2].value);
    });
  }, [user]);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await updateProfile({ firstName, lastName, company, useCase });
      await refresh();
      setStatus('Profile updated.');
    } catch {
      setStatus('Profile update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckout(planId: string) {
    setStatus('');
    try {
      const checkout = await createCheckout(planId);
      if (checkout.url) window.location.href = checkout.url;
      else setStatus(checkout.nextStep ?? checkout.error ?? 'Checkout is not configured yet.');
    } catch {
      setStatus('Checkout is not configured yet.');
    }
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center pt-24 text-text-dim"><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading profile...</div>;
  }

  return (
    <div className="container-custom min-h-screen pt-32 pb-20 font-sans">
      <div className="mb-10 max-w-3xl">
        <div className="label-chip mb-6"><UserCheck className="h-3.5 w-3.5" /> ACCOUNT</div>
        <h1 className="section-title">Profile, security, and subscription controls.</h1>
        <p className="section-subtitle">Customize your MLAI account, verify the real WorkOS user behind the session, and prepare billing activation.</p>
      </div>

      {status && <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.04] p-4 text-sm text-text-dim">{status}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Profile Customization</h3>
            <p className="text-xs text-text-dim mb-6">Names are saved to WorkOS. Company/use case are stored as WorkOS metadata.</p>
          </div>
          <div>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="border-white/10 bg-black/40 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} className="border-white/10 bg-black/40 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={(event) => setCompany(event.target.value)} className="border-white/10 bg-black/40 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">Primary AI use case</Label>
                <Textarea id="useCase" value={useCase} onChange={(event) => setUseCase(event.target.value)} className="min-h-28 border-white/10 bg-black/40 text-white" />
              </div>
              <Button disabled={saving} type="submit" className="w-full rounded-xl py-6 font-bold cursor-pointer">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass-card flex flex-col justify-between">
            <div>
              <ShieldCheck className="mb-4 h-8 w-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white mb-1">Real User Check</h3>
              <p className="text-xs text-text-dim mb-6">Server verifies the session user against WorkOS.</p>
            </div>
            <div className="space-y-3 text-sm text-text-dim">
              <div className="break-all rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">{verified?.workos.email ?? user.email}</div>
              <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Email verified: {verified?.workos.emailVerified ? 'yes' : 'pending or unknown'}</div>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between">
            <div>
              <KeyRound className="mb-4 h-8 w-8 text-emerald-400" />
              <h3 className="text-lg font-bold text-white mb-1">2FA, Passkeys, Cookies</h3>
              <p className="text-xs text-text-dim mb-6">Hosted AuthKit handles MFA/passkeys once enabled in WorkOS.</p>
            </div>
            <div className="space-y-3 text-sm text-text-dim">
              <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">MFA: {features?.capabilities.mfa ?? 'loading'}</div>
              <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Passkeys: {features?.capabilities.passkeys ?? 'loading'}</div>
              <div className="rounded-xl border border-white/5 bg-bg/50 p-3.5 font-mono text-xs">Cookie: HttpOnly, SameSite {features?.cookies.sameSite ?? 'Lax'}, 7 days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {billing?.plans.map((plan) => (
          <div key={plan.id} className="glass-card flex flex-col justify-between">
            <div>
              <CreditCard className="mb-4 h-8 w-8 text-teal-400" />
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-text-dim mb-4">{plan.price}</p>
              <p className="mb-6 text-sm leading-relaxed text-text-dim">{plan.description}</p>
            </div>
            <Button onClick={() => handleCheckout(plan.id)} className="w-full rounded-xl py-6 font-bold cursor-pointer">Activate Subscription</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
