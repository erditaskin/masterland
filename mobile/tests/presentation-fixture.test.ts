import { recordDelivery } from "../src/game/deliveryProgress";
import { idleHint } from "../src/game/idleHint";
import { test } from "node:test";
import assert from "node:assert/strict";
import { presentationFixture } from "../src/game/presentationFixture";
import {
  achievementProgress,
  achievementState,
  city,
  cityAchievements,
  cityRules,
  cityProducers,
  cityRule,
  level,
  orders,
  transition,
  validateSave,
} from "../src/game/engine";

test("presentation data is a valid isolated save with 63 cells and unique storage identities", () => {
  const fixture = presentationFixture(1794996000000),
    c = city(fixture);
  assert(validateSave(fixture));
  assert.equal(level(fixture), 12);
  assert.equal(fixture.discoveries.length, 18);
  assert.equal(c.board.length, 63);
  assert.equal(c.board.filter(Boolean).length, 18);
  assert.equal(c.storage.length, 8);
  const identities = [...c.board.filter(Boolean), ...c.storage].map(
    (tile) => tile!.id,
  );
  assert.equal(new Set(identities).size, identities.length);
  const other = presentationFixture(1794996000000, true);
  assert.equal(city(other).board.filter(Boolean).length, 54);
  city(other).storage.pop();
  assert.equal(c.storage.length, 8);
});

test("a repeated restore cannot take the next item at a stale storage index", async () => {
  const { transition } = await import("../src/game/engine");
  const now = 1794996000000,
    fixture = presentationFixture(now);
  const selected = city(fixture).storage[1]!;
  const first = transition(
    fixture,
    { type: "restore", index: 1, expectedID: selected.id },
    now,
  );
  assert.equal(first.kind, "move");
  const before = structuredClone(city(first.state).storage);
  const repeated = transition(
    first.state,
    { type: "restore", index: 1, expectedID: selected.id },
    now,
  );
  assert.equal(repeated.kind, "blocked");
  assert.deepEqual(city(repeated.state).storage, before);
  assert.equal(
    city(repeated.state).board.filter((tile) => tile?.id === selected.id)
      .length,
    1,
  );
});

test("board comparison uses the original sample without changing the other page fixture", () => {
  const fixture = presentationFixture(1794996000000, false, "board");
  assert(validateSave(fixture));
  assert.equal(level(fixture), 1);
  assert.equal(fixture.stamina, 99);
  assert.equal(fixture.gold, 5);
  assert.equal(fixture.gems, 0);
  assert.equal(city(fixture).board.filter(Boolean).length, 15);
  assert.deepEqual(city(fixture).owned, ["producer1"]);
  assert.equal(city(fixture).board[46]?.item, "item1");
  assert.equal(city(fixture).board[53]?.item, "item50");
  assert.equal(level(presentationFixture(1794996000000)), 12);
});

test("Yalıkoru exercises the harbor board in a transient preview", () => {
  const now = 1794996000000;
  const fixture = presentationFixture(now, false, "yalikoru");
  assert.equal(fixture.cityID, "city3");
  assert.equal(cityRule("city3")?.enabled, false);
  assert.equal(validateSave(fixture), false);
  assert.equal(cityProducers(fixture).length, 5);
  assert.deepEqual(
    orders(fixture)
      .slice(0, 3)
      .map((order) => order.requirements.length),
    [1, 2, 3],
  );
  const result = transition(fixture, { type: "move", from: 19, to: 20 }, now);
  assert.equal(result.kind, "merge");
  assert.equal(city(result.state).board[20]?.item, "item168");
});

test("all three standard city boards suggest their nearest mergeable pair", () => {
  const now = 1794996000000;
  for (const [view, from, to] of [
    ["board-mixed", 1, 7],
    ["badinca", 6, 7],
    ["yalikoru", 19, 20],
  ] as const) {
    const save = presentationFixture(now, false, view);
    const hint = idleHint(save, now);
    assert(hint && "from" in hint, view);
    assert.deepEqual([hint.from, hint.to], [from, to], view);
  }
});

