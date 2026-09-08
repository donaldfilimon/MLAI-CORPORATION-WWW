import Testing
@testable import MLAI

struct BrandTests {
    @Test func licenseIsApache() {
        #expect(Site.license == "Apache-2.0")
    }

    @Test func appleFramingIsApprovedSentence() {
        #expect(Tokens.appleFrameworks.contains("public frameworks"))
        #expect(!Tokens.appleFrameworks.lowercased().contains("partner"))
    }

    @Test func gpu4096IsTarget() {
        let hit = Brand.mlai.stats.first { $0.label.contains("4096") }
        #expect(hit?.provenance == .target)
        #expect(Facts.abiMatMul4096.provenance == .target)
    }

    @Test func investorFiguresAreTargets() {
        #expect(Brand.mlai.investorTargets.allSatisfy { $0.provenance == .target })
    }

    @Test func abbeyScoresAreReported() {
        #expect(Brand.mlai.abbey.allSatisfy { $0.provenance == .reported })
    }

    @Test func contactIsTerminal() {
        #expect(Site.next(after: "/contact").isEmpty)
    }

    @Test func fullNavExists() {
        let hrefs = Set(Site.nav.map(\.href))
        #expect(hrefs.isSuperset(of: ["/", "/wdbx", "/abi", "/abbey", "/platform", "/architecture", "/company", "/investors", "/research", "/services", "/contact"]))
    }
}
