import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Run the real auth store with native/provider boundaries replaced; no device credentials enter tests.
function setup(existingSession = false) {
  const user = { id: "player", identities: [{ provider: "apple" }] };
  let session: { user: typeof user } | null = existingSession ? { user } : null;
  let verified = true;
  let cancelled = false;
  let signedOut = false;
  const auth = {
    getSession: async () => ({ data: { session }, error: null }),
    signInWithIdToken: async () => {
      session = { user };
      return { data: { user, session }, error: null };
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
      digestStringAsync: async () => "hashed",
    },
    "expo-web-browser": { maybeCompleteAuthSession() {} },
    "@react-native-google-signin/google-signin": {},
    "./client": {
      accountClient: { auth },
      accountConfig: {},
      authRedirect: "masterland://auth/callback",
    },
    "./oauthReturn": {},
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
    failVerification: () => {
      verified = false;
    },
    cancel: () => {
      cancelled = true;
    },
    signedOut: () => signedOut,
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
