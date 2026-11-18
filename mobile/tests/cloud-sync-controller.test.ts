import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, newCity, type Save } from "../src/game/engine";
import { createCloudOutbox } from "../src/account/cloudOutbox";
import { createCloudSyncController } from "../src/account/cloudSyncController";
import type { CloudSave } from "../src/account/cloudProtocol";
const first = "00000000-0000-4000-8000-000000000001";
const second = "00000000-0000-4000-8000-000000000002";
function fixture(guest = false) {
  let local = fresh(100),
    binding: string | null = null,
    online = true;
  let serial = 10,
    writes = 0,
    backups = 0,
    adoptions = 0;
  let pauseFetch: Promise<void> | null = null;
  let pauseWrite: Promise<void> | null = null;
  let pauseReward: Promise<void> | null = null;
  let rewardVerified = true;
  const redeemed = new Set<string>();
  const values = new Map<string, string>(),
    remotes = new Map<string, CloudSave>();
  const storage = {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const receipts = new Map<string, number>();
  const queues = new Map<string, ReturnType<typeof createCloudOutbox>>();
  const queue = (owner: string) => {
    let box = queues.get(owner);
    if (!box) {
      box = createCloudOutbox({
        ownerID: owner,
        storage,
        key: owner,
        newID: () =>
          `00000000-0000-4000-8000-${String(serial++).padStart(12, "0")}`,
        write: async (user, task) => {
          if (pauseWrite) await pauseWrite;
          if (!online) throw Error("offline");
          if (receipts.has(task.requestID))
            return { kind: "saved", revision: receipts.get(task.requestID)! };
          const revision = remotes.get(user)?.revision ?? 0;
          if (revision !== task.expectedRevision)
            return { kind: "conflict", revision };
          writes++;
          remotes.set(user, {
            user_id: user,
            payload: task.save,
            schema_version: 1,
            revision: revision + 1,
            updated_at: new Date().toISOString(),
          });
          receipts.set(task.requestID, revision + 1);
          return { kind: "saved", revision: revision + 1 };
        },
      });
      queues.set(owner, box);
    }
    return box;
  };
  const controller = createCloudSyncController({
    local: () => local,
    localReady: () => true,
    isGuest: () => guest,
    fetch: async (owner) => {
      if (pauseFetch) await pauseFetch;
      if (!online) throw Error("offline");
      return remotes.get(owner) ?? null;
    },
    binding: async () => binding,
    bind: async (owner) => {
      binding = owner;
    },
    backup: async () => {
      backups++;
    },
    adopt: async (remote) => {
      adoptions++;
      local = remote.payload;
      await queue(remote.user_id).resolve(remote.revision);
      binding = remote.user_id;
    },
    queue,
    flushLocal: async () => {},
    redeem: async (owner, intentID, save, revision) => {
      if (pauseReward) await pauseReward;
      if (!rewardVerified) return { kind: "pending" };
      if (redeemed.has(intentID))
        return {
          kind: "already_redeemed",
          revision: remotes.get(owner)!.revision,
        };
      const current = remotes.get(owner)!;
      if (current.revision !== revision)
        return { kind: "conflict", revision: current.revision };
      const payload = {
        ...save,
        stamina: save.stamina + 25,
        transactions: [...(save.transactions ?? []), `ad:${intentID}`],
      };
      remotes.set(owner, { ...current, payload, revision: revision + 1 });
      redeemed.add(intentID);
      return { kind: "redeemed", amount: 25, revision: revision + 1, payload };
    },
  });
  return {
    controller,
    remotes,
    queue,
    local: () => local,
    setLocal: (save: Save) => {
      local = save;
    },
    binding: () => binding,
    counts: () => ({ writes, backups, adoptions }),
    offline: (value: boolean) => {
      online = !value;
    },
    change: (gold: number) => {
      local = { ...local, gold };
    },
    rewardGate: (gate: Promise<void> | null) => {
      pauseReward = gate;
    },
    verified: (value: boolean) => {
      rewardVerified = value;
    },
    writeGate: (gate: Promise<void> | null) => {
      pauseWrite = gate;
    },
    fetchGate: (gate: Promise<void> | null) => {
      pauseFetch = gate;
    },
    remote: (owner: string, revision: number, gold: number) => {
      remotes.set(owner, {
        user_id: owner,
        payload: { ...fresh(100), gold },
        schema_version: 1,
        revision,
        updated_at: new Date().toISOString(),
      });
    },
  };
}
test("first login cannot upload before an explicit device-save choice", async () => {
  const f = fixture();
  await f.controller.connect(first);
  assert.equal(f.controller.get().phase, "choice");
  await f.controller.sync();
  assert.equal(f.counts().writes, 0);
  f.change(123);
  await f.controller.choose("device");
  assert.equal(f.binding(), first);
  assert.equal(f.remotes.get(first)?.payload.gold, 123);
  assert.equal(f.counts().backups, 1);
  assert.equal(f.controller.get().phase, "synced");
});
test("offline updates remain queued and upload after reconnect", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  f.offline(true);
  f.change(99);
  await f.controller.sync();
  assert.equal(f.controller.get().phase, "pending");
  assert.equal((await f.queue(first).read()).inFlight?.save.gold, 99);
  f.offline(false);
  await f.controller.retry();
  assert.equal(f.remotes.get(first)?.payload.gold, 99);
  assert.equal(f.controller.get().phase, "synced");
});
test("second device revision requires an explicit whole-save choice", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  f.remote(first, 8, 700);
  f.change(25);
  await f.controller.retry();
  assert.equal(f.controller.get().phase, "choice");
  assert.equal(f.local().gold, 25);
  await f.controller.choose("cloud");
  assert.equal(f.local().gold, 700);
  assert.equal(f.counts().adoptions, 1);
  assert.equal(f.controller.get().phase, "synced");
});
test("a remote change during confirmation requires a new choice, without writes", async () => {
  const f = fixture();
  f.remote(first, 1, 10);
  await f.controller.connect(first);
  f.remote(first, 2, 20);
  await f.controller.choose("device");
  assert.equal(f.controller.get().phase, "choice");
  assert.equal(f.controller.get().remote?.revision, 2);
  assert.equal(f.counts().writes, 0);
  assert.equal(f.binding(), null);
});
test("late response from an old account cannot adopt or upload to the new account", async () => {
  const f = fixture();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  f.fetchGate(gate);
  const old = f.controller.connect(first);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const next = f.controller.connect(second);
  release();
  await old;
  await next;
  assert.equal(f.controller.get().ownerID, second);
  assert.equal(f.counts().writes, 0);
  assert.equal(f.binding(), null);
  await f.controller.choose("device");
  assert(!f.remotes.has(first));
  assert(f.remotes.has(second));
});
test("sign out during a cloud selection discards its late response", async () => {
  const f = fixture();
  f.remote(first, 1, 900);
  await f.controller.connect(first);
  let release!: () => void;
  f.fetchGate(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  const choosing = f.controller.choose("cloud");
  const leaving = f.controller.connect(null);
  release();
  await choosing;
  await leaving;
  assert.equal(f.controller.get().phase, "signed-out");
  assert.equal(f.counts().adoptions, 0);
  assert.equal(f.counts().writes, 0);
});
test("account switch never silently transfers the prior account's local progress", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  f.change(500);
  await f.controller.connect(second);
  assert.equal(f.controller.get().phase, "choice");
  assert.equal(f.binding(), first);
  await f.controller.sync();
  assert(!f.remotes.has(second));
});

