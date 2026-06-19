/* Jest configuration. jest-expo wires the React Native / Expo transform,
   module mocks, and test environment for SDK 53. We scope tests to the pure
   logic suites under __tests__/ — no component rendering, no native modules.
   moduleNameMapper mirrors the tsconfig `@/*` alias (Jest ignores tsconfig). */
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
