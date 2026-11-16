import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advance,
  city,
  cityRule,
  cityProducers,
  fresh,
  migrateCurrentSave,
  producers,
  transition,
  validateSave,
  energyCountdown,
  orders,
} from "../src/game/engine";
const now = 1700000000000;
const run = (
  s: ReturnType<typeof fresh>,
  a: Parameters<typeof transition>[1],
  time = now,
) => transition(s, a, time, () => false);
test("bonus energy never regenerates; crossing threshold resets refill clock", () => {
  let s = fresh(now);
  s.stamina = 125;
  s.energyAt = now - 1e9;
  assert.equal(advance(s, now).stamina, 125);
  for (let i = 0; i < 26; i++) {
    s = run(s, { type: "produce", id: "producer1" }).state;
  }
  assert.equal(s.stamina, 99);
  assert.equal(s.energyAt, now);
  assert.equal(advance(s, now + 119999).stamina, 99);
  assert.equal(advance(s, now + 120000).stamina, 100);
  assert.equal(advance(s, now + 99999999).stamina, 100);
});
test("old capacity saves preserve wallet energy items and never retroactively reward", () => {
  const s = fresh(now);
  s.staminaCapacity = 175;
  s.stamina = 162;
  s.gold = 3000;
  s.gems = 12;
  s.discoveries = ["item1"];
  const migrated = migrateCurrentSave(s, now);
  assert(validateSave(migrated));
  assert.equal(migrated.stamina, 162);
  assert.equal(migrated.gold, 3000);
  assert.equal(migrated.gems, 12);
  assert.equal(migrated.staminaCapacity, undefined);
  assert.deepEqual(migrated.discoveries, s.discoveries);
  assert.deepEqual(migrated.rewardQueue, []);
  assert.deepEqual(migrateCurrentSave(migrated, now), migrated);
});
test("all producers have seven to twelve distinct tiers and every open upper tier merges", () => {
  for (const p of producers) {
    assert(p.products.length >= 7 && p.products.length <= 12);
    assert.equal(new Set(p.products.map((v) => v.id)).size, p.products.length);
    for (let i = 0; i < p.products.length - 1; i++) {
      const s = fresh(now);
      s.xp = 100000;
      s.gold = 100000;
      if (p.cityID !== s.cityID) {
        const travelled = run(s, { type: "travel", id: p.cityID }).state;
        Object.assign(s, travelled);
      }
      city(s).owned = [p.id];
      city(s).opened = p.products.map((v) => v.id);
      city(s).board[0] = { id: "a", item: p.products[i]!.id };
      city(s).board[1] = { id: "b", item: p.products[i]!.id };
      const result = run(s, { type: "move", from: 0, to: 1 });
      assert.equal(result.kind, "merge", `${p.id} tier ${i + 1}`);
      assert.equal(city(result.state).board[1]?.item, p.products[i + 1]!.id);
      assert(validateSave(result.state));
    }
  }
});
test("city access is level plus once-only fee; boards and storage survive round trip", () => {
  const s = fresh(now);
  const rule = cityRule("city2")!;
  s.gold = 99999;
  assert.equal(run(s, { type: "travel", id: "city2" }).kind, "blocked");
  s.xp = 100000;
  s.gold = rule.gold - 1;
  assert.equal(run(s, { type: "travel", id: "city2" }).kind, "blocked");
  s.gold = rule.gold + 100;
  city(s).board[0] = { id: "old", item: "item1" };
  city(s).storage.push({ id: "stored", item: "item2" });
  const there = run(s, { type: "travel", id: "city2" }).state;
  assert.equal(there.gold, 100);
  assert.equal(there.xp, s.xp);
  assert.equal(city(there).board[0], null);
  assert(cityProducers(there).every((p) => p.cityID === "city2"));
  const created = run(there, {
    type: "produce",
    id: cityProducers(there)[0]!.id,
  }).state;
  const back = run(created, { type: "travel", id: "city1" }).state;
  assert.equal(city(back).board[0]?.id, "old");
  assert.equal(city(back).storage[0]?.id, "stored");
  const again = run(back, { type: "travel", id: "city2" }).state;
  assert.equal(again.gold, back.gold);
  assert(city(again).board[0]);
  assert(validateSave(again));
  assert.equal(run(again, { type: "buy", id: "producer5" }).kind, "blocked");
});
test("discovery queues reward once and dismissing it never pays twice", () => {
  const s = fresh(now);
  const a = run(s, { type: "produce", id: "producer1" }).state;
  assert.equal(a.gold, 5);
  assert.equal(a.rewardQueue?.length, 1);
  const b = run(a, { type: "produce", id: "producer1" }).state;
  assert.equal(b.gold, 5);
  assert.equal(b.rewardQueue?.length, 1);
  const c = run(b, { type: "dismiss-reward", id: b.rewardQueue![0]!.id }).state;
  assert.equal(c.gold, 5);
  assert.equal(c.rewardQueue?.length, 0);
  assert.equal(
    run(c, { type: "dismiss-reward", id: "discovery-item1" }).kind,
    "blocked",
  );
});
test("orders never require locked city products; countdown disappears at 100 and above", () => {
  const s = fresh(now);
  s.xp = 10000;
  s.gold = 100000;
  const a = run(s, { type: "travel", id: "city2" }).state;
  for (const order of orders(a))
    for (const r of order.requirements)
      assert(city(a).opened.includes(r.item_id));
  assert.equal(energyCountdown(s, now), "");
  s.stamina = 125;
  assert.equal(energyCountdown(s, now), "");
  s.stamina = 90;
  assert.equal(energyCountdown(s, now), "20:00");
});
test("production builds block test refill and StoreKit credit at domain boundary", () => {
  const s = fresh(now);
  s.stamina = 4;
  assert.equal(run(s, { type: "test-energy-fill" }).kind, "blocked");
  assert.equal(
    run(s, {
      type: "storekit-credit",
      sku: "com.erditaskin.masterland.gems30",
      transaction: "fake",
    }).kind,
    "blocked",
  );
});

test("fully unlocked high-tier collections always retain a quick playable order", () => {
  const s = fresh(now);
  s.xp = 2000;
  city(s).owned = cityProducers(s).map((p) => p.id);
  city(s).opened = cityProducers(s).flatMap((p) => p.products.map((v) => v.id));
  city(s).introIndex = 6;
  for (let i = 0; i < 100; i++) {
    city(s).repeatIndex = i;
    assert(
      orders(s).some((o) =>
        o.requirements.every((r) => productTier(r.item_id) === 1),
      ),
    );
  }
  function productTier(id: string) {
    return producers.flatMap((p) => p.products).find((p) => p.id === id)!.tier;
  }
});
