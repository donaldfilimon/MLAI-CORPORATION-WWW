import Elementary

public struct PageHead: HTML {
    public var title: String
    public var description: String

    public var body: some HTML {
        meta(.charset(.utf8))
        meta(.name(.viewport), .content("width=device-width, initial-scale=1"))
        meta(.name(.description), .content(description))
        link(.rel(.stylesheet), .href("/css/theme.css"))
        link(.rel(.preconnect), .href("https://fonts.googleapis.com"))
    }
}

public struct Layout<Content: HTML>: HTML {
    public var accent: Accent
    public var current: String
    public var title: String
    @HTMLBuilder public var content: Content

    public init(
        accent: Accent,
        current: String,
        title: String,
        @HTMLBuilder content: () -> Content
    ) {
        self.accent = accent
        self.current = current
        self.title = title
        self.content = content()
    }

    public var body: some HTML {
        a(.class("skip"), .href("#main")) { "Skip to content" }
        Nav(current: current)
        main(.id("main"), .style("--accent: \(accent.hex)")) {
            content
            if current != "/contact" {
                NextUp(current: current)
            }
        }
        Footer()
    }
}

public struct Nav: HTML {
    public var current: String

    public var body: some HTML {
        header(.class("site-header")) {
            div(.class("wrap nav-bar")) {
                a(.class("logo"), .href("/"), .ariaLabel("MLAI home")) {
                    LogoMark()
                    span { Site.name }
                }
                nav(.class("nav-links"), .ariaLabel("Primary")) {
                    NavLinks(current: current)
                }
                details(.class("nav-toggle")) {
                    summary { "Menu" }
                    nav(.class("nav-sheet"), .ariaLabel("Mobile")) {
                        NavLinks(current: current)
                    }
                }
            }
        }
    }
}

public struct NavLinks: HTML {
    public var current: String

    public var body: some HTML {
        for item in Site.nav {
            a(
                .href(item.href),
                current == item.href ? .ariaCurrent(.page) : nil,
                item.terminal ? .class("contact-btn") : nil
            ) { item.label }
        }
    }
}

public struct Footer: HTML {
    public var body: some HTML {
        hr(.class("brand-seam"))
        footer(.class("site-footer")) {
            div(.class("wrap footer-grid")) {
                p { Site.name }
                p { Site.tagline }
                p { Tokens.appleFrameworks }
                p { "\(Brand.mlai.legalName) · \(Brand.mlai.location) · \(Site.license) · Zig \(Site.zig)" }
            }
        }
    }
}

public struct LogoMark: HTML {
    public var body: some HTML {
        svg(.class("logo-mark"), .custom(name: "viewBox", value: "0 0 48 48"), .custom(name: "aria-hidden", value: "true")) {
            rect(.x("4"), .y("4"), .width("40"), .height("40"), .rx("8"), .fill("none"), .stroke("#00D4FF"), .custom(name: "stroke-width", value: "2"))
            rect(.x("12"), .y("28"), .width("24"), .height("6"), .rx("1"), .fill("#00D4FF"))
            rect(.x("12"), .y("21"), .width("24"), .height("6"), .rx("1"), .fill("#7C3AED"))
            rect(.x("12"), .y("14"), .width("24"), .height("6"), .rx("1"), .fill("#10B981"))
        }
    }
}

public struct Eyebrow: HTML {
    public var text: String
    public var body: some HTML {
        p(.class("eyebrow")) {
            span(.class("tick"))
            text
        }
    }
}

public struct PageIntro: HTML {
    public var kicker: String
    public var title: String
    public var lead: String

    public var body: some HTML {
        section(.class("section")) {
            div(.class("wrap")) {
                Eyebrow(text: kicker)
                h1 { title }
                p(.class("lead")) { lead }
            }
        }
    }
}

public struct StatRow: HTML {
    public var stats: [Stat]
    public var body: some HTML {
        section(.class("section tight")) {
            div(.class("wrap stats-4")) {
                for stat in stats {
                    StatBlock(stat: stat)
                }
            }
        }
    }
}

public struct StatBlock: HTML {
    public var stat: Stat
    public var body: some HTML {
        div(.class("stat surface accent-edge")) {
            div(.class("metric")) { stat.value }
            div(.class("label")) { stat.label }
            div(.class("prov \(stat.provenance.cssClass)")) {
                "\(stat.provenance.glyph) \(stat.provenance.caption)"
            }
        }
    }
}

public struct FeatureCard: HTML {
    public var title: String
    public var bodyText: String
    public var body: some HTML {
        article(.class("card surface surface-hover")) {
            h3 { title }
            p { bodyText }
        }
    }
}

public struct SplitBlock: HTML {
    public var kicker: String
    public var title: String
    public var bodyText: String
    public var body: some HTML {
        section(.class("section split-band")) {
            div(.class("wrap split")) {
                div {
                    Eyebrow(text: kicker)
                    h2 { title }
                }
                div(.class("prose")) { p { bodyText } }
            }
        }
    }
}

public struct PullQuote: HTML {
    public var text: String
    public var body: some HTML {
        section(.class("section tight")) {
            div(.class("wrap")) {
                blockquote(.class("quote")) { text }
            }
        }
    }
}

public struct FAQList: HTML {
    public var items: [(q: String, a: String)]
    public var body: some HTML {
        section(.class("section")) {
            div(.class("wrap")) {
                Eyebrow(text: "FAQ")
                h2 { "Questions worth answering plainly" }
                div(.class("faq-list")) {
                    for item in items {
                        details {
                            summary { item.q }
                            p(.class("answer")) { item.a }
                        }
                    }
                }
            }
        }
    }
}

public struct Glossary: HTML {
    public var items: [(term: String, def: String)]
    public var body: some HTML {
        section(.class("section")) {
            div(.class("wrap")) {
                Eyebrow(text: "Glossary")
                h2 { "Terms" }
                dl(.class("glossary")) {
                    for item in items {
                        div(.class("gloss-item")) {
                            dt(.class("mono")) { item.term }
                            dd { item.def }
                        }
                    }
                }
            }
        }
    }
}

public struct StepList: HTML {
    public var items: [(title: String, body: String)]
    public var body: some HTML {
        ol(.class("steps")) {
            for (index, item) in items.enumerated() {
                li(.class("surface accent-edge step")) {
                    span(.class("chip")) { "\(index + 1)" }
                    div {
                        h3 { item.title }
                        p { item.body }
                    }
                }
            }
        }
    }
}

public struct NextUp: HTML {
    public var current: String
    public var body: some HTML {
        section(.class("section")) {
            div(.class("wrap")) {
                Eyebrow(text: "Next")
                h2 { "Keep going" }
                div(.class("grid-2")) {
                    for link in Site.next(after: current) {
                        a(.href(link.href), .class("card surface surface-hover accent-edge next-card")) {
                            h3 { link.label }
                            p { link.desc }
                        }
                    }
                }
            }
        }
    }
}

public struct ProvLegend: HTML {
    public var body: some HTML {
        p(.class("legend")) {
            "● measured · ○ target · ◆ reported"
        }
    }
}
