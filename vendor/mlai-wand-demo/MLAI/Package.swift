// swift-tools-version: 6.4
import PackageDescription

let wandSettings: [SwiftSetting] = [
    .swiftLanguageMode(.v6),
    .enableUpcomingFeature("ExistentialAny"),
    .enableUpcomingFeature("MemberImportVisibility"),
    .enableUpcomingFeature("InternalImportsByDefault"),
]

let package = Package(
    name: "MLAI",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(name: "MLAI", targets: ["MLAI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/hummingbird-project/hummingbird.git", from: "2.26.0"),
        .package(url: "https://github.com/elementary-swift/elementary.git", from: "0.8.1"),
        .package(url: "https://github.com/hummingbird-community/hummingbird-elementary.git", from: "0.5.1"),
    ],
    targets: [
        .executableTarget(
            name: "MLAI",
            dependencies: [
                .product(name: "Hummingbird", package: "hummingbird"),
                .product(name: "Elementary", package: "elementary"),
                .product(name: "HummingbirdElementary", package: "hummingbird-elementary"),
            ],
            swiftSettings: wandSettings
        ),
        .testTarget(
            name: "MLAITests",
            dependencies: [
                .target(name: "MLAI"),
            ],
            swiftSettings: wandSettings
        ),
    ]
)
