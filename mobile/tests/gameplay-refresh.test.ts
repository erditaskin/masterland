import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  city,
  producers,
  transition,
  orders,
  validateSave,
  level,
  levelRange,
  migrateCurrentSave,
} from "../src/game/engine";
import { idleHint } from "../src/game/idleHint";
const now = 1700000000000;
const run = (
  s: ReturnType<typeof fresh>,
  a: Parameters<typeof transition>[1],
  time = now,
) => transition(s, a, time, () => false);
test("every chain can be merged to its final tier with zero gold at level one", () => {
  for (const p of producers) {
    let s = fresh(now);
    if (!s.cities[p.cityID]) {
      s.xp = 100000;
      s.gold = 100000;
      s = run(s, { type: "travel", id: p.cityID }).state;
    }
    city(s).owned.push(p.id);
    city(s).owned = [...new Set(city(s).owned)];
    s.xp = 0;
    s.gold = 0;
    for (let t = 0; t < p.products.length - 1; t++) {
      city(s).board.fill(null);
      city(s).board[0] = { id: "left", item: p.products[t]!.id };
      city(s).board[1] = { id: "right", item: p.products[t]!.id };
      const before = s.gold,
        r = run(s, { type: "move", from: 0, to: 1 });
      assert.equal(r.kind, "merge");
      assert.equal(r.message, "");
      assert.equal(city(r.state).board[1]?.item, p.products[t + 1]!.id);
      assert(r.state.gold > before);
      assert(r.state.discoveries.includes(p.products[t + 1]!.id));
      s = r.state;
      assert(validateSave(s));
    }
  }
});
test("early orders favor two products and later cities offer at most one triple", () => {
  let s = fresh(now);
  while (level(s) < 3) s.xp++;
  city(s).owned = producers
    .filter((p) => p.cityID === "city1")
    .slice(0, 3)
    .map((p) => p.id);
  const list = orders(s);
  assert(list.some((o) => o.requirements.length === 2));
  assert(!list.some((o) => o.requirements.length === 3));
  city(s).repeatIndex = 18;
  assert.equal(orders(s).filter((o) => o.requirements.length === 3).length, 1);
  for (const o of list) {
    assert.equal(
      new Set(
        o.requirements.map(
          (r) =>
            producers.find((p) => p.products.some((a) => a.id === r.item_id))!
              .id,
        ),
      ).size,
      o.requirements.length,
    );
  }
});
test("producer refresh is charged once only while waiting and survives serialization", () => {
  const s = fresh(now);
  s.gems = 3;
  city(s).batches.producer1 = { remaining: 0, readyAt: now + 1000 };
  const r = run(s, { type: "producer-refill", id: "producer1" });
  assert.equal(r.state.gems, 0);
  assert.equal(city(r.state).batches.producer1!.remaining, 80);
  assert(validateSave(JSON.parse(JSON.stringify(r.state))));
  const again = run(r.state, { type: "producer-refill", id: "producer1" });
  assert.equal(again.kind, "blocked");
  assert.equal(again.state.gems, 0);
});
test("insufficient gems do not refresh or charge", () => {
  const s = fresh(now);
  s.gems = 2;
  city(s).batches.producer1 = { remaining: 0, readyAt: now + 1000 };
  const r = run(s, { type: "producer-refill", id: "producer1" });
  assert.equal(r.kind, "blocked");
  assert.equal(r.state.gems, 2);
  assert.equal(city(r.state).batches.producer1!.readyAt, now + 1000);
});
test("idle hint skips ready and partially fulfilled requirements", () => {
  const s = fresh(now);
  const chain = producers[0]!.products;
  for (const [index, tier] of [1, 1, 2, 2, 3, 3].entries()) {
    city(s).board[index] = { id: "hint-" + index, item: chain[tier - 1]!.id };
  }
  const sample = [
    { ...orders(s)[0]!, requirements: [{ item_id: chain[0]!.id, quantity: 1 }] },
    { ...orders(s)[1]!, requirements: [
      { item_id: chain[1]!.id, quantity: 2 },
      { item_id: chain[3]!.id, quantity: 1 },
    ] },
  ];
  const before = JSON.stringify(s);
  assert.deepEqual(idleHint(s, now, sample), { from: 4, to: 5, item: chain[2]!.id });
  assert.equal(JSON.stringify(s), before);
  city(s).board[5] = null;
  assert.deepEqual(idleHint(s, now, sample), { producerID: producers[0]!.id });
});
test("idle hint never points to a waiting or energy-starved producer", () => {
  const s = fresh(now);
  assert.deepEqual(idleHint(s, now), { producerID: "producer1" });
  s.stamina = 0;
  assert.equal(idleHint(s, now), null);
  s.stamina = 100;
  city(s).batches.producer1 = { remaining: 0, readyAt: now + 1000 };
  assert.equal(idleHint(s, now), null);
});

test("new progression preserves every existing level and relative progress exactly once", () => {
  for (let xp = 0; xp <= 20000; xp += 37) {
    const s = fresh(now);
    delete s.progressionVersion;
    s.xp = xp;
    const before = level(s),
      range = levelRange(s),
      r = migrateCurrentSave(s, now);
    assert.equal(level(r), before);
    assert(r.xp >= s.xp);
    const next = levelRange(r);
    assert(
      Math.abs(
        (s.xp - range[0]) / (range[1] - range[0]) -
          (r.xp - next[0]) / (next[1] - next[0]),
      ) < 0.01,
    );
    assert.deepEqual(migrateCurrentSave(r, now), r);
    assert(validateSave(r));
  }
});
