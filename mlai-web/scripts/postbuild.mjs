// GitHub Pages runs Jekyll by default, which ignores _next/. .nojekyll disables it.
import { writeFileSync, existsSync } from "node:fs";
if (!existsSync("docs")) { console.error("docs/ missing — did next build run?"); process.exit(1); }
writeFileSync("docs/.nojekyll", "");
console.log("✓ docs/.nojekyll written");
