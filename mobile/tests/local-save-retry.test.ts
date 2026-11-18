import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import * as engine from "../src/game/engine";
import { presentationFixture } from "../src/game/presentationFixture";
function setup() {
  let fail = false,
    stored: string | null = null;
  const storage = {
    getItem: async () => stored,
    setItem: async (_: string, value: string) => {
      if (fail) throw Error("disk full");
      stored = value;
    },
  };
  const modules: Record<string, unknown> = {
    "expo-crypto": { randomUUID: () => "test-id" },
    "../account/cloudLocal": {
      resumeCloudAdoption: async () => {},
      recordCloudAdoption: async () => {},
    },
    "./saveNamespace": {
      resolveSaveNamespace: () => ({ key: "save", controlled: true }),
    },
    "./accountDeletion": { resumeDeletionReset: async () => false },
    "./localBackup": { preservePreCloudSave: async () => {} },
    "../game/testMode": { testModeEnabled: false, testFlightBeta: false },
    "@react-native-async-storage/async-storage": storage,
    "expo-file-system/legacy": {
      documentDirectory: "",
      getInfoAsync: async () => ({ exists: false }),
    },
    "../game/engine": engine,
    "../game/presentationFixture": { presentationFixture },
    "../game/migrate": {},
  };
  const code = ts.transpileModule(
    readFileSync(new URL("../src/state/store.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exported: Record<string, any> = {};
  new Function("require", "exports", code)((id: string) => {
    assert(id in modules, id);
    return modules[id];
  }, exported);
  return {
    store: exported.gameStore,
    fail: (value: boolean) => {
      fail = value;
    },
    saved: () => (stored ? JSON.parse(stored) : null),
  };
}
test("a failed local write keeps its snapshot for flush retry without another game action", async () => {
  const f = setup();
  await f.store.load();
  await f.store.flush();
  f.fail(true);
  f.store.dispatch({ type: "produce", id: engine.producers[0]!.id });
  await new Promise((resolve) => setImmediate(resolve));
  assert(f.store.get().error);
  const expected = JSON.stringify(f.store.get().save);
  f.fail(false);
  await f.store.flush();
  assert.equal(JSON.stringify(f.saved()), expected);
  assert.equal(f.store.get().error, null);
});
test("the newest local snapshot wins after multiple failed writes", async () => {
  const f = setup();
  await f.store.load();
  await f.store.flush();
  f.fail(true);
  f.store.dispatch({ type: "produce", id: engine.producers[0]!.id });
  f.store.dispatch({ type: "produce", id: engine.producers[0]!.id });
  await new Promise((resolve) => setImmediate(resolve));
  const expected = JSON.stringify(f.store.get().save);
  f.fail(false);
  await f.store.flush();
  assert.equal(JSON.stringify(f.saved()), expected);
  assert.equal(f.store.get().error, null);
});

test("disabled test mode rejects presentation fixtures at the store boundary", async () => {
  const f = setup();
  await f.store.load("presentation", "account-deletion");
  assert.equal(f.store.get().review, false);
  assert.equal(f.store.get().save.xp, 0);
  assert.equal(f.store.get().save.gold, 0);
});
