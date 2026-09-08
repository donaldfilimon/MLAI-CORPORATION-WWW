import Elementary

struct ServicesPage: HTMLDocument {
    var title: String { "Services — how to work together" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Services.lead) }

    var body: some HTML {
        Layout(accent: .abbey, current: "/services", title: title) {
            PageIntro(kicker: "Services", title: "Engineering time, named plainly", lead: Copy.Services.lead)
            section(.class("section")) {
                div(.class("wrap")) {
                    Eyebrow(text: "Line")
                    h2 { "Open core, then a contract" }
                    div(.class("grid-2")) {
                        FeatureCard(title: "Core", bodyText: "Apache-2.0. You can read it. You can run it.")
                        FeatureCard(title: "Pro", bodyText: "Listed at $99/mo for teams that want the paid store path.")
                        FeatureCard(title: "Enterprise", bodyText: "Listed $50K–250K when the runtime, audit, and support have to travel with the contract.")
                        FeatureCard(title: "Cloud", bodyText: "Usage-based, when a team is not ready to keep the boxes.")
                    }
                }
            }
            FAQList(items: [
                ("Do we submit an inquiry form?", "No. Mail goes to engineers. The contact page is the form."),
                ("Can you implement inside an air-gapped runtime?", "That is what the private runtime layer is for. Start with the constraint, not a slide."),
            ])
        }
    }
}
