/**
 * The MLAI "Lab" design system's public surface — the single entry the
 * design-sync converter bundles (`.design-sync/config.json` → `entry`).
 *
 * Two layers, deliberately kept distinct:
 *   ui/    — shadcn-style primitives (Button, Card, Dialog, …)
 *   site/  — section-level blocks built on them (Section, StatBlock, ProvTag, …)
 *
 * This file exists so both layers reach claude.ai/design from one bundle. It is
 * not an app import path — application code imports from `@/components/ui` and
 * `@/components/site` directly, so nothing here widens the app's bundle.
 */

export * from "./ui";
export * from "./site";
