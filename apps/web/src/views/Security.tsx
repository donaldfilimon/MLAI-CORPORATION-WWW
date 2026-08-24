import { Lock } from "lucide-react";
import { LegalPage } from "./LegalPage";

export function Security() {
  return (
    <LegalPage
      title="Security Whitepaper"
      lastUpdated="August 24, 2026"
      icon={<Lock className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Production Trust Boundary
            </h2>
            <p className="text-text-dim">
              The production rollout is designed so public traffic passes through Cloudflare and a Google external
              HTTPS load balancer. Cloud Armor is configured to admit only Cloudflare proxy
              source ranges, Cloud Run accepts load-balancer/internal ingress,
              and the default run.app endpoint is disabled. Workload identities
              and the runtime service account are separate and least-privilege.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Identity, Provider, And Audit Controls
            </h2>
            <p className="text-text-dim">
              In the production design, WorkOS organization membership is revalidated before protected
              generation. Cloudflare Turnstile guards the public request funnel.
              Gemini requests cross an authenticated metadata-only gateway and
              exclude user email. Conversation payloads are envelope-encrypted
              with Cloud KMS, and admin decryptions require MFA plus a logged
              reason. These are implemented controls, not a certification claim.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Responsible Disclosure
            </h2>
            <p className="text-text-dim">
              If you discover a vulnerability in MLAI infrastructure, demos, or
              integration materials, contact security@mlai-corp.com with
              reproduction details and impact notes.
            </p>
          </section>
        </div>
      }
    />
  );
}
