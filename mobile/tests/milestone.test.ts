import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advance,
  city,
  cityRule,
  cityOrderStage,
  newCity,
  product,
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
  assert.deepEqual(city(again).board, city(created).board);
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
      assert(
        city(a).owned.includes(
          producers.find((p) =>
            p.products.some((item) => item.id === r.item_id),
          )!.id,
        ),
      );
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
  for (const type of [
    "test-gold-add",
    "test-gems-add",
    "test-level-up",
  ] as const) {
    const result = run(s, { type });
    assert.equal(result.kind, "blocked");
    assert.equal(result.state.gold, s.gold);
    assert.equal(result.state.gems, s.gems);
    assert.equal(result.state.xp, s.xp);
  }
  assert.equal(
    run(s, {
      type: "storekit-credit",
      sku: "com.erditaskin.masterland.gems30",
      transaction: "fake",
    }).kind,
    "blocked",
  );
});

test("all five cities begin at stage one and retire Tier 1 independently", () => {
  const s = fresh(now);
  s.xp = 55000;
  for (const id of ["city2", "city3", "city4", "city5"]) s.cities[id] = newCity(id);
  for (const id of Object.keys(s.cities)) {
    s.cityID = id;
    const c = city(s);
    assert.equal(cityOrderStage(s), id === "city1" ? 5 : 1);
    c.owned = cityProducers(s).map((producer) => producer.id);
    const repeats = () => orders(s).filter((order) => order.id.includes("-repeat-"));
    for (let i = id === "city1" ? 0 : 8; i < 16; i++) {
      c.repeatIndex = i;
      const tiers = repeats().flatMap((order) =>
        order.requirements.map((requirement) => product(requirement.item_id).tier),
      );
      assert(tiers.filter((tier) => tier === 1).length <= 1, id);
      assert(tiers.filter((tier) => tier === 2).length > tiers.length / 2, id);
    }
    for (let i = 16; i < 120; i++) {
      c.repeatIndex = i;
      const list = repeats();
      assert.equal(list.length, 5);
      assert.equal(list[0]!.requirements.length, 1);
      for (const order of list) {
        assert(order.requirements.every((r) => product(r.item_id).tier >= 2), id);
        assert(order.requirements.every((r) => r.quantity === 1 || product(r.item_id).tier < 4));
      }
    }
  }
  s.cityID = "city1";
  assert.equal(cityOrderStage(s), 60);
});

test("Belenyaka level six graduates repeat orders to Tier 2 without rewriting the save", () => {
  const s = fresh(now);
  assert.equal(s.gems, 25);
  s.gems = 0;
  s.xp = 720;
  const existing = JSON.parse(JSON.stringify(s));
  const restored = migrateCurrentSave(existing, now);
  assert.equal(restored.gems, 0);
  assert.equal(cityOrderStage(restored), 5);
  const tiers = orders(restored)
    .filter((order) => order.id.includes("-repeat-"))
    .flatMap((order) => order.requirements.map((line) => product(line.item_id).tier));
  assert(tiers.filter((tier) => tier === 2).length > tiers.length / 2);
  assert(tiers.filter((tier) => tier === 1).length <= 1);
  const purchase = run(s, { type: "exchange", id: "energy25" });
  assert.equal(purchase.kind, "blocked");
  s.gems = 3;
  const paid = run(s, { type: "exchange", id: "energy25" });
  assert.equal(paid.state.gems, 0);
  assert.equal(paid.state.stamina, s.stamina + 25);
});

test("welcome energy survives a save and can only be collected once", () => {
  const initial = fresh(now);
  assert.equal(initial.stamina, 100);
  assert.equal(initial.gems, 25);
  assert.equal(run(initial, { type: "welcome-energy" }).kind, "blocked");
  initial.stamina = 1;
  const empty = run(initial, { type: "produce", id: "producer1" }).state;
  assert.equal(empty.welcomeEnergy, "pending");
  const resumed = migrateCurrentSave(JSON.parse(JSON.stringify(empty)), now);
  const claimed = run(resumed, { type: "welcome-energy" }).state;
  assert.equal(claimed.stamina, 100);
  assert.equal(claimed.welcomeEnergy, "claimed");
  assert.equal(run(claimed, { type: "welcome-energy" }).kind, "blocked");
  claimed.stamina = 1;
  assert.equal(run(claimed, { type: "produce", id: "producer1" }).state.welcomeEnergy, "claimed");
});

test("the real board advances onboarding and skip persists until explicit replay", () => {
  let s = fresh(now);
  s = run(s, { type: "onboarding-start" }).state;
  assert.equal(s.onboarding, "produce");
  s = run(s, { type: "produce", id: "producer1" }).state;
  assert.equal(s.onboarding, "merge");
  s = run(s, { type: "produce", id: "producer1" }).state;
  const occupied = city(s).board.flatMap((tile, index) => tile ? [index] : []);
  s = run(s, { type: "move", from: occupied[0]!, to: occupied[1]! }).state;
  assert.equal(s.onboarding, "deliver");
  s = run(s, { type: "onboarding-finish" }).state;
  assert.equal(migrateCurrentSave(s, now).onboarding, "done");
  assert.equal(run(s, { type: "onboarding-start" }).kind, "blocked");
  const replayed = run(s, { type: "onboarding-replay" }).state;
  assert.equal(replayed.onboarding, "welcome");
  assert.deepEqual(city(replayed).board, city(s).board);
  assert.deepEqual([replayed.gold, replayed.gems, replayed.stamina], [s.gold, s.gems, s.stamina]);
});
