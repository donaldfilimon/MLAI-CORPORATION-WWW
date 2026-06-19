import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";

/* ──────────────────────────────────────────────────────────────────────────
   Sign in with Apple. The Apple ID is the identity; there is no MLAI auth
   server. Apple returns the user's name/email only on the *first* grant, so we
   persist the profile in the device keychain (expo-secure-store) and re-hydrate
   on launch. On every launch we re-check the credential state and sign out if
   the user revoked access in Settings.

   Where Sign in with Apple isn't available (web, Android, simulator without an
   iCloud account) the app offers an explicit, clearly-labeled "preview" guest
   session so the rest of the experience stays reachable in development.
   ────────────────────────────────────────────────────────────────────────── */

const KEY = "mlai.auth.profile.v1";

export type AuthUser = {
  id: string; // Apple's stable user identifier, or "guest"
  name: string | null;
  email: string | null;
  provider: "apple" | "guest";
};

export type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  appleAvailable: boolean;
  signInWithApple: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persist(user: AuthUser | null) {
  if (user) await SecureStore.setItemAsync(KEY, JSON.stringify(user));
  else await SecureStore.deleteItemAsync(KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Bootstrap: probe availability, re-hydrate, validate credential state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const available = Platform.OS === "ios" ? await AppleAuthentication.isAvailableAsync().catch(() => false) : false;
      if (!cancelled) setAppleAvailable(available);

      const raw = await SecureStore.getItemAsync(KEY).catch(() => null);
      const saved = raw ? (JSON.parse(raw) as AuthUser) : null;

      if (saved?.provider === "apple" && available) {
        const state = await AppleAuthentication.getCredentialStateAsync(saved.id).catch(
          () => AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND,
        );
        if (state !== AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
          await persist(null);
          if (!cancelled) {
            setUser(null);
            setStatus("signedOut");
          }
          return;
        }
      }

      if (!cancelled) {
        setUser(saved);
        setStatus(saved ? "signedIn" : "signedOut");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithApple = useCallback(async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const name =
      credential.fullName?.givenName || credential.fullName?.familyName
        ? [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ")
        : null;
    const next: AuthUser = {
      id: credential.user,
      name,
      email: credential.email ?? null,
      provider: "apple",
    };
    await persist(next);
    setUser(next);
    setStatus("signedIn");
  }, []);

  const continueAsGuest = useCallback(async () => {
    const next: AuthUser = { id: "guest", name: "Preview", email: null, provider: "guest" };
    await persist(next);
    setUser(next);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await persist(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, appleAvailable, signInWithApple, continueAsGuest, signOut }),
    [status, user, appleAvailable, signInWithApple, continueAsGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Up-to-two-letter avatar initials for a user: from the name when present,
   otherwise "PV" for a preview/guest session and "ID" for a hidden Apple ID. */
export function initialsFor(user: AuthUser | null): string {
  const fromName = user?.name
    ?.split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (fromName) return fromName;
  return user?.provider === "guest" ? "PV" : "ID";
}
