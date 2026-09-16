import { Nav, Footer, Eyebrow } from "mlai-site";
import { page, Hero, HeroTitle, HeroSub, PillLink } from "../components/site";

export default function NotFound() {
  return (
    <div style={page}>
      <Nav />
      <Hero accent="#7C3AED" accent2="#00D4FF" keyLight="rgba(124,58,237,0.12)">
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <Eyebrow accent="abi">404</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <HeroTitle>This route isn&apos;t in the index.</HeroTitle>
            <HeroSub>
              The page you asked for isn&apos;t part of the site. Head home, or jump into the stack.
            </HeroSub>
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
            <PillLink to="/" primary>Back home</PillLink>
            <PillLink to="/platform" color="#A78BFA">Platform →</PillLink>
          </div>
        </div>
      </Hero>
      <Footer />
    </div>
  );
}
