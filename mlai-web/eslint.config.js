import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  // docs/ is build output and .next/ is Next's cache — neither is source we own.
  { ignores: ["docs", ".next", "node_modules", "next-env.d.ts"] },
  {
    // Root config files are TypeScript too, so they need the TS parser.
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs", "*.ts", "*.mjs"],
    languageOptions: { ecmaVersion: 2022 },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Build tooling and config run on Node, not in the browser.
    files: ["scripts/**/*.mjs", "*.ts", "*.mjs"],
    languageOptions: { globals: globals.node },
  }
);
