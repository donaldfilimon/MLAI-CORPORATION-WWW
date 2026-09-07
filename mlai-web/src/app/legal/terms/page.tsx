import { Eyebrow } from "@/components/ui/Prim";

export const metadata = { title: "Terms" };

const H = ({ children }: { children: React.ReactNode }) =>
  <h2 className="mt-10 font-display text-[20px] font-semibold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) =>
  <p className="mt-4 text-[15px] leading-[1.75] text-muted">{children}</p>;

export default function Page() {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[680px] px-6">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-3.5 font-display text-[40px] font-semibold tracking-[-0.03em]">Terms of Service</h1>
        <P><strong className="text-signal">DRAFT — not legally reviewed.</strong> Every [BRACKET] must be
          filled and the document reviewed by a lawyer before this page ships.</P>
        <P>Effective [DATE]. Last updated [DATE].</P>

        <H>1. Who we are</H>
        <P>These terms govern use of this website and any early-access software provided by
          [LEGAL ENTITY NAME], [ADDRESS]. Contact: [EMAIL].</P>

        <H>2. Scope</H>
        <P>Open-source software published under the Apache License 2.0 is governed by that licence,
          not by these terms, except where these terms address use of this website.</P>

        <H>3. Acceptable use</H>
        <P>You will not attempt unauthorised access to our systems, use the service for unlawful
          purposes, or interfere with its operation.</P>

        <H>4. Early-access software</H>
        <P>Pre-release software is provided AS IS, without warranty, for evaluation only. It may be
          changed or withdrawn without notice. Figures on this site carry provenance tags; anything
          marked as a target is a design goal, not a commitment.</P>

        <H>5. Intellectual property</H>
        <P>Apache-2.0 components are licensed as stated in each repository. Apple, Metal, Accelerate,
          Core ML, and Apple Silicon are trademarks of Apple Inc.; we are not affiliated with Apple.</P>

        <H>6. Disclaimer and liability</H>
        <P>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED “AS IS”. WE ARE NOT LIABLE
          FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. TOTAL LIABILITY IS LIMITED TO [AMOUNT].</P>

        <H>7. Governing law</H>
        <P>Governed by the laws of [STATE], excluding conflict-of-law rules. Venue: [VENUE].</P>
      </div>
    </div>
  );
}
