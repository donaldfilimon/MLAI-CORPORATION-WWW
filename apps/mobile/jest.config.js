/* Jest configuration. jest-expo wires the React Native / Expo transform,
   module mocks, and test environment for SDK 53. Suites under __tests__/ cover
   both pure logic (mocked expo-secure-store) and component rendering via
   @testing-library/react-native. moduleNameMapper mirrors the tsconfig `@/*`
   alias (Jest ignores tsconfig). Sibling applications live outside this Jest
   root and retain their own runners. */
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
