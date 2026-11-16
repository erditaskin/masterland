import { AppState } from "react-native";
import * as Apple from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Browser from "expo-web-browser";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import type { User } from "@supabase/supabase-js";
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
let googleConfigured = false;
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
  signIn: async (provider: LoginProvider) => {
    if (!accountClient || snapshot.busy) return;
    if (provider === "facebook" && !accountConfig.facebookEnabled) return;
    publish({ busy: true, error: null });
    try {
      const { data, error } = await accountClient.auth.getSession();
      if (error) throw error;
      const linking = Boolean(data.session);
      if (
        data.session?.user.identities?.some(
          (identity) => identity.provider === provider,
        )
      )
        return;
      if (provider === "facebook") {
        const credentials = {
          provider,
          options: { redirectTo: authRedirect, skipBrowserRedirect: true },
        } as const;
        const response = linking
          ? await accountClient.auth.linkIdentity(credentials)
          : await accountClient.auth.signInWithOAuth(credentials);
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
        let token: string | null, nonce: string | undefined;
        if (provider === "apple") {
          nonce = Crypto.randomUUID();
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
          token = result.identityToken;
        } else {
          if (
            !accountConfig.googleIOSClientID ||
            !accountConfig.googleWebClientID
          )
            throw Error("Google not configured");
          if (!googleConfigured) {
            GoogleSignin.configure({
              iosClientId: accountConfig.googleIOSClientID,
              webClientId: accountConfig.googleWebClientID,
            });
            googleConfigured = true;
          }
          const result = await GoogleSignin.signIn();
          if (!isSuccessResponse(result)) return;
          token = result.data.idToken;
        }
        if (!token) throw Error("Missing identity token");
        const credentials = { provider, token, nonce };
        const response = linking
          ? await accountClient.auth.linkIdentity(credentials)
          : await accountClient.auth.signInWithIdToken(credentials);
        if (response.error) throw response.error;
      }
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
    publish({ busy: true });
    try {
      const { error } = await accountClient.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      publish({ error: "session-failed" });
    } finally {
      publish({ busy: false });
    }
  },
};
