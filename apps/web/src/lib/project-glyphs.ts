import { Command, Database, Layers, Sparkles, type LucideIcon } from "lucide-react";
import type { Project } from "@/data/schemas";

/**
 * Maps the vendored `glyph` values to lucide-react icon components.
 *
 * The vendored strings are not all valid lucide-react export names — `spark`
 * has no `Spark` icon and maps to `Sparkles` — so this table exists instead
 * of interpolating `glyph` into a dynamic import or icon-name lookup, which
 * would silently render nothing for a name lucide-react doesn't export.
 *
 * `Record<Project["glyph"], LucideIcon>` makes this exhaustive at the type
 * level: `Project["glyph"]` is the closed enum from `ProjectsSchema`
 * (`src/data/schemas.ts`), so an unmapped case fails `tsc --noEmit`. A glyph
 * value outside that enum fails earlier still, at module load, when
 * `ProjectsSchema.parse` rejects it in `src/data/categories/projects.ts`.
 */
export const PROJECT_GLYPH_ICON: Record<Project["glyph"], LucideIcon> = {
  layers: Layers,
  database: Database,
  spark: Sparkles,
  command: Command,
};
