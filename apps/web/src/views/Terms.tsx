import { FileText } from "lucide-react";
import { LegalPage } from "./LegalPage";

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="August 24, 2026"
      icon={<FileText className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Acceptable Use
            </h2>
            <p className="text-text-dim">
              Users of Quesar, MLAI services, demos, protected APIs, and
              research materials must not use them to build malicious
              automation, evade security controls, conduct unauthorized
              surveillance, or generate large-scale deception.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Account Responsibility
            </h2>
            <p className="text-text-dim">
              Quesar is invite-only. You are responsible for maintaining account
              security, using required MFA or passkeys, and ensuring only
              authorized members use your organization access. Do not share or
              attempt to bypass an invitation or session boundary.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Intellectual Property
            </h2>
            <p className="text-text-dim">
              MLAI names, content, code, designs, research materials, and
              architecture descriptions are protected by applicable
              intellectual-property law unless a specific license states
              otherwise.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Experimental And Preview Features
            </h2>
            <p className="text-text-dim">
              Quesar is a beta service. Model output can be incomplete or wrong
              and must not be treated as professional, safety-critical, legal,
              medical, or financial advice. Do not rely on preview features for
              production decisions without independent validation and a written
              deployment review.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Conversation Audit Consent
            </h2>
            <p className="text-text-dim">
              Protected generation requires explicit consent to the displayed
              one-year encrypted-audit policy. You may withdraw consent for
              future chats and may inspect, export, or delete your live records.
              Withdrawal does not retroactively erase records you have not
              deleted or provider processing already completed.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-text-dim">
              MLAI provides website, research, and preview API materials as-is
              unless a separate contract applies. Customers are responsible for
              validating outputs, configuring appropriate safeguards, and
              controlling deployment risk.
            </p>
          </section>
        </div>
      }
    />
  );
}
