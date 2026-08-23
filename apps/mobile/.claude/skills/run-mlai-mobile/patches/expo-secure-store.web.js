/*
 * localStorage-backed web shim for the expo-secure-store PACKAGE API.
 *
 * Wired in via a metro resolver alias (see SKILL.md "Unlock the gated app on
 * web"): on web only, `expo-secure-store` resolves to this file instead of the
 * package's empty web stub, so AuthProvider can persist a session and the gate
 * becomes passable. NOT a security boundary — plaintext localStorage; dev only.
 */
const mem = globalThis.localStorage;
const k = (key) => "expo-secure-store:" + key;

export async function getItemAsync(key) {
  return mem.getItem(k(key));
}
export async function setItemAsync(key, value) {
  mem.setItem(k(key), String(value));
}
export async function deleteItemAsync(key) {
  mem.removeItem(k(key));
}
export async function isAvailableAsync() {
  return true;
}
