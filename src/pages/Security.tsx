import React from 'react';
import { Lock } from 'lucide-react';
import { LegalPage } from './LegalPage';

export function Security() {
  return (
    <LegalPage
      title="Security Whitepaper"
      lastUpdated="May 15, 2026"
      icon={<Lock className="w-6 h-6" />}
      content={
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Neural Backtrace Validation</h2>
            <p className="text-text-dim">
              WDBX-oriented systems are designed to keep retrieval context, policy decisions, and execution state inspectable. This improves incident review and makes prompt-injection defenses easier to test against concrete traces.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Audit-Ready Controls</h2>
            <p className="text-text-dim">
              MLAI architectures are structured around evidence capture, access boundaries, secret hygiene, and operational logs that support formal security reviews and compliance programs.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Responsible Disclosure</h2>
            <p className="text-text-dim">
              If you discover a vulnerability in MLAI infrastructure, demos, or integration materials, contact security@mlai-corp.com with reproduction details and impact notes.
            </p>
          </section>
        </div>
      }
    />
  );
}
