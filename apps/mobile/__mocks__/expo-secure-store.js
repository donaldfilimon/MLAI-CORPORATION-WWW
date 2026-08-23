/* In-memory manual mock of expo-secure-store. Jest auto-applies manual mocks
   for node_modules, so any `import "expo-secure-store"` in tests hits this
   stateful store — letting cloud.ts's local-fallback repository be exercised
   end-to-end without a device keychain. */
const store = new Map();

module.exports = {
  __store: store,
  __reset: () => store.clear(),
  __seed: (key, value) => store.set(key, value),
  getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
  setItemAsync: jest.fn(async (key, value) => {
    store.set(key, String(value));
  }),
  deleteItemAsync: jest.fn(async (key) => {
    store.delete(key);
  }),
};
