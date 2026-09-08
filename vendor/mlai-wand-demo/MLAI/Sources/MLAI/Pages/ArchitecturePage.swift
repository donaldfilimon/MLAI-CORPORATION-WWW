import Elementary

struct ArchitecturePage: HTMLDocument {
    var title: String { "Architecture — one chip" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Architecture.lead) }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/architecture", title: title) {
            PageIntro(kicker: "Architecture", title: "Same chip, four layers above silicon", lead: Copy.Architecture.lead)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Layers")
                    h2 { "Bottom to top" }
                    StepList(items: [
                        ("Silicon", "Unified memory and the Neural Engine. The substrate, not an MLAI product claim."),
                        ("ABI", "Tensors, Metal kernels, zero-copy pipelines."),
                        ("WDBX", "HNSW, MVCC, hash-chained WAL."),
                        ("Abbey", "Personas, routing, local memory."),
                        ("Platform", "Trace, control, eval, runtime."),
                    ])
                }
            }
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Choices")
                    h2 { "Why it looks like this" }
                    div(.class("grid-2")) {
                        FeatureCard(title: "One architecture, deeply", bodyText: "Apple Silicon first, so Metal, Accelerate, and Core ML stay in the path instead of being abstracted away.")
                        FeatureCard(title: "Zig on the hot path", bodyText: "No GC. SIMD as a primitive. One numeric lowering shared by WDBX and ABI.")
                        FeatureCard(title: "Integrity at the log", bodyText: "Hash-chaining lives on the WAL so search does not pay for audit.")
                        FeatureCard(title: "Provenance in the data model", bodyText: "A target cannot render as a result. Stat requires a tag.")
                    }
                }
            }
            FAQList(items: [
                ("What is the retrieval score?", "s = similarity · recency · causal-hop · authority. The research page writes the symbols."),
                ("Why Zig and Swift together?", "Zig for kernels and the store. Swift for the Apple-side host and the site you are reading."),
            ])
        }
    }
}
