import Hummingbird
import HummingbirdElementary

@main
enum MLAIApp {
    static func main() async throws {
        let router = Router()
        router.middlewares.add(FileMiddleware("Public", searchForIndexHtml: true))
        Routes.register(on: router)

        var configuration = ApplicationConfiguration()
        configuration.address = .hostname("127.0.0.1", port: 8080)
        let app = Application(router: router, configuration: configuration)
        try await app.runService()
    }
}

enum Routes {
    static func register(on router: Router<BasicRequestContext>) {
        router.get("/") { _, _ in HTMLResponse { HomePage() } }
        router.get("wdbx") { _, _ in HTMLResponse { WDBXPage() } }
        router.get("abi") { _, _ in HTMLResponse { ABIPage() } }
        router.get("abbey") { _, _ in HTMLResponse { AbbeyPage() } }
        router.get("platform") { _, _ in HTMLResponse { PlatformPage() } }
        router.get("architecture") { _, _ in HTMLResponse { ArchitecturePage() } }
        router.get("company") { _, _ in HTMLResponse { CompanyPage() } }
        router.get("investors") { _, _ in HTMLResponse { InvestorsPage() } }
        router.get("research") { _, _ in HTMLResponse { ResearchPage() } }
        router.get("services") { _, _ in HTMLResponse { ServicesPage() } }
        router.get("contact") { _, _ in HTMLResponse { ContactPage() } }
    }
}
