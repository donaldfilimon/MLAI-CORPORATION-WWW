/**
 * Tailwind runs here and nowhere else. `packages/ui/src/styles/index.css`
 * imports Tailwind's layers and declares `@source`, but a stylesheet only
 * produces utilities when the consuming bundler processes it — without this
 * config Next parsed `@source` and `@theme` as unknown at-rules and every
 * shadcn primitive under `packages/ui/src/components/ui` rendered unstyled.
 */
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};

export default config;
