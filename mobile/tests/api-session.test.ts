import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAccountClient,
  readAccountSession,
  AccountAPIError,
} from "../src/account/sessionClient";
import { oauthCode } from "../src/account/oauthReturn";

const owner = "10000000-0000-4000-8000-000000000001";
const login = (id = owner, token = "t".repeat(43)) => ({
  access_token: token,
  expires_at: 1800000000,
  user: {
    id,
    is_anonymous: true,
    email: null,
    user_metadata: { full_name: null },
    identities: [],
  },
});
function setup() {
  const values = new Map<string, string>();
  const calls: { url: string; headers: Headers; body: unknown }[] = [];
  let failStorage = false;
  let response: (url: string) => Promise<Response> = async (url) =>
    Response.json(url.endsWith("/me") ? login().user : login());
  const client = createAccountClient({
    url: "https://api.masterland.app",
    key: "session",
    storage: {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => {
        if (failStorage) throw Error("keychain unavailable");
        values.set(key, value);
      },
      removeItem: async (key) => {
        values.delete(key);
      },
    },
    fetch: async (input, init) => {
      const url = String(input);
      calls.push({
        url,
        headers: new Headers(init?.headers),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return response(url);
    },
  });
  return {
    client,
    values,
    calls,
    failStorage: () => {
      failStorage = true;
    },
    respond: (next: typeof response) => {
      response = next;
    },
  };
}
test("guest identity is created only on explicit request, persisted securely and reused", async () => {
  const f = setup();
  assert.equal(await f.client.getSession(), null);
  assert.equal(f.calls.length, 0);
  await f.client.createGuest("request");
  await f.client.createGuest("another");
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0]?.headers.has("authorization"), false);
  assert(f.values.has("session"));
});
test("cloud request pins the owner token and rejects another owner before transmission", async () => {
  const f = setup();
  await f.client.createGuest("request");
  await assert.rejects(
    f.client.request("/v1/save", { ownerID: "another" }),
    /Account changed/,
  );
  assert.equal(f.calls.length, 1);
  await f.client.request("/v1/save", { ownerID: owner });
  assert.equal(
    f.calls.at(-1)?.headers.get("authorization"),
    `Bearer ${login().access_token}`,
  );
});
test("failed secure session commit preserves previous guest after provider login", async () => {
  const f = setup();
  await f.client.createGuest("request");
  const before = f.values.get("session");
  f.failStorage();
  f.respond(async () =>
    Response.json(
      login("20000000-0000-4000-8000-000000000001", "n".repeat(43)),
    ),
  );
  await assert.rejects(
    f.client.exchangeOAuth({
      code: "code",
      state: "state",
      code_verifier: "verifier",
    }),
    /keychain/,
  );
  assert.equal((await f.client.getSession())?.user.id, owner);
  assert.equal(f.values.get("session"), before);
});
test("late old-owner API failure cannot sign out a newer session", async () => {
  const f = setup();
  await f.client.createGuest("request");
  let release: (r: Response) => void = () => {};
  f.respond(async (url) =>
    url.endsWith("/save")
      ? new Promise<Response>((resolve) => {
          release = resolve;
        })
      : Response.json(
          login("20000000-0000-4000-8000-000000000001", "n".repeat(43)),
        ),
  );
  const old = f.client.request("/v1/save", { ownerID: owner });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await f.client.exchangeOAuth({
    code: "code",
    state: "state",
    code_verifier: "verifier",
  });
  release(new Response("", { status: 401 }));
  await assert.rejects(old, AccountAPIError);
  assert.equal(
    (await f.client.getSession())?.user.id,
    "20000000-0000-4000-8000-000000000001",
  );
});
test("late provider exchange cannot restore a session after local erasure", async () => {
  const f = setup();
  await f.client.createGuest("request");
  let release: (r: Response) => void = () => {};
  f.respond(
    async () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      }),
  );
  const exchange = f.client.exchangeOAuth({
    code: "code",
    state: "state",
    code_verifier: "verifier",
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await f.client.clearLocal();
  release(Response.json(login()));
  await assert.rejects(exchange, /Account changed/);
  assert.equal(await f.client.getSession(), null);
});
test("corrupt session does not silently become a new guest", async () => {
  const f = setup();
  f.values.set("session", "{}");
  await assert.rejects(f.client.getSession(), /Invalid session/);
  assert.equal(f.calls.length, 0);
  assert.throws(() =>
    readAccountSession({ ...login(), access_token: "legacy.jwt" }),
  );
});
test("deletion capability status sends no session token", async () => {
  const f = setup();
  await f.client.createGuest("request");
  await f.client.request("/v1/account/deletion/status", {
    method: "POST",
    anonymous: true,
    body: { request_id: "request", receipt: "receipt" },
  });
  assert.equal(f.calls.at(-1)?.headers.has("authorization"), false);
});

test("deletion receipt recovery remains available when the old auth session is corrupt", async () => {
  const f = setup();
  f.values.set("session", "{}");
  await f.client.request("/v1/account/deletion/status", {
    method: "POST",
    anonymous: true,
    body: { request_id: "request", receipt: "receipt" },
  });
  assert.equal(f.calls[0]?.headers.has("authorization"), false);
  await f.client.clearLocal();
  assert.equal(await f.client.getSession(), null);
  assert.equal(f.values.has("session"), false);
});
test("OAuth return requires exact state and rejects duplicates, fragments and credentials", () => {
  const base = "masterland://auth/callback";
  assert.equal(
    oauthCode(`${base}?code=ok&state=expected`, base, "expected"),
    "ok",
  );
  assert.equal(
    oauthCode(`${base}?code=ok&state=expected#`, base, "expected"),
    "ok",
  );
  for (const url of [
    `${base}?code=ok`,
    `${base}?code=ok&state=wrong`,
    `${base}?code=ok&state=expected&state=expected`,
    `${base}?code=ok&state=expected#token`,
    `${base}?code=ok&state=expected#_=_`,
    "masterland://user:pass@auth/callback?code=ok&state=expected",
  ])
    assert.throws(() => oauthCode(url, base, "expected"));
});

test("sign-out succeeds when the server has already invalidated the session", async () => {
  const f = setup();
  await f.client.createGuest("request");
  f.respond(async () => Response.json({}, { status: 401 }));
  await f.client.signOut();
  assert.equal(await f.client.getSession(), null);
  assert.equal(f.values.has("session"), false);
});
