import Elementary

struct WDBXPage: HTMLDocument {
    var title: String { "WDBX — vector storage" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.WDBX.lead) }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/wdbx", title: title) {
            PageIntro(kicker: "Storage", title: "WDBX", lead: Copy.WDBX.lead)
            StatRow(stats: Array(Brand.mlai.wdbx.prefix(4)))
            SplitBlock(kicker: "Index", title: "Logarithmic search", bodyText: Copy.WDBX.lead)
            SplitBlock(kicker: "Persist", title: "mmap and a chained log", bodyText: Copy.WDBX.persist)
            SplitBlock(kicker: "Quantize", title: "Same vectors, less RAM", bodyText: Copy.WDBX.quant)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Use")
                    h2 { "What it is for" }
                    div(.class("grid-3")) {
                        FeatureCard(title: "On-device retrieval", bodyText: "The index sits next to the model. There is no network hop in the search path.")
                        FeatureCard(title: "Agent memory", bodyText: "Session state is a vector store with an audit log, not a transcript pasted back into context.")
                        FeatureCard(title: "App Store-ready path", bodyText: "Native Swift and Metal integration is the shipping claim for the store. The acronym stays WDBX.")
                    }
                }
            }
            Glossary(items: [
                ("HNSW", "Hierarchical Navigable Small World graph. Defaults M=16, efConstruction=200."),
                ("MVCC", "Readers and writers do not block each other."),
                ("WAL", "Write-ahead log. Hash-chained. Integrity lives here, not in the graph."),
                ("PQ", "Product quantization. Measured 8× memory reduction."),
            ])
            FAQList(items: [
                ("Why not expand the acronym?", Copy.WDBX.naming),
                ("Is 16.5K QPS measured?", "No. That figure is a stress-test objective, tagged a target."),
                ("Does search pay for the audit chain?", "No. Hash-chaining is at the WAL. Search latency is not the integrity budget."),
            ])
        }
    }
}
