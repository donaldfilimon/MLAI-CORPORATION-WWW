---
name: swift-63-modernization
description: Use when writing, reviewing, migrating, or debugging Swift 6.3 code, especially strict concurrency, Sendable, actors, SwiftPM, Swift Testing, macros, and Apple-platform builds.
---

# Swift 6.3 Modernization

Treat Swift 6.3 as active only when `swift --version`, `Package.swift`, Xcode settings, or CI confirms the toolchain.

Focus on strict concurrency: `Sendable` values across task boundaries, actor or lock isolation for mutable shared state, `@MainActor` for UI state, and `@Sendable` escaping concurrent closures. Prefer fixing isolation over suppressing diagnostics with `@unchecked Sendable`, `nonisolated(unsafe)`, or `@preconcurrency`.

Use project commands (`swift test`, `swift build`, `xcodebuild`) and only set `swift-tools-version: 6.3` when local and CI toolchains support it.
