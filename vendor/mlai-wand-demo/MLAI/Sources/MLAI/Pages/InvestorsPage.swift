import Elementary

struct InvestorsPage: HTMLDocument {
    var title: String { "Investors — thesis and targets" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Investors.lead) }

    var body: some HTML {
        Layout(accent: .abi, current: "/investors", title: title) {
            PageIntro(kicker: "Investors", title: "A labeled bet", lead: Copy.Investors.lead)
            StatRow(stats: Array(Brand.mlai.investorTargets.prefix(4)))
            SplitBlock(kicker: "Why now", title: "Conditions, not slogans", bodyText: Copy.Investors.why)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Market")
                    h2 { "Scope we will defend in a room" }
                    div(.class("grid-3")) {
                        FeatureCard(title: "TAM $127B", bodyText: "Global AI infrastructure. Context, not a booking.")
                        FeatureCard(title: "SAM $45B", bodyText: "Edge AI and privacy-first.")
                        FeatureCard(title: "SOM $2.5B", bodyText: "Apple ecosystem, year five. A target-shaped slice.")
                    }
                }
            }
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Plan")
                    h2 { "Use of a $1.5M pre-seed — all targets" }
                    div(.class("grid-3")) {
                        FeatureCard(title: "Engineering 60%", bodyText: "$900K. The stack is the product.")
                        FeatureCard(title: "Go-to-market 25%", bodyText: "$375K.")
                        FeatureCard(title: "Operations 15%", bodyText: "$225K.")
                    }
                }
            }
            FAQList(items: [
                ("Are ARR projections measured?", "No. 2026–2030 ARR figures and unit economics on this page are targets."),
                ("What is the open-core line?", "Free Apache-2.0 core. WDBX Pro listed at $99/mo. Enterprise $50K–250K. Cloud usage-based. Pricing is a plan, not a booked book."),
                ("18-month milestone?", "$240K ARR, 5–10 enterprise customers, 5,000+ OSS stars — all targets."),
            ])
        }
    }
}
