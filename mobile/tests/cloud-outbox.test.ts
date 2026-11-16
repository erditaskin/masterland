import test from "node:test";
import assert from "node:assert/strict";
import { createCloudOutbox, type CloudWrite } from "../src/account/cloudOutbox";
import { fresh } from "../src/game/engine";
const ownerID = "00000000-0000-4000-8000-000000000001";
function fixture(
  write: (
    owner: string,
    task: CloudWrite,
  ) => Promise<{ kind: "saved" | "conflict"; revision: number }>,
) {
  const values = new Map<string, string>();
  let nextID = 1;
  const storage = {
    async getItem(key: string) {
      return values.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
  const deps = {
    storage,
    key: "outbox",
    ownerID,
    newID: () =>
      `00000000-0000-4000-8000-${String(nextID++).padStart(12, "0")}`,
    write,
  };
  return { values, deps, box: createCloudOutbox(deps) };
}
test("offline queue survives restart and retries the same request receipt", async () => {
  const sent: CloudWrite[] = [];
  let online = false;
  const f = fixture(async (owner, task) => {
    assert.equal(owner, ownerID);
    sent.push(task);
    if (!online) throw Error("offline");
    return { kind: "saved", revision: task.expectedRevision + 1 };
  });
  await f.box.stage(fresh(100));
  await assert.rejects(f.box.flush());
  online = true;
  const restarted = createCloudOutbox(f.deps);
  await restarted.flush();
  assert.equal(sent[0]!.requestID, sent[1]!.requestID);
  assert.equal((await restarted.read()).inFlight, null);
});
test("mutations during an in-flight request coalesce and use its acknowledged revision", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const sent: CloudWrite[] = [];
  const f = fixture(async (_, task) => {
    sent.push(task);
    if (sent.length === 1) await gate;
    return { kind: "saved", revision: task.expectedRevision + 1 };
  });
  await f.box.stage(fresh(100));
  const work = f.box.flush();
  while (!sent.length) await new Promise((resolve) => setTimeout(resolve, 0));
  const later = fresh(100);
  later.gold = 20;
  await f.box.stage(later);
  later.gold = 30;
  await f.box.stage(later);
  release();
  await work;
  assert.equal(sent.length, 2);
  assert.equal(sent[1]!.save.gold, 30);
  assert.equal(sent[1]!.expectedRevision, 1);
});
test("a lost local acknowledgement retries idempotently after the server committed", async () => {
  const receipts = new Map<string, number>();
  const f = fixture(async (_, task) => {
    const committed = receipts.get(task.requestID) ?? task.expectedRevision + 1;
    receipts.set(task.requestID, committed);
    return { kind: "saved", revision: committed };
  });
  await f.box.stage(fresh(100));
  const original = f.deps.storage.setItem;
  let fail = true;
  f.deps.storage.setItem = async (key, value) => {
    if (fail) {
      fail = false;
      throw Error("disk full");
    }
    await original(key, value);
  };
  await assert.rejects(f.box.flush());
  await f.box.flush();
  assert.equal(receipts.size, 1);
  assert.equal((await f.box.read()).baseRevision, 1);
});
test("conflict stops writes until an explicit whole-save choice", async () => {
  let count = 0,
    conflict = true;
  const f = fixture(async (_, task) => {
    count++;
    return conflict
      ? { kind: "conflict", revision: 3 }
      : { kind: "saved", revision: task.expectedRevision + 1 };
  });
  const local = fresh(100);
  local.gold = 22;
  await f.box.stage(local);
  assert.equal(await f.box.flush(), "conflict");
  await f.box.flush();
  assert.equal(count, 1);
  conflict = false;
  await f.box.resolve(3, local);
  await f.box.flush();
  assert.equal((await f.box.read()).baseRevision, 4);
});
test("test progress, foreign owners and malformed server acknowledgements fail closed", async () => {
  const f = fixture(async () => ({ kind: "saved", revision: 99 }));
  const save = fresh(100);
  save.testOnly = true;
  await assert.rejects(f.box.stage(save));
  save.testOnly = false;
  await f.box.stage(save);
  await assert.rejects(f.box.flush());
  assert.notEqual((await f.box.read()).inFlight, null);
  const journal = JSON.parse(f.values.get("outbox")!);
  journal.ownerID = "other";
  f.values.set("outbox", JSON.stringify(journal));
  await assert.rejects(f.box.read());
});
