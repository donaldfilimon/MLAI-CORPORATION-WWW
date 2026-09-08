import Foundation

public enum Accent: String, Sendable {
    case wdbx
    case abi
    case abbey

    public var hex: String {
        switch self {
        case .wdbx: "#00D4FF"
        case .abi: "#7C3AED"
        case .abbey: "#10B981"
        }
    }

    public var label: String {
        switch self {
        case .wdbx: "WDBX"
        case .abi: "ABI"
        case .abbey: "Abbey"
        }
    }
}

public enum Provenance: String, Sendable {
    case measured
    case target
    case reported

    public var glyph: String {
        switch self {
        case .measured: "●"
        case .target: "○"
        case .reported: "◆"
        }
    }

    public var cssClass: String { "prov-\(rawValue)" }
    public var caption: String { rawValue }
}

public struct Stat: Sendable {
    public var value: String
    public var label: String
    public var provenance: Provenance
    public var source: String?

    public init(value: String, label: String, provenance: Provenance, source: String? = nil) {
        self.value = value
        self.label = label
        self.provenance = provenance
        self.source = source
    }
}

public struct NavItem: Sendable {
    public var href: String
    public var label: String
    public var terminal: Bool

    public init(_ href: String, _ label: String, terminal: Bool = false) {
        self.href = href
        self.label = label
        self.terminal = terminal
    }
}

public struct NextLink: Sendable {
    public var href: String
    public var label: String
    public var desc: String
}

public struct Brand: Sendable {
    public var name: String
    public var legalName: String
    public var entity: String
    public var location: String
    public var tagline: String
    public var positioning: String
    public var appleFraming: String
    public var license: String
    public var zig: String
    public var founder: String
    public var motto: String
    public var accent: Accent
    public var stats: [Stat]
    public var wdbx: [Stat]
    public var abi: [Stat]
    public var abbey: [Stat]
    public var founderStats: [Stat]
    public var investorTargets: [Stat]

    public static let mlai = Brand(
        name: "MLAI",
        legalName: "Machine Learning Advanced Innovations, Inc.",
        entity: "Delaware C-Corp",
        location: "Orlando, FL",
        tagline: "Privacy-first AI infrastructure for Apple Silicon.",
        positioning: "The infrastructure layer for private, on-device AI — inference, index, and data on the same chip.",
        appleFraming: "Built on Apple's public frameworks — Metal, Accelerate, Core ML.",
        license: "Apache-2.0",
        zig: "0.17-dev",
        founder: "Donald Filimon",
        motto: "Care first. Clarity always. Competence throughout.",
        accent: .wdbx,
        stats: [
            Stat(value: "2.3 ms", label: "WDBX p50 search latency", provenance: .measured),
            Stat(value: "98.2%", label: "WDBX Recall@10", provenance: .measured),
            Stat(value: "84×", label: "ABI MatMul 1024×1024", provenance: .measured),
            Stat(value: "295×", label: "ABI MatMul 4096×4096 benchmark track", provenance: .target),
        ],
        wdbx: [
            Stat(value: "2.3 ms", label: "p50 search latency", provenance: .measured),
            Stat(value: "98.2%", label: "Recall@10", provenance: .measured),
            Stat(value: "16.5K", label: "QPS stress-test objective", provenance: .target),
            Stat(value: "0.8 ms", label: "p50 at 1M vectors", provenance: .target),
            Stat(value: "6–12×", label: "faster search vs cloud, zero network hop", provenance: .measured),
            Stat(value: "8×", label: "lower memory with product quantization", provenance: .measured),
        ],
        abi: [
            Stat(value: "5×", label: "MatMul 128×128", provenance: .measured),
            Stat(value: "84×", label: "MatMul 1024×1024", provenance: .measured),
            Stat(value: "13×", label: "10-layer neural net", provenance: .measured),
            Stat(value: "295×", label: "MatMul 4096×4096 benchmark track", provenance: .target),
        ],
        abbey: [
            Stat(value: "0.92", label: "Abbey empathy score", provenance: .reported, source: "internal eval"),
            Stat(value: "90.5%", label: "Abbey technical accuracy", provenance: .reported, source: "internal eval"),
            Stat(value: "30%", label: "Aviva latency reduction vs hedged responses", provenance: .reported),
            Stat(value: "40%", label: "Aviva content density gain", provenance: .reported),
        ],
        founderStats: [
            Stat(value: "8+", label: "years ML / systems", provenance: .measured),
            Stat(value: "15%", label: "LLVM compile-time reduction shipped", provenance: .measured),
            Stat(value: "5", label: "languages in production", provenance: .measured),
        ],
        investorTargets: [
            Stat(value: "$1.5M", label: "Pre-Seed raise", provenance: .target),
            Stat(value: "$240K", label: "18-month ARR milestone", provenance: .target),
            Stat(value: "$50K+", label: "ACV", provenance: .target),
            Stat(value: "85%+", label: "gross margin", provenance: .target),
            Stat(value: "5:1", label: "LTV:CAC", provenance: .target),
            Stat(value: "120%", label: "NRR", provenance: .target),
        ]
    )
}

