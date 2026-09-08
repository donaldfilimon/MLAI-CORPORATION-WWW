import { ContactForm } from "@/components/contact-form";

const elsewhere = [
  {
    href: "https://github.com/donaldfilimon/abi",
    label: "github.com/donaldfilimon/abi",
  },
  { href: "https://mlai.dev", label: "mlai.dev" },
  { href: "https://x.com/donaldfilimonx", label: "x.com/donaldfilimonx" },
] as const;

export function ContactPage() {
  return (
    <div className="public-container marketing-page contact-page">
      <div className="contact-layout">
        <div>
          <header className="contact-copy">
            <span className="eyeline wdbx">Contact</span>
            <h1>One inbox, read by the people who build it.</h1>
            <p className="hero-description">
              Share the workflow you want to automate, the failure modes you
              cannot accept, and the infrastructure constraints we need to
              respect. Most teams begin with a readiness audit.
            </p>
          </header>

          <aside className="callout-card abbey">
            <strong>Privacy-first</strong>
            <p>
              We don&apos;t take work that puts your data in our hands. VPC,
              on-premise, and offline-first deployment paths are the default
              posture, not an upsell. Naming a layer helps: WDBX, ABI, IWL, or
              the full platform.
            </p>
          </aside>

          <div className="elsewhere">
            <span className="elsewhere-label">Elsewhere</span>
            {elsewhere.map((item) => (
              <a
                key={item.href}
                href={item.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.label} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="contact-form-panel">
          <ContactForm note="Deploy · pilot · partner · invest — same inbox. Your inquiry is saved in this local installation for MLAI staff to review." />
        </div>
      </div>
    </div>
  );
}
