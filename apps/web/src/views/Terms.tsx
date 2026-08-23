import { FileText } from "lucide-react";
import { LegalPage } from "./LegalPage";

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="May 15, 2026"
      icon={<FileText className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Acceptable Use
            </h2>
            <p className="text-text-dim">
              Users of MLAI Corporation services, demos, protected APIs, and
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
              You are responsible for maintaining account security, using MFA or
              passkeys when available, and ensuring only authorized users access
              your workspace or API usage.
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
              Some console, LLM, benchmark, billing, and research features may
              be prototypes or preview capabilities. Do not rely on preview
              features for production decisions without a written agreement and
              deployment review.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Limitation of Liability
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
