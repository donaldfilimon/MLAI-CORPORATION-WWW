import { ContactForm } from "@/components/contact-form";

export function ContactPage() {
  return (
    <div className="public-container marketing-page contact-page">
      <header className="marketing-hero contact-hero">
        <div>
          <span className="eyeline wdbx">Contact</span>
          <h1>Start with the actual problem.</h1>
          <p className="hero-description">
            Tell us what you are building, where you are stuck, and what a useful
            outcome would look like. Most teams begin with a readiness audit —
            not a pitch deck.
          </p>
        </div>
        <aside className="callout-card wdbx">
          <strong>What helps</strong>
          <p>
            Constraints, data residency needs, and which layer you are evaluating
            (WDBX, ABI, IWL, or the full platform) beat generic “AI interest”
            notes every time.
          </p>
        </aside>
      </header>
      <ContactForm />
    </div>
  );
}
