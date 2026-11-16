import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh } from "../src/game/engine";
import {
  preservePreCloudSave,
  PRE_CLOUD_BACKUP_KEY,
} from "../src/state/localBackup";

function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

test("pre-cloud backup preserves exact original save and never overwrites it", async () => {
  const storage = memory(),
    first = fresh(1700000000000);
  first.gold = 1234;
  first.gems = 42;
  const raw = JSON.stringify(first);
  await preservePreCloudSave(storage, raw);
  assert.equal(storage.values.get(PRE_CLOUD_BACKUP_KEY), raw);
  const newer = { ...first, gold: 9999, xp: 680 };
  await preservePreCloudSave(storage, JSON.stringify(newer));
  assert.equal(storage.values.get(PRE_CLOUD_BACKUP_KEY), raw);
  assert.equal(storage.values.size, 1);
  assert.equal(first.gold, 1234);
});

test("invalid saves cannot become a migration backup", async () => {
  const storage = memory();
  for (const raw of [
    "not json",
    "{}",
    JSON.stringify({ ...fresh(1), gold: -1 }),
  ])
    await assert.rejects(preservePreCloudSave(storage, raw));
  assert.equal(storage.values.size, 0);
});

test("backup write failure is surfaced and leaves no successful backup marker", async () => {
  const storage = memory();
  await assert.rejects(
    preservePreCloudSave(
      {
        getItem: storage.getItem,
        setItem: async () => {
          throw Error("disk full");
        },
      },
      JSON.stringify(fresh(1)),
    ),
    /disk full/,
  );
  assert.equal(storage.values.size, 0);
});
