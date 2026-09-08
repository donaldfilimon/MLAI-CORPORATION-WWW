import Elementary

struct ABIPage: HTMLDocument {
    var title: String { "ABI Framework — compute" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.ABI.lead) }

    var body: some HTML {
        Layout(accent: .abi, current: "/abi", title: title) {
            PageIntro(kicker: "Compute", title: "ABI Framework", lead: Copy.ABI.lead)
            StatRow(stats: Brand.mlai.abi)
            SplitBlock(kicker: "GPU", title: "What is measured", bodyText: Copy.ABI.gpu)
            SplitBlock(kicker: "Zig", title: "Hot paths", bodyText: Copy.ABI.zig)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Repo")
                    h2 { "What ships in the tree" }
                    div(.class("grid-2")) {
                        FeatureCard(title: "Apache-2.0", bodyText: "The core is Apache-2.0, not MIT.")
                        FeatureCard(title: "MCP + streaming", bodyText: "In-repo MCP server and an OpenAI-compatible streaming endpoint.")
                        FeatureCard(title: "Bootstrap", bodyText: "./build.sh --bootstrap then ./build.sh check.")
                        FeatureCard(title: "Docs", bodyText: "donaldfilimon.github.io/abi")
                    }
                }
            }
            FAQList(items: [
                ("Is 295× a result?", "No. MatMul 4096×4096 is a benchmark-track objective, tagged a target."),
                ("Which Zig version?", "0.17-dev, pinned in repo materials as 0.17.0-dev.304+9787df942."),
                ("Is this an Apple product?", Copy.apple),
            ])
        }
    }
}
