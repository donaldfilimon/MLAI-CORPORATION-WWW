import React from 'react';
import { Shield } from 'lucide-react';
import { LegalPage } from './LegalPage';

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 15, 2026"
      icon={<Shield className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
            <p className="text-text-dim">
              MLAI Corporation collects only the information needed to operate the website, respond to inquiries, manage authenticated accounts, provide protected API access, and support billing or customer operations.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Account And Authentication Data</h2>
            <p className="text-text-dim">
              Authentication is handled through WorkOS AuthKit. MLAI stores a sealed HttpOnly session cookie and exposes only public session profile fields to the browser. WorkOS access and refresh tokens remain server-side.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Private AI Workflows</h2>
            <p className="text-text-dim">
              Customer prompts, retrieval context, documents, and model outputs should be treated as sensitive operational data. Production integrations are designed around private infrastructure, explicit provider configuration, and customer-controlled data handling.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Security And Retention</h2>
            <p className="text-text-dim">
              We use transport security, encrypted session cookies, least-privilege API design, and audit-oriented architecture patterns. Retention windows and deletion workflows are defined during customer onboarding based on deployment mode and regulatory needs.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact</h2>
            <p className="text-text-dim">
              For privacy requests, security questions, or data handling reviews, contact privacy@mlai-corp.com or security@mlai-corp.com.
            </p>
          </section>
        </div>
      }
    />
  );
}
