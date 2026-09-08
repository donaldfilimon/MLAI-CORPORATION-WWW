import Elementary

struct HomePage: HTMLDocument {
    var title: String { "MLAI — privacy-first AI infrastructure" }
    var lang: String { "en" }

    var head: some HTML {
        PageHead(title: title, description: Site.tagline)
    }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/", title: title) {
            PageIntro(kicker: "Thesis", title: Site.tagline, lead: Copy.thesisLead)
            StatRow(stats: Brand.mlai.stats)
            section(.class("section")) {
                div(.class("wrap")) {
                    ProvLegend()
                }
            }
            PullQuote(text: Copy.origin)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Stack")
                    h2 { "Three layers, one chip" }
                    div(.class("grid-3")) {
                        FeatureCard(title: "WDBX", bodyText: "Storage. HNSW, MVCC, hash-chained WAL. Cyan.")
                        FeatureCard(title: "ABI", bodyText: "Compute. Tensors and Metal kernels. Violet.")
                        FeatureCard(title: "Abbey", bodyText: "Application. Personas and local memory. Emerald.")
                    }
                }
            }
            SplitBlock(kicker: "Property", title: "Where it runs", bodyText: Copy.privacy)
            SplitBlock(kicker: "Framing", title: "Apple public frameworks", bodyText: Copy.apple)
            FAQList(items: [
                ("What is measured versus a target?", "A measured figure was reproduced on MLAI hardware. A target is an engineering goal. A reported figure is cited. The 295× GPU number is a target."),
                ("Do you partner with Apple?", Copy.apple),
                ("Where does computation run?", Copy.privacy),
                ("What license is the core?", "Apache-2.0. Zig is referenced as 0.17-dev."),
            ])
        }
    }
}
