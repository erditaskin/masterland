import { AppState } from "react-native";
import * as Apple from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Browser from "expo-web-browser";
import type { AccountUser } from "./sessionClient";
import { accountClient, accountConfig, authRedirect } from "./client";
import { oauthCode } from "./oauthReturn";
export type LoginProvider = "apple" | "google" | "facebook";
interface AccountSnapshot {
  ready: boolean;
  user: AccountUser | null;
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

const digest = (text: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
const challenge = async (verifier: string) => {
  const hex = await digest(verifier);
  // SHA-256 PKCE uses unpadded base64url, not the hex nonce representation used by Apple.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16));
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n =
      (bytes[i]! << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    result += alphabet[(n >>> 18) & 63]! + alphabet[(n >>> 12) & 63]!;
    if (i + 1 < bytes.length) result += alphabet[(n >>> 6) & 63]!;
    if (i + 2 < bytes.length) result += alphabet[n & 63]!;
  }
  return result;
};
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
      accountClient.subscribe((user) => publish({ user }));
      AppState.addEventListener("change", (state) => {
        if (state === "active" && !snapshot.busy)
          void accountClient
            ?.getUser()
            .then((user) => publish({ user, error: null }))
            .catch(() => publish({ error: "session-failed" }));
      });
      try {
        const session = await accountClient.getSession();
        publish({ ready: true, user: session?.user ?? null, error: null });
        if (session) publish({ user: await accountClient.getUser() });
      } catch {
        publish({ ready: true, error: "session-failed" });
      }
    })();
    return starting;
  },
  ensureGuest: async () => {
    await accountStore.start();
    if (!accountClient || snapshot.busy) return false;
    publish({ busy: true, error: null });
    try {
      if (!(await accountClient.getSession()))
        await accountClient.createGuest(Crypto.randomUUID());
      const user = await accountClient.getUser();
      if (!user) throw Error("Guest session unavailable");
      publish({ ready: true, user });
      return true;
    } catch {
      publish({ error: "session-failed" });
      return false;
    } finally {
      publish({ busy: false });
    }
  },
  signIn: async (provider: LoginProvider, reauthenticate = false) => {
    if (
      !accountClient ||
      snapshot.busy ||
      (provider === "facebook" && !accountConfig.facebookEnabled)
    )
      return;
    publish({ busy: true, error: null });
    try {
      const session = await accountClient.getSession();
      const expectedID = reauthenticate ? session?.user.id : null;
      if (reauthenticate && !expectedID)
        throw Error("No account to reauthenticate");
      if (session && !session.user.is_anonymous && !reauthenticate) {
        const user = await accountClient.getUser();
        if (!user) throw Error("Session verification failed");
        publish({ ready: true, user, error: null });
        return true;
      }
      if (provider === "apple") {
        const attempt = await accountClient.request(
          "/v1/auth/apple/challenge",
          { method: "POST", body: { reauthenticate } },
        );
        if (
          !attempt ||
          typeof attempt !== "object" ||
          !("id" in attempt) ||
          typeof attempt.id !== "string" ||
          !("nonce" in attempt) ||
          typeof attempt.nonce !== "string"
        )
          throw Error("Invalid Apple challenge");
        const result = await Apple.signInAsync({
          requestedScopes: [
            Apple.AppleAuthenticationScope.EMAIL,
            Apple.AppleAuthenticationScope.FULL_NAME,
          ],
          nonce: await digest(attempt.nonce),
        });
        if (!result.identityToken) throw Error("Missing identity token");
        // Apple supplies the name separately from the ID token, only on initial authorization.
        const fullName = result.fullName
          ? Apple.formatFullName(result.fullName).trim() || null
          : null;
        await accountClient.signInApple({
          challenge_id: attempt.id,
          identity_token: result.identityToken,
          full_name: fullName,
        });
      } else {
        const verifier =
          Crypto.randomUUID().replace(/-/g, "") +
          Crypto.randomUUID().replace(/-/g, "");
        const attempt = await accountClient.request("/v1/auth/oauth/start", {
          method: "POST",
          body: {
            provider,
            reauthenticate,
            code_challenge: await challenge(verifier),
          },
        });
        if (
          !attempt ||
          typeof attempt !== "object" ||
          !("url" in attempt) ||
          typeof attempt.url !== "string" ||
          !("state" in attempt) ||
          typeof attempt.state !== "string"
        )
          throw Error("Invalid OAuth attempt");
        const result = await Browser.openAuthSessionAsync(
          attempt.url,
          authRedirect,
        );
        if (result.type !== "success") return;
        const code = oauthCode(result.url, authRedirect, attempt.state);
        await accountClient.exchangeOAuth({
          code,
          state: attempt.state,
          code_verifier: verifier,
        });
      }
      const user = await accountClient.getUser();
      if (!user || (expectedID && user.id !== expectedID))
        throw Error("Session verification failed");
      publish({ ready: true, user, error: null });
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
      await accountClient.signOut();
      publish({ user: null, error: null });
    } catch {
      publish({ error: "session-failed" });
    } finally {
      publish({ busy: false });
    }
  },
};
