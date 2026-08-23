/* Jest configuration. jest-expo wires the React Native / Expo transform,
   module mocks, and test environment for SDK 53. Suites under __tests__/ cover
   both pure logic (mocked expo-secure-store) and component rendering via
   @testing-library/react-native. moduleNameMapper mirrors the tsconfig `@/*`
   alias (Jest ignores tsconfig). The nested vendored projects (quasar/, www/)
   have their own runners — bun:test and vitest — and are ignored here so their
   suites are never swept into this one. */
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/quasar/", "<rootDir>/www/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
