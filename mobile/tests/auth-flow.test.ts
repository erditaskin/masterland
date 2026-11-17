import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { createHash } from "node:crypto";

// Run the real auth store with native/provider boundaries replaced; no device credentials enter tests.
function setup(existingSession = false) {
  const user = {
    is_anonymous: false,
    id: "player",
    identities: [{ provider: "apple" }],
  };
  let session: { user: typeof user } | null = existingSession ? { user } : null;
  let verified = true;
  let cancelled = false;
  let signedOut = false;
  let lastProvider: string | null = null;
  let oauthRequest: any = null;
  let tokenCalls = 0;
  let callback = "masterland://auth/callback?code=test-code&state=test-state";
  let guests = 0;
  const auth = {
    onAuthStateChange() {},
    signInAnonymously: async () => {
      guests++;
      user.is_anonymous = true;
      session = { user };
      return { error: null };
    },
    getSession: async () => ({ data: { session }, error: null }),
    signInWithIdToken: async (credentials: { provider: string }) => {
      tokenCalls++;
      lastProvider = credentials.provider;
      session = { user };
      return { data: { user, session }, error: null };
    },
    signInWithOAuth: async (request: any) => {
      oauthRequest = request;
      return { data: { url: "https://example.com/oauth" }, error: null };
    },
    exchangeCodeForSession: async (code: string) => {
      assert.equal(code, "test-code");
      user.is_anonymous = false;
      lastProvider = oauthRequest.provider;
      session = { user };
      return { error: null };
    },
    getUser: async () => ({
      data: { user: verified ? user : null },
      error: verified ? null : Error("offline"),
    }),
    signOut: async () => {
      session = null;
      signedOut = true;
      return { error: null };
    },
  };
  const modules: Record<string, unknown> = {
    "react-native": { AppState: { addEventListener() {} } },
    "expo-apple-authentication": {
      AppleAuthenticationScope: { EMAIL: 0, FULL_NAME: 1 },
      signInAsync: async () => {
        if (cancelled) throw { code: "ERR_REQUEST_CANCELED" };
        return {
          identityToken: "test-token",
          authorizationCode: "test-code",
          fullName: null,
        };
      },
    },
    "expo-crypto": {
      randomUUID: () => "nonce",
      CryptoDigestAlgorithm: { SHA256: "sha256" },
      digestStringAsync: async (_algorithm: string, text: string) =>
        createHash("sha256").update(text).digest("hex"),
    },
    "expo-web-browser": {
      maybeCompleteAuthSession() {},
      openAuthSessionAsync: async () =>
        cancelled ? { type: "cancel" } : { type: "success", url: callback },
    },
    "./client": {
      accountClient: {
        subscribe() {},
        getSession: async () => session,
        getUser: async () => (await auth.getUser()).data.user,
        createGuest: auth.signInAnonymously,
        signInApple: async () => auth.signInWithIdToken({ provider: "apple" }),
        request: async (path: string, options: { body: unknown }) => {
          if (path === "/v1/auth/apple/challenge")
            return { id: "challenge", nonce: "nonce" };
          oauthRequest = options.body;
          return { url: "https://example.com/oauth", state: "test-state" };
        },
        exchangeOAuth: async ({ code }: { code: string }) =>
          auth.exchangeCodeForSession(code),
        signOut: auth.signOut,
      },
      accountConfig: {
        googleIOSClientID: "ios-client",
        googleWebClientID: "web-client",
        facebookEnabled: true,
      },
      authRedirect: "masterland://auth/callback",
    },
    "./oauthReturn": {
      oauthCode: (url: string, expected: string, expectedState: string) => {
        const parsed = new URL(url);
        if (
          parsed.origin !== new URL(expected).origin ||
          parsed.pathname !== new URL(expected).pathname ||
          !parsed.searchParams.get("code") ||
          parsed.searchParams.get("state") !== expectedState
        )
          throw Error("Invalid callback");
        return parsed.searchParams.get("code");
      },
    },
  };
  const source = readFileSync(
    new URL("../src/account/auth.ts", import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exported: Record<string, any> = {};
  new Function("require", "exports", code)((id: string) => {
    assert(id in modules, id);
    return modules[id];
  }, exported);
  return {
    store: exported.accountStore,
    guests: () => guests,
    failVerification: () => {
      verified = false;
    },
    cancel: () => {
      cancelled = true;
    },
    signedOut: () => signedOut,
    lastProvider: () => lastProvider,
    oauthRequest: () => oauthRequest,
    tokenCalls: () => tokenCalls,
    invalidCallback: () => {
      callback = "https://evil.example/callback?code=test-code";
    },
  };
}

test("successful Apple login publishes verified user without relying on auth event delivery", async () => {
  const { store } = setup();
  assert.equal(await store.signIn("apple"), true);
  assert.equal(store.get().user.id, "player");
  assert.equal(store.get().busy, false);
  assert.equal(store.get().error, null);
});
test("sign-out clears visible session and a second Apple sign-in succeeds", async () => {
  const { store, signedOut } = setup();
  await store.signIn("apple");
  await store.signOut();
  assert(signedOut());
  assert.equal(store.get().user, null);
  assert.equal(await store.signIn("apple"), true);
  assert.equal(store.get().user.id, "player");
});
test("cancelled Apple login stays on sign-in without a false error or success", async () => {
  const { store, cancel } = setup();
  cancel();
  assert.equal(await store.signIn("apple"), undefined);
  assert.equal(store.get().user, null);
  assert.equal(store.get().error, null);
  assert.equal(store.get().busy, false);
});
test("failed server verification never returns login success", async () => {
  const { store, failVerification } = setup();
  failVerification();
  assert.equal(await store.signIn("apple"), undefined);
  assert.equal(store.get().error, "login-failed");
  assert.equal(store.get().busy, false);
});

test("stored session is verified and published when visible state has not caught up", async () => {
  const { store } = setup(true);
  assert.equal(store.get().user, null);
  assert.equal(await store.signIn("apple"), true);
  assert.equal(store.get().user.id, "player");
});

for (const provider of ["google", "facebook"] as const) {
  test(`${provider} verifies server identity before success and supports sign out`, async () => {
    const { store, lastProvider } = setup();
    assert.equal(await store.signIn(provider), true);
    assert.equal(lastProvider(), provider);
    assert.equal(store.get().user.id, "player");
    await store.signOut();
    assert.equal(store.get().user, null);
  });
  test(`${provider} cancellation never reports success`, async () => {
    const { store, cancel } = setup();
    cancel();
    assert.equal(await store.signIn(provider), undefined);
    assert.equal(store.get().user, null);
    assert.equal(store.get().error, null);
  });
  test(`${provider} failed server verification never reports success`, async () => {
    const { store, failVerification } = setup();
    failVerification();
    assert.equal(await store.signIn(provider), undefined);
    assert.equal(store.get().error, "login-failed");
  });
}
test("Facebook callback from a different origin cannot exchange a code", async () => {
  const { store, invalidCallback, lastProvider } = setup();
  invalidCallback();
  assert.equal(await store.signIn("facebook"), undefined);
  assert.equal(lastProvider(), null);
  assert.equal(store.get().error, "login-failed");
});

for (const provider of ["google", "facebook"] as const) {
  test(`${provider} uses browser code exchange instead of an SDK ID token without a nonce`, async () => {
    const { store, oauthRequest, tokenCalls } = setup();
    assert.equal(await store.signIn(provider), true);
    assert.equal(tokenCalls(), 0);
    assert.equal(oauthRequest().provider, provider);
    assert.match(oauthRequest().code_challenge, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(oauthRequest().reauthenticate, false);
  });
  test(`${provider} rejects an unrelated callback before code exchange`, async () => {
    const { store, invalidCallback, lastProvider } = setup();
    invalidCallback();
    assert.equal(await store.signIn(provider), undefined);
    assert.equal(lastProvider(), null);
    assert.equal(store.get().error, "login-failed");
  });
}

test("guest session is reused and does not prevent later Google login", async () => {
  const f = setup();
  assert.equal(await f.store.ensureGuest(), true);
  assert.equal(await f.store.ensureGuest(), true);
  assert.equal(f.guests(), 1);
  assert.equal(f.store.get().user.is_anonymous, true);
  assert.equal(await f.store.signIn("google"), true);
  assert.equal(f.lastProvider(), "google");
  assert.equal(f.store.get().user.is_anonymous, false);
});
