import { AppState } from "react-native";
import * as Apple from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Browser from "expo-web-browser";
import type { SignInWithOAuthCredentials, User } from "@supabase/supabase-js";
import { accountClient, accountConfig, authRedirect } from "./client";
import { oauthCode } from "./oauthReturn";
export type LoginProvider = "apple" | "google" | "facebook";
interface AccountSnapshot {
  ready: boolean;
  user: User | null;
  busy: boolean;
  error: "login-failed" | "session-failed" | null;
}
let snapshot: AccountSnapshot = {
  ready: !accountClient,
  user: null,
  busy: false,
  error: null,
};
const listeners = new Set<() => void>();
const publish = (change: Partial<AccountSnapshot>) => {
  snapshot = { ...snapshot, ...change };
  listeners.forEach((listener) => listener());
};
let starting: Promise<void> | null = null;
let deletionProof: { userID: string; code: string; at: number } | null = null;
export function consumeAppleDeletionProof(userID: string) {
  const proof = deletionProof;
  deletionProof = null;
  return proof?.userID === userID && Date.now() - proof.at < 240000
    ? proof.code
    : null;
}

Browser.maybeCompleteAuthSession();
export const accountStore = {
  get: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  start: () => {
    if (starting) return starting;
    starting = (async () => {
      if (!accountClient) return;
      accountClient.auth.onAuthStateChange((_event, session) =>
        publish({ user: session?.user ?? null }),
      );
      AppState.addEventListener("change", (state) => {
        if (state === "active") accountClient?.auth.startAutoRefresh();
        else accountClient?.auth.stopAutoRefresh();
      });
      try {
        const { data, error } = await accountClient.auth.getSession();
        if (error) throw error;
        publish({ ready: true, user: data.session?.user ?? null, error: null });
      } catch {
        publish({ ready: true, error: "session-failed" });
      }
    })();
    return starting;
  },
  signIn: async (provider: LoginProvider, reauthenticate = false) => {
    if (!accountClient || snapshot.busy) return;
    if (provider === "facebook" && !accountConfig.facebookEnabled) return;
    publish({ busy: true, error: null });
    try {
      const { data, error } = await accountClient.auth.getSession();
      if (error) throw error;
      const expectedID = reauthenticate ? data.session?.user.id : null;
      let appleCode: string | null = null;
      let appleName: string | null = null;
      if (reauthenticate) deletionProof = null;
      if (reauthenticate && !expectedID)
        throw Error("No account to reauthenticate");
      if (data.session && !reauthenticate) {
        const existing = await accountClient.auth.getUser();
        if (existing.error || !existing.data.user)
          throw Error("Session verification failed");
        publish({ ready: true, user: existing.data.user, error: null });
        return true;
      }
      if (provider !== "apple") {
        const credentials: SignInWithOAuthCredentials = {
          provider,
          options: {
            redirectTo: authRedirect,
            skipBrowserRedirect: true,
            scopes: provider === "google" ? "openid email profile" : "email",
            ...(provider === "google"
              ? { queryParams: { prompt: "select_account" } }
              : reauthenticate
                ? { queryParams: { auth_type: "reauthenticate" } }
                : {}),
          },
        };
        const response = await accountClient.auth.signInWithOAuth(credentials);
        if (response.error || !response.data.url)
          throw response.error ?? Error("Missing OAuth URL");
        const result = await Browser.openAuthSessionAsync(
          response.data.url,
          authRedirect,
        );
        if (result.type !== "success") return;
        const exchanged = await accountClient.auth.exchangeCodeForSession(
          oauthCode(result.url, authRedirect),
        );
        if (exchanged.error) throw exchanged.error;
      } else {
        const nonce = Crypto.randomUUID();
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          nonce,
        );
        const result = await Apple.signInAsync({
          requestedScopes: [
            Apple.AppleAuthenticationScope.EMAIL,
            Apple.AppleAuthenticationScope.FULL_NAME,
          ],
          nonce: hashed,
        });
        appleName = result.fullName
          ? Apple.formatFullName(result.fullName).trim() || null
          : null;
        const token = result.identityToken;
        appleCode = result.authorizationCode;
        if (!token) throw Error("Missing identity token");
        const credentials = { provider, token, nonce };
        const response =
          await accountClient.auth.signInWithIdToken(credentials);
        if (response.error) throw response.error;
        // Apple supplies the name separately from the ID token, only on initial authorization.
        if (appleName && !reauthenticate) {
          const profile = await accountClient.auth
            .updateUser({
              data: { full_name: appleName },
            })
            .catch(() => null);
          if (profile && !profile.error && profile.data.user)
            publish({ user: profile.data.user });
        }
      }
      const verified = await accountClient.auth.getUser();
      if (verified.error || !verified.data.user)
        throw Error("Session verification failed");
      if (expectedID) {
        if (verified.data.user.id !== expectedID) {
          await accountClient.auth.signOut({ scope: "local" });
          throw Error("Reauthentication account mismatch");
        }
        if (appleCode)
          deletionProof = {
            userID: expectedID,
            code: appleCode,
            at: Date.now(),
          };
      }
      publish({ ready: true, user: verified.data.user, error: null });
      return true;
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? error.code
          : null;
      if (code !== "ERR_REQUEST_CANCELED" && code !== "SIGN_IN_CANCELLED")
        publish({ error: "login-failed" });
    } finally {
      publish({ busy: false });
    }
  },
  signOut: async () => {
    if (!accountClient || snapshot.busy) return;
    publish({ busy: true, error: null });
    try {
      const { error } = await accountClient.auth.signOut({ scope: "local" });
      if (error) throw error;
      deletionProof = null;
      publish({ user: null, error: null });
    } catch {
      publish({ error: "session-failed" });
    } finally {
      publish({ busy: false });
    }
  },
};
