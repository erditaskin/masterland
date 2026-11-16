import test from "node:test";
import assert from "node:assert/strict";
import {
  eraseDeletedAccountProgress,
  resumeDeletionReset,
  DELETION_RESET_KEY,
  GAME_SAVE_KEY,
} from "../src/state/accountDeletion";
import { PRE_CLOUD_BACKUP_KEY } from "../src/state/localBackup";
function storage() {
  const values = new Map<string, string>([
    [GAME_SAVE_KEY, "old-save"],
    [PRE_CLOUD_BACKUP_KEY, "old-backup"],
    ["language", "en"],
  ]);
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
const requestID = "00000000-0000-4000-8000-000000000001";
test("confirmed account deletion erases save and backup but preserves unrelated preferences", async () => {
  const s = storage();
  let imports = 0;
  await eraseDeletedAccountProgress(s, requestID, async () => {
    imports++;
    assert.equal(JSON.parse(s.values.get(DELETION_RESET_KEY)!).pending, true);
  });
  assert.equal(s.values.has(GAME_SAVE_KEY), false);
  assert.equal(s.values.has(PRE_CLOUD_BACKUP_KEY), false);
  assert.equal(s.values.get("language"), "en");
  assert.equal(imports, 1);
  assert.equal(
    await resumeDeletionReset(s, async () => {
      throw Error("Should not repeat finished cleanup");
    }),
    true,
  );
});
test("interrupted deletion reset resumes before any old save may load", async () => {
  const s = storage();
  await assert.rejects(
    eraseDeletedAccountProgress(s, requestID, async () => {
      throw Error("disk failure");
    }),
  );
  assert.equal(JSON.parse(s.values.get(DELETION_RESET_KEY)!).pending, true);
  // Simulate an interrupted legacy importer having left the old save behind.
  s.values.set(GAME_SAVE_KEY, "must not resurrect");
  await resumeDeletionReset(s, async () => {});
  assert.equal(s.values.has(GAME_SAVE_KEY), false);
  assert.equal(JSON.parse(s.values.get(DELETION_RESET_KEY)!).pending, false);
});
test("malformed deletion receipt does not erase progress", async () => {
  const s = storage();
  await assert.rejects(eraseDeletedAccountProgress(s, "wrong", async () => {}));
  assert.equal(s.values.get(GAME_SAVE_KEY), "old-save");
});
