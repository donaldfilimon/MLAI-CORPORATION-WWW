/* Jest configuration. jest-expo wires the React Native / Expo transform,
   module mocks, and test environment for SDK 53. Suites under __tests__/ cover
   both pure logic (mocked expo-secure-store) and component rendering via
   @testing-library/react-native. moduleNameMapper mirrors the tsconfig `@/*`
   alias (Jest ignores tsconfig). Sibling applications live outside this Jest
   root and retain their own runners.

   transformIgnorePatterns restates jest-expo's SDK 53 allowlist with one
   change for the repository's root Bun workspace. Its isolated linker stores
   every package under `node_modules/.bun/<name>@<version>/node_modules/<name>`
   and Jest resolves the real path, so the preset's bare `/node_modules/(?!…)`
   would match the `.bun` segment first and skip transforming React Native and
   Expo sources. The `(?!\.bun/)` guard makes the pattern judge the inner
   package segment instead. Re-copy the allowlist from
   `node_modules/jest-expo/jest-preset.js` when upgrading the SDK. */
const allowlist = [
  "(jest-)?react-native",
  "@react-native(-community)?",
  "expo(nent)?",
  "@expo(nent)?/.*",
  "@expo-google-fonts/.*",
  "react-navigation",
  "@react-navigation/.*",
  "@sentry/react-native",
  "native-base",
  "react-native-svg",
].join("|");

module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    `/node_modules/(?!\\.bun/)(?!(${allowlist}))`,
    "/node_modules/react-native-reanimated/plugin/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
