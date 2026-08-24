import { Shield } from "lucide-react";
import { LegalPage } from "./LegalPage";

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="August 24, 2026"
      icon={<Shield className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Data Collection
            </h2>
            <p className="text-text-dim">
              Quesar collects information needed to operate the site and
              invite-only beta: inquiry name, work email, organization, project
              details, WorkOS account/session data, and the deliberately narrow
              operational records described below.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Account And Authentication Data
            </h2>
            <p className="text-text-dim">
              Authentication is handled through WorkOS AuthKit. Quesar stores a
              sealed HttpOnly session cookie and requires active membership in
              the configured beta organization. WorkOS access and refresh
              tokens remain server-side. Account email is not sent to the model
              provider or stored in conversation-audit payloads.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Private AI Workflows
            </h2>
            <p className="text-text-dim">
              After explicit consent, prompts and responses are processed by
              Gemini 3.7 Flash through an authenticated Cloudflare AI Gateway.
              Quesar disables gateway payload logging and caching on each
              request. Cloudflare and Google still process the request to
              deliver the service under their applicable terms and controls.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Security And Retention
            </h2>
            <p className="text-text-dim">
              Conversation records use a random per-record AES-256-GCM key
              wrapped by Google Cloud KMS and are scheduled to expire after 365
              days. Users can read, export, or delete their live
              ciphertext. MFA-gated administrators may decrypt a record only
              with a stated reason; requested, successful, and failed access
              outcomes are logged. Encrypted database backups age out on the
              production backup schedule, so deletion from live storage can
              precede physical backup expiry.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Minimal Website Telemetry
            </h2>
            <p className="text-text-dim">
              Website telemetry stores only an allowlisted event name, an
              allowlisted pathname, and a timestamp. It honors Do Not Track and
              Global Privacy Control before persistence and does not store IP
              address, user agent, free text, or account identifier.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
            <p className="text-text-dim">
              For privacy requests, security questions, or data handling
              reviews, contact privacy@mlai-corp.com or security@mlai-corp.com.
            </p>
          </section>
        </div>
      }
    />
  );
}
