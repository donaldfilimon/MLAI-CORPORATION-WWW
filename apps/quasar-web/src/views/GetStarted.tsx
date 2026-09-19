import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { startJourneys } from "@/data/categories/product-journeys";

export function GetStarted() {
  return <section className="section-y pt-32"><div className="container-custom">
    <PageHeader title="What would you like to do?" subtitle="Read first, run locally, or build from source. Choose a path to see what is available and what you need." />
    <div className="space-y-10">{startJourneys.map((journey) => <article id={journey.id} key={journey.id} className="scroll-mt-32 grid gap-6 lg:grid-cols-[1fr_2fr] border-t border-white/15 pt-8">
      <div><h2 className="font-display text-3xl text-white">{journey.title}</h2><p className="mt-3 text-cyan-300">{journey.availability}</p></div>
      <div className="max-w-2xl"><p className="text-lg text-text-dim leading-relaxed">{journey.description}</p><h3 className="mt-5 font-semibold text-white">Before you start</h3><p className="mt-2 text-text-dim leading-relaxed">{journey.prerequisites}</p><Link to={journey.href} className="inline-flex mt-6 px-5 py-3 rounded-lg bg-white text-black font-semibold hover:bg-cyan-100">{journey.label}</Link></div>
    </article>)}</div>
    <p className="mt-14 text-text-dim">Looking for the whole product family? <Link to="/products" className="text-cyan-300 underline">Compare products</Link>.</p>
  </div></section>;
}
