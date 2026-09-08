import Elementary

struct PlatformPage: HTMLDocument {
    var title: String { "Platform — inspectable autonomy" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Platform.lead) }

    var body: some HTML {
        Layout(accent: .abi, current: "/platform", title: title) {
            PageIntro(kicker: "Platform", title: "Autonomy you can inspect", lead: Copy.Platform.lead)
            section(.class("section")) {
                div(.class("wrap")) {
                    StepList(items: [
                        ("Trace layer", "Captures retrieval paths, policy checks, model decisions, tool calls, and operator interventions as events you can read."),
                        ("Control plane", "Defines which agents may plan, review, execute, escalate, or abstain under each workflow condition."),
                        ("Evaluation mesh", "Regression across faithfulness, latency, safety behavior, prompt injection, and human-review burden."),
                        ("Private runtime", "Packages orchestration, retrieval, audit logs, and controls for cloud, VPC, on-premise, and offline-first."),
                    ])
                }
            }
            FAQList(items: [
                ("Is this a hosted-only control plane?", "No. The private runtime is meant to travel with the deployment, including offline-first."),
                ("Where do traces live?", "With the runtime that made the decision. The point is inspectability, not a third-party dashboard you have to trust."),
            ])
        }
    }
}
