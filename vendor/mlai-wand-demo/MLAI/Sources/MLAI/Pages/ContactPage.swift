import Elementary

struct ContactPage: HTMLDocument {
    var title: String { "Contact — MLAI" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: Copy.Contact.lead) }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/contact", title: title) {
            PageIntro(kicker: "Contact", title: "Mail goes to engineers.", lead: Copy.Contact.lead)
            section(.class("section")) {
                div(.class("wrap grid-2")) {
                    FeatureCard(title: "GitHub", bodyText: "github.com/donaldfilimon")
                    FeatureCard(title: "X", bodyText: "x.com/donaldfilimonx")
                    FeatureCard(title: "Site", bodyText: "donaldfilimon.com")
                    FeatureCard(title: "ABI docs", bodyText: "donaldfilimon.github.io/abi")
                }
            }
        }
    }
}

struct NotFoundPage: HTMLDocument {
    var title: String { "Not found — MLAI" }
    var lang: String { "en" }
    var head: some HTML { PageHead(title: title, description: "No such route.") }

    var body: some HTML {
        Layout(accent: .wdbx, current: "/", title: title) {
            PageIntro(kicker: "404", title: "No such page.", lead: "The index does not contain this path.")
        }
    }
}