public enum Site {
    public static var name: String { Brand.mlai.name }
    public static var tagline: String { Brand.mlai.tagline }
    public static var license: String { Brand.mlai.license }
    public static var zig: String { Brand.mlai.zig }

    public static let nav: [NavItem] = [
        NavItem("/", "Home"),
        NavItem("/wdbx", "WDBX"),
        NavItem("/abi", "ABI"),
        NavItem("/abbey", "Abbey"),
        NavItem("/platform", "Platform"),
        NavItem("/architecture", "Architecture"),
        NavItem("/company", "Company"),
        NavItem("/investors", "Investors"),
        NavItem("/research", "Research"),
        NavItem("/services", "Services"),
        NavItem("/contact", "Contact", terminal: true),
    ]

    public static func next(after href: String) -> [NextLink] {
        switch href {
        case "/":
            return [
                NextLink(href: "/wdbx", label: "WDBX", desc: "The vector store that lives with the data."),
                NextLink(href: "/abi", label: "ABI", desc: "GPU compute and orchestration on the same chip."),
            ]
        case "/wdbx":
            return [
                NextLink(href: "/abi", label: "ABI Framework", desc: "The kernels that make distance cheap."),
                NextLink(href: "/architecture", label: "Architecture", desc: "How storage sits on compute."),
            ]
        case "/abi":
            return [
                NextLink(href: "/abbey", label: "Abbey", desc: "The assistant layer that uses the stack."),
                NextLink(href: "/wdbx", label: "WDBX", desc: "Where embeddings persist."),
            ]
        case "/abbey":
            return [
                NextLink(href: "/platform", label: "Platform", desc: "Trace, control, eval, runtime."),
                NextLink(href: "/research", label: "Research", desc: "Scoring model and audit chain."),
            ]
        case "/platform":
            return [
                NextLink(href: "/architecture", label: "Architecture", desc: "The whole-stack flow."),
                NextLink(href: "/services", label: "Services", desc: "How teams engage."),
            ]
        case "/architecture":
            return [
                NextLink(href: "/research", label: "Research", desc: "Formal model behind retrieval."),
                NextLink(href: "/wdbx", label: "WDBX", desc: "Index and WAL in detail."),
            ]
        case "/company":
            return [
                NextLink(href: "/investors", label: "Investors", desc: "Thesis, labeled as a thesis."),
                NextLink(href: "/contact", label: "Contact", desc: "Mail goes to engineers."),
            ]
        case "/investors":
            return [
                NextLink(href: "/research", label: "Research", desc: "What is proven vs targeted."),
                NextLink(href: "/company", label: "Company", desc: "Origin and approach."),
            ]
        case "/research":
            return [
                NextLink(href: "/architecture", label: "Architecture", desc: "Where the formulas land."),
                NextLink(href: "/platform", label: "Platform", desc: "Evaluation mesh."),
            ]
        case "/services":
            return [
                NextLink(href: "/contact", label: "Contact", desc: "Start with a note to engineering."),
                NextLink(href: "/platform", label: "Platform", desc: "What a deployment actually contains."),
            ]
        default:
            return []
        }
    }
}

public enum Tokens {
    public static let appleFrameworks = "Built on Apple's public frameworks — Metal, Accelerate, Core ML."
}

public enum Facts {
    public static var abiMatMul4096: Stat {
        Brand.mlai.abi.first { $0.value.contains("295") }!
    }
}

public enum Integrity {
    public static let bannedPhrases = [
        "Apple-backed",
        "partnership with Apple",
        "in collaboration with Apple",
        "blazing-fast",
        "revolutionary",
        "game-changing",
        "synergy",
        "best-in-class",
    ]

    public static let knownTargets = ["295×", "295x", "16.5K", "0.8 ms"]
}