test("unchanged snapshots do not create more cloud revisions", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  const writes = f.counts().writes;
  await f.controller.sync();
  await f.controller.sync();
  assert.equal(f.counts().writes, writes);
  f.change(88);
  await f.controller.sync();
  assert.equal(f.counts().writes, writes + 1);
});

test("disconnect drains an in-flight owner write before deletion cleanup can proceed", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  let release!: () => void;
  f.writeGate(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  f.change(90);
  const syncing = f.controller.sync();
  await new Promise((resolve) => setImmediate(resolve));
  let drained = false;
  const disconnecting = f.controller.connect(null).then(() => {
    drained = true;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(drained, false);
  release();
  await syncing;
  await disconnecting;
  assert.equal(drained, true);
  assert.equal(f.controller.get().phase, "signed-out");
});

test("a verified reward updates the bound save once; a pending signature pays nothing", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  f.verified(false);
  await f.controller.redeem(first);
  assert.equal(f.local().stamina, 100);
  f.verified(true);
  await f.controller.redeem(first);
  assert.equal(f.local().stamina, 125);
  await f.controller.redeem(first);
  assert.equal(f.local().stamina, 125);
  assert.equal(
    f.local().transactions?.filter((id) => id === `ad:${first}`).length,
    1,
  );
});
test("play during a reward request is preserved and requires an explicit cloud choice", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  let release!: () => void;
  f.rewardGate(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  const reward = f.controller.redeem(first);
  await new Promise((resolve) => setImmediate(resolve));
  f.change(999);
  release();
  await reward;
  assert.equal(f.local().gold, 999);
  assert.equal(f.local().stamina, 100);
  assert.equal(f.controller.get().phase, "choice");
  assert.equal(f.controller.get().remote?.payload.stamina, 125);
});
test("a reward response from a signed-out account never replaces local progress", async () => {
  const f = fixture();
  await f.controller.connect(first);
  await f.controller.choose("device");
  let release!: () => void;
  f.rewardGate(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  const reward = f.controller.redeem(first);
  await new Promise((resolve) => setImmediate(resolve));
  const leaving = f.controller.connect(null);
  release();
  await reward;
  await leaving;
  assert.equal(f.local().stamina, 100);
  assert.equal(f.controller.get().phase, "signed-out");
});

test("new guest saves automatically without asking for login or save choice", async () => {
  const f = fixture(true);
  await f.controller.connect(first);
  assert.equal(f.controller.get().phase, "synced");
  assert.equal(f.binding(), first);
  assert.equal(f.counts().writes, 1);
});
test("guest with existing remote progress still requires an explicit choice", async () => {
  const f = fixture(true);
  f.remote(first, 2, 900);
  await f.controller.connect(first);
  assert.equal(f.controller.get().phase, "choice");
  assert.equal(f.counts().writes, 0);
});

test("a cloud save ahead across cities is adopted without confirmation and subsequent play uploads", async () => {
  const f = fixture();
  const remote = fresh(100);
  remote.xp = 500;
  remote.gold = 0;
  remote.cities.city2 = newCity("city2");
  remote.cities.city2.introIndex = 2;
  remote.cityID = "city2";
  f.remotes.set(first, {
    user_id: first,
    revision: 4,
    schema_version: 1,
    payload: remote,
    updated_at: new Date().toISOString(),
  });
  await f.controller.connect(first);
  assert.equal(f.controller.get().phase, "synced");
  assert.equal(f.counts().adoptions, 1);
  assert.equal(f.counts().writes, 0);
  assert.equal(f.local().cityID, "city2");
  assert.equal(f.local().cities.city2?.introIndex, 2);
  f.change(123);
  await f.controller.sync();
  assert.equal(f.remotes.get(first)?.payload.gold, 123);
});

test("local or divergent city progress waits for explicit confirmation", async () => {
  for (const divergent of [false, true]) {
    const f = fixture();
    const local = fresh(100);
    local.cities.city2 = newCity("city2");
    local.cities.city2.introIndex = 2;
    f.setLocal(local);
    const remote = fresh(100);
    remote.xp = divergent ? 900 : 0;
    f.remotes.set(first, {
      user_id: first,
      revision: 4,
      schema_version: 1,
      payload: remote,
      updated_at: new Date().toISOString(),
    });
    await f.controller.connect(first);
    await f.controller.sync();
    assert.equal(f.controller.get().phase, "choice");
    assert.equal(f.counts().writes, 0);
    await f.controller.choose("device");
    assert.equal(f.remotes.get(first)?.payload.cities.city2?.introIndex, 2);
  }
});
