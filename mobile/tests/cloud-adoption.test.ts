import test from "node:test";
import assert from "node:assert/strict";
import { fresh } from "../src/game/engine";
import {
  cloudKeys,
  recordCloudAdoption,
  resumeCloudAdoption,
  readCloudBinding,
} from "../src/account/cloudLocal";
import {
  NORMAL_SAVE_KEY,
  CONTROLLED_SAVE_KEY,
} from "../src/state/saveNamespace";
const ownerID = "00000000-0000-4000-8000-000000000001";
function storage() {
  const values = new Map<string, string>();
  return {
    values,
    async getItem(key: string) {
      return values.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      values.set(key, value);
    },
    async removeItem(key: string) {
      values.delete(key);
    },
  };
}
test("remote choice preserves the old whole save and never merges balances", async () => {
  const s = storage(),
    previous = fresh(100),
    remote = fresh(100);
  previous.gold = 50;
  remote.gold = 7;
  s.values.set(NORMAL_SAVE_KEY, JSON.stringify(previous));
  await recordCloudAdoption(s, NORMAL_SAVE_KEY, {
    ownerID,
    revision: 3,
    payload: remote,
    previous,
  });
  await resumeCloudAdoption(s, NORMAL_SAVE_KEY, () => ownerID);
  assert.equal(JSON.parse(s.values.get(NORMAL_SAVE_KEY)!).gold, 7);
  assert.equal(
    JSON.parse(s.values.get(cloudKeys(NORMAL_SAVE_KEY).backup(null))!).gold,
    50,
  );
  assert.equal((await readCloudBinding(s, NORMAL_SAVE_KEY))?.ownerID, ownerID);
  assert.equal(s.values.has(CONTROLLED_SAVE_KEY), false);
});
test("interrupted remote choice replays before gameplay without losing the original backup", async () => {
  const s = storage(),
    previous = fresh(100),
    remote = fresh(100);
  previous.gold = 70;
  remote.gold = 8;
  await recordCloudAdoption(s, NORMAL_SAVE_KEY, {
    ownerID,
    revision: 2,
    payload: remote,
    previous,
  });
  const write = s.setItem;
  let fail = true;
  s.setItem = async (key, value) => {
    if (key === cloudKeys(NORMAL_SAVE_KEY).binding && fail) {
      fail = false;
      throw Error("disk full");
    }
    await write(key, value);
  };
  await assert.rejects(resumeCloudAdoption(s, NORMAL_SAVE_KEY, () => ownerID));
  assert.equal(
    await resumeCloudAdoption(s, NORMAL_SAVE_KEY, () => ownerID),
    true,
  );
  assert.equal(
    JSON.parse(s.values.get(cloudKeys(NORMAL_SAVE_KEY).backup(null))!).gold,
    70,
  );
  assert.equal(s.values.has(cloudKeys(NORMAL_SAVE_KEY).adoption), false);
});
test("test-only remote payload, wrong namespace and corrupt binding cannot replace progress", async () => {
  const s = storage(),
    payload = fresh(100);
  payload.testOnly = true;
  await assert.rejects(
    recordCloudAdoption(s, NORMAL_SAVE_KEY, {
      ownerID,
      revision: 1,
      payload,
      previous: fresh(100),
    }),
  );
  assert.throws(() => cloudKeys("other"));
  s.values.set(
    cloudKeys(NORMAL_SAVE_KEY).binding,
    '{"ownerID":"other","uploadedHash":null}',
  );
  await assert.rejects(readCloudBinding(s, NORMAL_SAVE_KEY));
});
