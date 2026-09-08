import Elementary

struct AbbeyPage: HTMLDocument {
    var title: String { "Abbey — assistant layer" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Abbey.lead) }

    var body: some HTML {
        Layout(accent: .abbey, current: "/abbey", title: title) {
            PageIntro(kicker: "Application", title: "Abbey, Aviva, Abi", lead: Copy.Abbey.lead)
            StatRow(stats: Brand.mlai.abbey)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Personas")
                    h2 { "One core, three voices" }
                    div(.class("grid-3")) {
                        FeatureCard(title: "Abbey", bodyText: "Empathic polymath. Creative problem-solving with emotional awareness.")
                        FeatureCard(title: "Aviva", bodyText: "Unfiltered expert. Direct technical answers and dense research.")
                        FeatureCard(title: "Abi", bodyText: "Adaptive moderator. Routes by context instead of asking you to pick a mask.")
                    }
                }
            }
            SplitBlock(kicker: "Memory", title: "Local, vector-backed", bodyText: Copy.Abbey.memory)
            SplitBlock(kicker: "Integrity", title: "Neural backtracking", bodyText: Copy.Abbey.backtrack)
            SplitBlock(kicker: "Surfaces", title: "What is shipping", bodyText: Copy.Abbey.platforms)
            FAQList(items: [
                ("Are the empathy scores measured hardware results?", "No. Abbey empathy and accuracy figures are reported from internal eval."),
                ("Where is memory stored?", "In WDBX, on the device that ran the conversation."),
                ("Is the Swift port done?", "The Swift 6 / Vapor 4 / DiscordBM port is in progress."),
            ])
        }
    }
}
