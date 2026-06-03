---
name: zig-017-modernization
description: Use when writing, reviewing, migrating, or debugging Zig 0.17 code, especially build.zig, std.Io, std.process.Init, allocator, import, POSIX, and Darwin linker failures.
---

# Zig 0.17 Modernization

Verify the active compiler with `zig version`, `.zigversion`, `zigly --status`, project scripts, or CI config before assuming a dev-snapshot API.

Use project wrappers first. Probe uncertain APIs with `@hasDecl`, `@typeInfo`, or compile-only snippets. Migrate one API family at a time and verify after each step.

Key patterns: modern `std.process.Init` entry points when required, `std.heap.DebugAllocator` when `GeneralPurposeAllocator` is unavailable, explicit `.zig` imports, module-first `build.zig`, `std.Io.Writer`, unmanaged collections initialized with `.empty`, `errdefer` before `toOwnedSlice`, and careful probing of `std.posix` versus `std.posix.system`.

On newer macOS/Darwin versions, prefer native-link project wrappers when Zig's internal linker fails after compilation.
