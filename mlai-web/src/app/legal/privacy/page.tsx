import { Eyebrow } from "@/components/ui/Prim";

export const metadata = { title: "Privacy" };

const H = ({ children }: { children: React.ReactNode }) =>
  <h2 className="mt-10 font-display text-[20px] font-semibold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) =>
  <p className="mt-4 text-[15px] leading-[1.75] text-muted">{children}</p>;

export default function Page() {
  return (
    <div style={{ paddingTop: 116, paddingBottom: 88 }}>
      <div className="mx-auto max-w-[680px] px-6">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-3.5 font-display text-[40px] font-semibold tracking-[-0.03em]">Privacy Policy</h1>
        <P><strong className="text-signal">DRAFT — not legally reviewed.</strong> If any authenticated
          feature is added, GDPR and state-law obligations attach and this needs a lawyer before launch.</P>
        <P>Effective [DATE]. Controller: [LEGAL ENTITY NAME], [ADDRESS]. Contact: [EMAIL].</P>

        <H>1. The short version</H>
        <P>This site is a static export. It sets no cookies, runs no analytics, and embeds no
          third-party trackers. If that changes, this page changes first.</P>

        <H>2. What is collected</H>
        <P>Server logs held by the host ([HOSTING PROVIDER]) may record IP address, user agent, and
          requested URL, retained for [N] days. If you email us, we keep that correspondence for as
          long as needed to respond.</P>

        <H>3. Fonts</H>
        <P>Web fonts are self-hosted and served from the same origin as the rest of the site.
          No font request goes to Google Fonts or any other third party, so no third party
          receives your IP address by way of this page.</P>

        <H>4. Your rights</H>
        <P>Depending on where you live you may have rights to access, correct, delete, or port your
          data, and to object to processing. Email [EMAIL]. EEA/UK visitors may complain to their
          local supervisory authority.</P>

        <H>5. Changes</H>
        <P>Updates are posted here with a new effective date.</P>
      </div>
    </div>
  );
}
