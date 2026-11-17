import { test } from "node:test";
import assert from "node:assert/strict";
import { recordDelivery, deliveryProgress } from "../src/game/deliveryProgress";
import {
  fresh,
  city,
  orders,
  producers,
  product,
  transition,
  validateSave,
  achievementProgress,
  achievementState,
  achievements,
  earnedBadges,
  type Achievement,
} from "../src/game/engine";
const now = 1700000000000;
const requirement = {
  metric: "delivery_orders" as const,
  producer_ids: ["p1", "p2"],
  match: "any" as const,
  target: 5,
};
test("mixed delivery counts once for a shared profession; units remain separate", () => {
  const before = recordDelivery(undefined, "c1", [
    { itemID: "i1", producerID: "p1", quantity: 2 },
    { itemID: "i2", producerID: "p2", quantity: 3 },
  ]);
  const after = recordDelivery(before, "c2", [
    { itemID: "i3", producerID: "p1", quantity: 1 },
  ]);
  assert.equal(
    deliveryProgress(after, "c1", requirement, () => undefined),
    1,
  );
  assert.equal(
    deliveryProgress(
      after,
      "c1",
      { ...requirement, metric: "delivery_items" },
      (id) => (id === "i1" ? "p1" : "p2"),
    ),
    5,
  );
  assert.equal(
    deliveryProgress(before, "c2", requirement, () => undefined),
    0,
  );
  assert.equal(
    deliveryProgress(
      after,
      "c1",
      { ...requirement, producer_ids: ["p3"] },
      () => undefined,
    ),
    0,
  );
});
test("all-producer condition requires producers in the same delivery", () => {
  let stats = recordDelivery(undefined, "c1", [
    { itemID: "i1", producerID: "p1", quantity: 1 },
  ]);
  stats = recordDelivery(stats, "c1", [
    { itemID: "i2", producerID: "p2", quantity: 1 },
  ]);
  assert.equal(
    deliveryProgress(
      stats,
      "c1",
      { ...requirement, match: "all" },
      () => undefined,
    ),
    0,
  );
  stats = recordDelivery(stats, "c1", [
    { itemID: "i1", producerID: "p1", quantity: 1 },
    { itemID: "i2", producerID: "p2", quantity: 1 },
  ]);
  assert.equal(
    deliveryProgress(
      stats,
      "c1",
      { ...requirement, match: "all" },
      () => undefined,
    ),
    1,
  );
});
function deliverFirst() {
  const s = fresh(now),
    order = orders(s)[0]!;
  let index = 0;
  for (const r of order.requirements)
    for (let n = 0; n < r.quantity; n++)
      city(s).board[index++] = { id: `fixture-${index}`, item: r.item_id };
  return {
    s,
    order,
    result: transition(s, { type: "deliver", id: order.id }, now, () => false),
  };
}
test("engine counts only accepted deliveries, preserves input and survives save reload", () => {
  const { s, order, result } = deliverFirst();
  assert.equal(s.deliveryProgress, undefined);
  assert.equal(result.kind, "reward");
  assert(validateSave(result.state));
  const restored = JSON.parse(JSON.stringify(result.state));
  const p = producers[product(order.requirements[0]!.item_id).producer]!;
  const r = { ...requirement, producer_ids: [p.id] };
  assert.equal(
    deliveryProgress(restored.deliveryProgress, s.cityID, r, () => undefined),
    1,
  );
  const duplicate = transition(
    restored,
    { type: "deliver", id: order.id },
    now,
    () => false,
  );
  assert.equal(duplicate.kind, "blocked");
  assert.deepEqual(duplicate.state.deliveryProgress, restored.deliveryProgress);
  assert.equal(
    deliveryProgress(fresh(now).deliveryProgress, s.cityID, r, () => undefined),
    0,
  );
});
test("compound achievements require every condition and grant one title/badge/reward", () => {
  const { result, order } = deliverFirst();
  const p = producers[product(order.requirements[0]!.item_id).producer]!;
  const a: Achievement = {
    id: "achievement-test-mastery",
    city_id: "city1",
    enabled: true,
    kind: "mastery",
    metric: "deliveries",
    target: 100,
    subject_id: null,
    profession_id: "profession-test",
    rank_id: "rank-test",
    badge_id: "badge-test",
    requirements: [
      { ...requirement, producer_ids: [p.id], target: 1 },
      { ...requirement, producer_ids: [p.id], target: 2 },
    ],
    reward: { gold: 10, title: "title-test" },
  };
  achievements.push(a);
  try {
    assert.equal(achievementState(result.state, a), "progress");
    assert.equal(achievementProgress(result.state, a), 50);
    a.requirements![1]!.target = 1;
    assert.equal(achievementState(result.state, a), "ready");
    const claim = transition(
      result.state,
      { type: "claim-achievement", id: a.id },
      now,
      () => false,
    );
    assert.equal(claim.state.gold, result.state.gold + 10);
    assert(claim.state.titles.includes("title-test"));
    assert.equal(
      earnedBadges(claim.state).filter((b) => b.badgeID === "badge-test")
        .length,
      1,
    );
    assert(validateSave(claim.state));
    const again = transition(
      claim.state,
      { type: "claim-achievement", id: a.id },
      now,
      () => false,
    );
    assert.equal(again.kind, "blocked");
    assert.equal(again.state.gold, claim.state.gold);
  } finally {
    achievements.pop();
  }
});
test("legacy saves stay valid; corrupted or cross-city progress is rejected", () => {
  assert(validateSave(fresh(now)));
  const { result } = deliverFirst();
  for (const value of [
    null,
    [],
    { city1: { items: {}, ordersByProducerSet: { bad: 1 } } },
    { city2: result.state.deliveryProgress!.city1 },
    { city1: { items: {}, ordersByProducerSet: { '["unknown"]': 1 } } },
  ]) {
    assert.equal(
      validateSave({ ...result.state, deliveryProgress: value }),
      false,
    );
  }
  const stats = JSON.parse(JSON.stringify(result.state.deliveryProgress));
  const key = Object.keys(stats.city1.ordersByProducerSet)[0]!;
  stats.city1.ordersByProducerSet[key] = -1;
  assert.equal(
    validateSave({ ...result.state, deliveryProgress: stats }),
    false,
  );
});

test("unconfigured mastery requirements cannot grant an instant reward", () => {
  const a: Achievement = {
    id: "draft",
    city_id: "city1",
    enabled: true,
    kind: "mastery",
    metric: "deliveries",
    subject_id: null,
    target: 1,
    reward: {},
    requirements: [{ ...requirement, target: 0 }],
  };
  assert.equal(achievementState(fresh(now), a), "locked");
  a.requirements = [{ ...requirement, producer_ids: ["missing"] }];
  assert.equal(achievementState(fresh(now), a), "locked");
});