test("every city has each profession rank and a combined rank at every level", () => {
  for (const rule of cityRules) {
    const entries = cityAchievements(rule.id);
    const professional = entries.filter(
      (a) => a.metric === "city_mastery_profession",
    );
    assert.ok(professional.length === 14 || professional.length === 21);
    const combined = entries.filter((a) => a.metric === "city_mastery_combo");
    assert.deepEqual(
      combined.map((a) => a.rank_id),
      ["rank0", "rank1", "rank2", "rank3", "rank4", "rank5", "rank6"],
    );
    for (const a of combined)
      assert.equal(a.requirements!.length, professional.length / 7);
  }
});

test("local profession and combined ranks count deliveries once per discipline and pay once", () => {
  const now = 1794996000000;
  const save = presentationFixture(now, false, "yalikoru");
  const order = orders(save)[0]!;
  const afterDelivery = transition(
    save,
    { type: "deliver", id: order.id },
    now,
  ).state;
  const entries = cityAchievements("city3");
  const novice = entries.find((a) => a.id === "city3-profession3-rank0")!;
  const combo = entries.find((a) => a.id === "city3-combo3-rank0")!;
  const other = cityAchievements("city2").find(
    (a) => a.id === "city2-profession5-rank0",
  )!;
  assert.equal(achievementState(afterDelivery, novice), "ready");
  assert.equal(achievementState(afterDelivery, other), "progress");
  assert.equal(achievementProgress(afterDelivery, combo), 1);
  assert.equal(achievementState(afterDelivery, combo), "progress");
  afterDelivery.deliveryProgress = recordDelivery(
    afterDelivery.deliveryProgress,
    "city3",
    [
      { itemID: "item15", producerID: "producer3", quantity: 1 },
      { itemID: "item167", producerID: "producer15", quantity: 1 },
      { itemID: "item23", producerID: "producer4", quantity: 1 },
      { itemID: "item169", producerID: "producer16", quantity: 1 },
    ],
  );
  assert.equal(
    achievementProgress(
      afterDelivery,
      entries.find((a) => a.id === "city3-profession3-rank1")!,
    ),
    2,
  );
  assert.equal(achievementProgress(afterDelivery, combo), 3);
  assert.equal(achievementState(afterDelivery, combo), "ready");
  const claim = transition(
    afterDelivery,
    { type: "claim-achievement", id: combo.id },
    now,
  );
  assert.equal(claim.kind, "reward");
  assert.equal(claim.state.gold - afterDelivery.gold, combo.reward.gold);
  assert.ok(claim.state.titles.includes(combo.id));
  assert.equal(achievementState(claim.state, combo), "claimed");
  const repeated = transition(
    claim.state,
    { type: "claim-achievement", id: combo.id },
    now,
  );
  assert.equal(repeated.kind, "blocked");
  assert.equal(repeated.state.gold, claim.state.gold);
});

test("new town review boards share five producer chains and retain their boards on preview travel", async () => {
  const { boardCapacity } = await import("../src/game/grid");
  for (const [view, cityID] of [
    ["demirdere", "city4"],
    ["ipekyolu", "city5"],
  ] as const) {
    const save = presentationFixture(1000, false, view);
    assert.equal(save.cityID, cityID);
    assert.equal(boardCapacity(cityID), 54);
    const groups = cityProducers(save);
    assert.equal(groups.length, 5);
    assert.ok(groups.every((group) => group.products.length >= 2));
    assert.equal(validateSave(save), false);
    const first = orders(save)[0]!;
    const delivery = transition(save, { type: "deliver", id: first.id }, 1010);
    assert.equal(delivery.kind, "reward");
    const profession = cityAchievements(cityID).find(
      (a) => a.metric === "city_mastery_profession" && a.rank_id === "rank0",
    )!;
    assert.equal(achievementState(delivery.state, profession), "ready");
    const award = transition(
      delivery.state,
      { type: "claim-achievement", id: profession.id },
      1011,
    );
    assert.equal(award.kind, "reward");
    assert.ok(award.state.titles.includes(profession.id));
    assert.equal(
      transition(
        award.state,
        { type: "claim-achievement", id: profession.id },
        1012,
      ).kind,
      "blocked",
    );
    const other = cityID === "city4" ? "city5" : "city4";
    assert.equal(
      transition(save, { type: "travel", id: other }, 1010).kind,
      "blocked",
    );
    const travelled = transition(
      delivery.state,
      { type: "travel", id: other },
      1010,
      undefined,
      true,
    );
    assert.equal(travelled.state.cityID, other);
    assert.deepEqual(
      travelled.state.cities[cityID]?.board,
      delivery.state.cities[cityID]?.board,
    );
  }
});
