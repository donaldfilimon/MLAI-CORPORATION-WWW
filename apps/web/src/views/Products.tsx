import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { productJourneys } from "@/data/categories/product-journeys";

export function Products() {
  return <section className="section-y pt-32"><div className="container-custom">
    <PageHeader title="Four products. Choose your starting point." subtitle="Assistant orchestration, local assistance, durable memory and website creation. Each has its own setup and availability boundary." />
    <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
      {productJourneys.map((product) => <article key={product.slug} className="border-t border-white/15 pt-7">
        <h2 className="font-display text-4xl text-white"><Link to={`/products/${product.slug}`} className="hover:text-cyan-300">{product.name}</Link></h2>
        <p className="mt-4 text-lg text-text-dim max-w-xl">{product.purpose}</p>
        <p className="mt-5 text-cyan-300">{product.availability}</p>
        <p className="mt-3 text-sm text-text-dim leading-relaxed max-w-xl">{product.limitation}</p>
        <div className="flex flex-wrap gap-6 mt-6"><Link className="text-white underline underline-offset-4" to={`/products/${product.slug}`}>Explore {product.name}</Link><Link className="text-cyan-300 underline underline-offset-4" to={product.setupHref}>Setup documentation</Link></div>
      </article>)}
    </div>
    <p className="mt-16 text-text-dim">Choose by what you want to do: <Link to="/get-started" className="text-cyan-300 underline">Get started</Link>. Inspect the supporting <Link to="/research" className="text-cyan-300 underline">research collection</Link>.</p>
  </div></section>;
}
