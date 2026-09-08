import Elementary

struct ResearchPage: HTMLDocument {
    var title: String { "Research — scoring and audit" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Research.lead) }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/research", title: title) {
            PageIntro(kicker: "Research", title: "A score with four terms", lead: Copy.Research.lead)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Model")
                    h2 { "June 2026 trust table" }
                    div(.class("grid-2")) {
                        FeatureCard(title: "σ similarity", bodyText: "Cosine over HNSW. SIMD with a CPU fallback.")
                        FeatureCard(title: "τ recency", bodyText: "Temporal half-life decay.")
                        FeatureCard(title: "γ causal hop", bodyText: "max(0.25, 0.6^h). Distant hops shrink, they do not vanish.")
                        FeatureCard(title: "π authority", bodyText: "Inferred 0.30 through system-pinned 1.00.")
                    }
                }
            }
            SplitBlock(
                kicker: "Audit",
                title: "Hash at the log",
                bodyText: "H_i = SHA-256(H_{i-1} ‖ t_i ‖ seq_i ‖ p_i ‖ m_i), H_0 = 0. The graph stays fast because the chain is not in the graph."
            )
            FAQList(items: [
                ("Is the composite score a product?", "Yes. Four weights multiply. None is allowed to hide the others."),
                ("Does this invent new benchmarks?", "No. The authority table and the hash rule come from the June 2026 paper already in the master reference."),
            ])
        }
    }
}
