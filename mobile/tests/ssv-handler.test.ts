import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
function setup(
  options: {
    enabled?: boolean;
    keyFailure?: boolean;
    invalidSignature?: boolean;
    rpcFailure?: boolean;
  } = {},
) {
  let handler!: (request: Request) => Promise<Response>;
  let calls = 0;
  const modules: Record<string, unknown> = {
    "npm:@supabase/supabase-js@2.119.0": {
      createClient: () => ({
        rpc: async () => {
          calls++;
          return { error: options.rpcFailure ? Error("offline") : null };
        },
      }),
    },
    "../_shared/admobSignature.ts": {
      verifyAdmobSignature: () => {
        if (options.invalidSignature) throw Error("bad signature");
      },
      verifyAdmobCallback: () => {
        if (options.invalidSignature) throw Error("bad signature");
        return {
          kind: "energy",
          userID: "owner",
          intentID: "intent",
          transactionID: "transaction",
          timestamp: Date.now(),
        };
      },
    },
  };
  const code = ts.transpileModule(
    readFileSync(
      new URL("../../supabase/functions/admob-ssv/index.ts", import.meta.url),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  new Function("require", "exports", "Deno", "fetch", code)(
    (id: string) => {
      assert(id in modules, id);
      return modules[id];
    },
    {},
    {
      env: {
        get: (key: string) =>
          key === "ADMOB_SSV_ENABLED"
            ? options.enabled === false
              ? "false"
              : "true"
            : "test",
      },
      serve: (fn: typeof handler) => {
        handler = fn;
      },
    },
    async () => {
      if (options.keyFailure) throw Error("key service offline");
      return Response.json({ keys: [{ keyId: 1, pem: "test" }] });
    },
  );
  return {
    request: (method = "GET", signed = false) =>
      handler(
        new Request(
          "https://example.test/admob-ssv?key_id=1" +
            (signed ? "&signature=test" : ""),
          { method },
        ),
      ),
    calls: () => calls,
  };
}
test("SSV key-service outages are retryable and cannot create a reward", async () => {
  const f = setup({ keyFailure: true });
  assert.equal((await f.request()).status, 503);
  assert.equal(f.calls(), 0);
});
test("SSV rejects invalid signatures without reaching the ledger", async () => {
  const f = setup({ invalidSignature: true });
  assert.equal((await f.request()).status, 400);
  assert.equal(f.calls(), 0);
});
test("SSV closed flag rejects callbacks; ledger failures remain retryable", async () => {
  const disabled = setup({ enabled: false });
  assert.equal((await disabled.request()).status, 503);
  assert.equal(disabled.calls(), 0);
  const offline = setup({ rpcFailure: true });
  assert.equal((await offline.request()).status, 503);
  assert.equal(offline.calls(), 1);
  const verified = setup();
  assert.equal((await verified.request()).status, 200);
  assert.equal(verified.calls(), 1);
  assert.equal((await verified.request("POST")).status, 405);
  assert.equal(verified.calls(), 1);
});

test("AdMob can verify a signed callback while payouts remain closed", async () => {
  const disabled = setup({ enabled: false });
  const response = await disabled.request("GET", true);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Verified; rewards disabled");
  assert.equal(disabled.calls(), 0);
  const forged = setup({ enabled: false, invalidSignature: true });
  assert.equal((await forged.request("GET", true)).status, 400);
  assert.equal(forged.calls(), 0);
});
