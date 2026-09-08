import Elementary

struct CompanyPage: HTMLDocument {
    var title: String { "Company — MLAI" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Company.lead) }

    var body: some HTML {
        Layout(accent: .abbey, current: "/company", title: title) {
            PageIntro(kicker: "Company", title: Brand.mlai.legalName, lead: Copy.Company.lead)
            PullQuote(text: Copy.origin)
            StatRow(stats: Brand.mlai.founderStats)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Founder")
                    h2 { Brand.mlai.founder }
                    p(.class("lead")) { "Founder and Systems Architect. \(Brand.mlai.motto)" }
                    div(.class("grid-2")) {
                        FeatureCard(title: "abi", bodyText: "Agent runtime and WDBX orchestration in Zig. MCP server in-tree.")
                        FeatureCard(title: "WDBX", bodyText: "Durable vector and block memory for traceable retrieval.")
                        FeatureCard(title: "gama", bodyText: "Swift and MLX on-device language-model inference.")
                        FeatureCard(title: "Nyon", bodyText: "Voxel world experiment. Separate from the product stack.")
                    }
                }
            }
            FAQList(items: [
                ("Where is the company?", "Orlando, Florida. Delaware C-Corp."),
                ("What are the values?", "Disciplined secrecy. Mission stewardship. Operational velocity."),
                ("Is MLAI an Apple partner?", Copy.apple),
            ])
        }
    }
}
