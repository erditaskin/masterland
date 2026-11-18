import { orderItemHighlights, prioritizeOrderRail } from "../src/ui/orderRail";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  productionCell,
  advance,
  energyCap,
  productionPlan,
  achievements,
  achievementState,
  city,
  count,
  fresh,
  intro,
  level,
  orders,
  producers,
  product,
  transition,
  validateSave,
  visualFixture,
  type Save,
  type Action,
} from "../src/game/engine";
import { hitCell } from "../src/game/boardInput";
const now = 1700000000000,
  p = producers[0]!,
  a = p.products[0]!,
  b = p.products[1]!;
const run = (s: Save, action: Action, time = now) =>
  transition(s, action, time, () => false);
function twice() {
  let s = fresh(now);
  s = run(s, { type: "produce", id: p.id }).state;
  s = run(s, { type: "produce", id: p.id }).state;
  // Merge/storage cases use a deliberate adjacent fixture, independently of spawn placement.
  const tiles = city(s).board.filter((t) => t !== null);
  city(s).board = [...tiles, ...Array(63 - tiles.length).fill(null)];
  return s;
}
test("fresh board and first two product areas", () => {
  const s = fresh(now);
  assert.equal(city(s).board.length, 63);
  assert.equal(city(s).opened.length, 2);
  assert.equal(s.stamina, 100);
  assert.equal(level(s), 1);
});
test("production spends exactly one and discovery rewards once", () => {
  const s = twice();
  assert.equal(s.stamina, 98);
  assert.equal(s.xp, 1);
  assert.equal(count(s, a.id), 2);
  assert.equal(s.discoveries.length, 1);
});
test("merge consumes two equal items and creates a unique identity", () => {
  const s = twice(),
    ids = city(s).board.flatMap((t) => (t ? [t.id] : [])),
    r = run(s, { type: "move", from: 0, to: 1 });
  assert.equal(r.kind, "merge");
  assert.equal(count(r.state, a.id), 0);
  assert.equal(count(r.state, b.id), 1);
  assert(!ids.includes(city(r.state).board[1]!.id));
  assert.equal(r.state.stamina, 98);
});
test("simple move preserves tile identity", () => {
  const s = twice(),
    t = city(s).board[0]!;
  const r = run(s, { type: "move", from: 0, to: 53 });
  assert.deepEqual(city(r.state).board[53], t);
  assert.equal(city(r.state).board[0], null);
});
test("outside board and same-cell releases preserve state", () => {
  const s = twice();
  for (const to of [-1, 54, 63, 100, 0])
    assert.equal(run(s, { type: "move", from: 0, to }).state, s);
});
test("different item and maximum-tier merge preserve both tiles", () => {
  const s = visualFixture(now);
  assert.equal(run(s, { type: "move", from: 0, to: 3 }).kind, "blocked");
  const t = p.products.at(-1)!;
  city(s).board[0] = { id: "a", item: t.id };
  city(s).board[1] = { id: "b", item: t.id };
  assert.equal(run(s, { type: "move", from: 0, to: 1 }).state, s);
});
test("undiscovered next product merges without buying a slot", () => {
  let s = twice();
  s = run(s, { type: "move", from: 0, to: 1 }).state;
  s = run(s, { type: "produce", id: p.id }).state;
  s = run(s, { type: "produce", id: p.id }).state;
  const pieces = city(s).board.flatMap((tile, i) =>
    tile?.item === a.id ? [i] : [],
  );
  s = run(s, { type: "move", from: pieces[0]!, to: pieces[1]! }).state;
  assert.equal(count(s, b.id), 2);
  const r = run(s, { type: "move", from: 1, to: pieces[1]! });
  assert.equal(r.kind, "merge");
  assert.equal(count(r.state, b.id), 0);
  assert(r.state.discoveries.includes(p.products[2]!.id));
  assert(r.state.gold > s.gold);
});
test("legacy paid-slot action is rejected without charging or discovering", () => {
  const s = fresh(now);
  s.xp = 60;
  s.gold = 500;
  const t = p.products[2]!;
  const r = run(s, { type: "unlock", id: t.id });
  assert.equal(r.state.xp, 60);
  assert.equal(r.kind, "blocked");
  assert.equal(r.state.gold, 500);
  assert(!city(r.state).opened.includes(t.id));
  assert(!r.state.discoveries.includes(t.id));
});
test("producer purchase is level gated and idempotent", () => {
  const s = fresh(now),
    next = producers[1]!;
  s.gold = 999;
  assert.equal(run(s, { type: "buy", id: next.id }).kind, "blocked");
  s.xp = 20;
  const bought = run(s, { type: "buy", id: next.id }).state;
  assert.equal(bought.gold, 999 - next.price);
  assert.equal(run(bought, { type: "buy", id: next.id }).state, bought);
});
test("full board does not spend energy", () => {
  const s = fresh(now);
  city(s).board = Array.from({ length: 63 }, (_, i) =>
    i < 54 ? { id: String(i), item: a.id } : null,
  );
  const r = run(s, { type: "produce", id: p.id });
  assert.equal(r.kind, "blocked");
  assert.equal(r.state.stamina, 100);
});
test("empty energy does not create an item", () => {
  const s = fresh(now);
  s.stamina = 0;
  assert.equal(run(s, { type: "produce", id: p.id }).kind, "blocked");
  assert.equal(count(s, a.id), 0);
});
test("producer batch and offline refill", () => {
  let s = fresh(now);
  for (let i = 0; i < 80; i++) {
    s = run(s, { type: "produce", id: p.id }).state;
    city(s).board.fill(null);
    s.rewardQueue = [];
  }
  assert.equal(city(s).batches[p.id]!.remaining, 0);
  assert.equal(run(s, { type: "produce", id: p.id }).kind, "blocked");
  s = advance(s, now + 120000);
  assert.equal(city(s).batches[p.id]!.remaining, 80);
  assert.equal(
    run(s, { type: "produce", id: p.id }, now + 120000).kind,
    "produce",
  );
});
test("offline energy caps and backwards clock cannot grant energy", () => {
  const s = twice();
  assert.equal(advance(s, now - 1).stamina, 98);
  assert.equal(advance(s, now + 120000).stamina, 99);
  assert.equal(advance(s, now + 9999999).stamina, 100);
});
test("idle full energy returns same state", () => {
  const s = fresh(now);
  assert.equal(advance(s, now + 1000000), s);
});
test("delivery settles rewards once before presentation", () => {
  let s = twice();
  s = run(s, { type: "move", from: 0, to: 1 }).state;
  const q = intro[0]!;
  const delivered = run(s, { type: "deliver", id: q.id });
  assert.equal(delivered.kind, "reward");
  assert.equal(delivered.state.gold, s.gold + q.gold);
  assert.equal(count(delivered.state, b.id), 0);
  assert.equal(
    run(delivered.state, { type: "deliver", id: q.id }).state,
    delivered.state,
  );
});
test("delivery consumes board before storage", () => {
  let s = twice();
  s = run(s, { type: "move", from: 0, to: 1 }).state;
  city(s).storage.push({ id: "stored-sheaf", item: b.id });
  const r = run(s, { type: "deliver", id: intro[0]!.id });
  assert.equal(city(r.state).storage[0]!.id, "stored-sheaf");
});
test("manual storage and restore preserve exact identity", () => {
  const s = twice(),
    original = city(s).board[0]!;
  const stored = run(s, { type: "store", index: 0 }).state;
  assert.equal(city(stored).board[0], null);
  const restored = run(stored, { type: "restore", index: 0 }).state;
  assert.deepEqual(city(restored).board[0], original);
  assert.equal(restored.xp, s.xp);
});
test("full storage cannot remove a board item", () => {
  const s = twice();
  city(s).storage = Array.from({ length: 12 }, (_, i) => ({
    id: "s" + i,
    item: a.id,
  }));
  assert.equal(run(s, { type: "store", index: 0 }).state, s);
});
test("storage capacity pricing scales in both currencies", () => {
  const s = fresh(now);
  s.gold = 999;
  s.gems = 50;
  const a = run(s, { type: "expand", gems: false }).state;
  assert.equal(city(a).storageCapacity, 16);
  assert.equal(a.gold, 899);
  const b = run(a, { type: "expand", gems: true }).state;
  assert.equal(city(b).storageCapacity, 20);
  assert.equal(b.gems, 40);
});
test("repeat orders use only accessible unlocked content and have unique ids", () => {
  const s = fresh(now),
    list = orders(s);
  assert.equal(list.length, 6);
  assert.equal(new Set(list.map((o) => o.id)).size, 6);
  for (const o of list)
    for (const r of o.requirements) assert(city(s).opened.includes(r.item_id));
});
test("serialised save validates without losing progress", () => {
  const s = twice();
  assert(validateSave(JSON.parse(JSON.stringify(s))));
  assert(!validateSave({ schema: 2 }));
  assert(validateSave({ ...s, stamina: 101 }));
});
test("the clean-start board rejects old 54-cell payloads", () => {
  const s = fresh(now);
  city(s).board = Array(54).fill(null);
  assert.equal(validateSave(s), false);
});
test("all 63 stationary input cells map correctly", () => {
  for (let i = 0; i < 63; i++)
    assert.equal(
      hitCell(((i % 7) + 0.5) * 51, (Math.floor(i / 7) + 0.5) * 51, 51),
      i,
    );
});
test("no row wrapping or off-board hit", () => {
  for (const [x, y] of [
    [-1, 0],
    [357, 0],
    [0, -1],
    [0, 459],
    [NaN, 0],
    [Infinity, 0],
  ])
    assert.equal(hitCell(x!, y!, 51), null);
});
test("a thousand moves and storage cycles do not duplicate or lose items", () => {
  let s = twice();
  for (let n = 0; n < 1000; n++) {
    const from = city(s).board.findIndex(Boolean),
      to = n % 2 ? 52 : 53;
    if (from !== to) s = run(s, { type: "move", from, to }).state;
    const index = city(s).board.findIndex(Boolean);
    s = run(s, { type: "store", index }).state;
    s = run(s, { type: "restore", index: 0 }).state;
    const ids = [...city(s).board, ...city(s).storage].flatMap((t) =>
      t ? [t.id] : [],
    );
    assert.equal(
      [...city(s).board, ...city(s).storage].reduce(
        (v, t) => v + (t ? 2 ** (product(t.item).tier - 1) : 0),
        0,
      ),
      2,
    );
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(s.stamina, 98);
  }
});

test("duplicate identities and malformed storage are rejected", () => {
  const s = twice();
  city(s).board[1] = city(s).board[0]!;
  assert(!validateSave(s));
  const bad = twice();
  city(bad).storage = [{ id: "bad", item: "unknown" }];
  assert(!validateSave(bad));
  assert(!validateSave({ ...twice(), gold: Infinity }));
});

test("near-square reference cells keep all 63 input targets and reject row wrapping", () => {
  for (let i = 0; i < 63; i++)
    assert.equal(
      hitCell(((i % 7) + 0.5) * 62, (Math.floor(i / 7) + 0.5) * 50, 62, 50),
      i,
    );
  assert.equal(hitCell(434, 25, 62, 50), null);
  assert.equal(hitCell(31, 450, 62, 50), null);
});

test("visible order variety preserves the main order and every live requirement", () => {
  const s = visualFixture(1000),
    before = orders(s),
    after = prioritizeOrderRail(before);
  assert.equal(after[0], before[0]);
  assert.deepEqual(
    after.map((o) => o.id).sort(),
    before.map((o) => o.id).sort(),
  );
  assert.equal(
    new Set(
      after
        .slice(0, 3)
        .map((o) => product(o.requirements[0]!.item_id).producer),
    ).size,
    3,
  );
  assert.equal(
    prioritizeOrderRail(orders(fresh(1000)))[0]?.id,
    orders(fresh(1000))[0]?.id,
  );
});

test("first delivery funds mill and second funds oven without repeat grinding", () => {
  let s = twice();
  s = run(s, { type: "move", from: 0, to: 1 }).state;
  s = run(s, { type: "deliver", id: intro[0]!.id }).state;
  assert(level(s) >= producers[1]!.level);
  assert(s.gold >= producers[1]!.price);
  s = run(s, { type: "buy", id: producers[1]!.id }).state;
  for (let i = 0; i < 4; i++)
    s = run(s, { type: "produce", id: producers[0]!.id }).state;
  const positions = city(s).board.flatMap((tile, i) => (tile ? [i] : []));
  s = run(s, { type: "move", from: positions[0]!, to: positions[1]! }).state;
  s = run(s, { type: "move", from: positions[2]!, to: positions[3]! }).state;
  s = run(s, { type: "deliver", id: intro[1]!.id }).state;
  assert(level(s) >= producers[2]!.level);
  assert(s.gold >= producers[2]!.price);
  assert.equal(run(s, { type: "buy", id: producers[2]!.id }).kind, "unlock");
});
test("every upper-tier pair merges after unlocking, with no lost items on final tier", () => {
  for (const producer of producers)
    for (let tier = 0; tier < producer.products.length; tier++) {
      const s = visualFixture(now),
        item = producer.products[tier]!;
      city(s).owned = producers.map((p) => p.id);
      city(s).opened = producers.flatMap((p) => p.products.map((i) => i.id));
      city(s).board = Array(63).fill(null);
      city(s).board[0] = { id: "a", item: item.id };
      city(s).board[1] = { id: "b", item: item.id };
      const r = run(s, { type: "move", from: 0, to: 1 });
      if (tier + 1 < producer.products.length) {
        assert.equal(r.kind, "merge");
        assert.equal(city(r.state).board[0], null);
        assert.equal(
          city(r.state).board[1]?.item,
          producer.products[tier + 1]!.id,
        );
      } else {
        assert.equal(r.kind, "blocked");
        assert.equal(count(r.state, item.id), 2);
        assert.match(r.message, /son ürünü/);
      }
    }
});
test("ready orders precede incomplete ones without changing requirements or rewards", () => {
  const s = twice(),
    before = orders(s),
    sorted = prioritizeOrderRail(before, s);
  assert.equal(sorted[0]!.requirements[0]!.item_id, a.id);
  assert.deepEqual(
    sorted.map((o) => o.id).sort(),
    before.map((o) => o.id).sort(),
  );
});

test("legacy capacity never raises passive refill above 100", () => {
  const s = fresh(now);
  s.staminaCapacity = 150;
  s.stamina = 100;
  s.energyAt = now;
  assert.equal(advance(s, now + 119999).stamina, 100);
  assert.equal(advance(s, now + 120000).stamina, 100);
  assert.equal(advance(s, now + 240000).stamina, 100);
  assert.equal(advance(s, now + 12000000).stamina, 100);
  assert(validateSave({ ...s, stamina: 150 }));
  assert(validateSave({ ...s, stamina: 151 }));
});
test("all boost tiers use 1,2,4,8 energy and revert at the strict 100 boundary", () => {
  for (const mode of [1, 2, 3, 4])
    for (const energy of [99, 100, 101, 125]) {
      const s = fresh(now);
      s.staminaCapacity = 150;
      s.stamina = energy;
      city(s).opened = p.products.map((i) => i.id);
      s.discoveries = p.products.map((i) => i.id);
      city(s).powers = { [p.id]: mode };
      const result = run(s, { type: "produce", id: p.id }),
        effective = energy > 100 ? mode : 1;
      assert.equal(result.kind, "produce");
      assert.equal(result.state.stamina, energy - 2 ** (effective - 1));
      assert.equal(
        city(result.state).board.find((tile) => tile !== null)?.item,
        p.products[effective - 1]!.id,
      );
      assert.equal(productionPlan(result.state, p).selected, mode);
    }
});
test("a boost crossing below 100 falls back without changing the selected power", () => {
  const s = fresh(now);
  s.staminaCapacity = 125;
  s.stamina = 103;
  city(s).opened = p.products.map((i) => i.id);
  s.discoveries = p.products.map((i) => i.id);
  city(s).powers = { [p.id]: 4 };
  const a = run(s, { type: "produce", id: p.id });
  assert.equal(a.state.stamina, 95);
  const b = run(a.state, { type: "produce", id: p.id });
  assert.equal(b.state.stamina, 94);
  assert.equal(count(b.state, p.products[0]!.id), 1);
  assert.equal(city(b.state).powers?.[p.id], 4);
});
test("locked output mode cannot be selected or silently consume energy", () => {
  const s = fresh(now);
  s.staminaCapacity = 125;
  s.stamina = 120;
  assert.equal(run(s, { type: "power", id: p.id, mode: 3 }).kind, "blocked");
  city(s).powers = { [p.id]: 3 };
  const r = run(s, { type: "produce", id: p.id });
  assert.equal(r.kind, "blocked");
  assert.equal(r.state.stamina, 120);
});
test("achievement reward is once-only and adds uncapped energy without capacity", () => {
  const s = fresh(now);
  city(s).introIndex = 1;
  s.stamina = 98;
  const a = achievements[0]!;
  assert.equal(achievementState(s, a), "ready");
  const r = run(s, { type: "claim-achievement", id: a.id });
  assert.equal(r.kind, "reward");
  assert.equal(energyCap(r.state), 100);
  assert.equal(r.state.stamina, 123);
  assert.equal(r.state.xp, 5);
  const again = run(r.state, { type: "claim-achievement", id: a.id });
  assert.equal(again.kind, "blocked");
  assert.equal(again.state, r.state);
  assert.equal(
    run(s, { type: "claim-achievement", id: achievements[6]!.id }).kind,
    "blocked",
  );
});
test("gem energy purchase is atomic and cannot regenerate purchased overflow", () => {
  const s = fresh(now);
  s.gems = 3;
  s.energyAt = now - 9999999;
  const r = run(s, { type: "energy-capacity" });
  assert.equal(energyCap(r.state), 100);
  assert.equal(r.state.stamina, 125);
  assert.equal(r.state.gems, 0);
  assert.equal(r.state.xp, 0);
  const spent = run(r.state, { type: "produce", id: p.id });
  assert.equal(advance(spent.state, now + 119999).stamina, 124);
  assert.equal(advance(spent.state, now + 120000).stamina, 124);
  assert.equal(run(s, { type: "energy-capacity" }).state.gems, 0);
});
test("older schema2 records retain default capacity and power with no reset", () => {
  const s = fresh(now);
  delete s.staminaCapacity;
  delete s.claimedAchievements;
  delete city(s).powers;
  assert(validateSave(s));
  assert.equal(energyCap(s), 100);
  assert.equal(productionPlan(s, p).effective, 1);
  assert(!validateSave({ ...s, staminaCapacity: 99 }));
  city(s).powers = { [p.id]: 5 };
  assert(!validateSave(s));
});

test("order cell highlights distinguish partial, ready and removed requirements", () => {
  const save = fresh(now);
  const order = {
    id: "visual",
    requirements: [
      { item_id: "item1", quantity: 1 },
      { item_id: "item2", quantity: 2 },
    ],
    gold: 1,
    xp: 1,
    titles: [],
  };
  city(save).board[0] = { id: "v1", item: "item1" };
  city(save).board[1] = { id: "v2", item: "item2" };
  let result = orderItemHighlights([order], save);
  assert.deepEqual([...result.partial], ["item1"]);
  assert.equal(result.ready.size, 0);
  city(save).board[2] = { id: "v3", item: "item2" };
  result = orderItemHighlights([order], save);
  assert.deepEqual([...result.ready], ["item1", "item2"]);
  assert.equal(result.partial.size, 0);
  const competing = {
    ...order,
    id: "other",
    requirements: [
      { item_id: "item1", quantity: 1 },
      { item_id: "item2", quantity: 3 },
    ],
  };
  result = orderItemHighlights([competing, order], save);
  assert.equal(result.partial.size, 0);
  assert.equal(result.ready.size, 2);
  city(save).board.fill(null);
  result = orderItemHighlights([order], save);
  assert.equal(result.ready.size + result.partial.size, 0);
});

test("production chooses scattered random cells without row wrapping and fills crowded boards", () => {
  const s = fresh(now),
    board = city(s).board;
  assert.equal(
    productionCell(board, () => 0),
    0,
  );
  assert.equal(
    productionCell(board, () => 0.999),
    62,
  );
  board[6] = { id: "edge", item: a.id };
  const picks = Array.from({ length: 1000 }, (_, i) =>
    productionCell(board, () => i / 1000),
  );
  assert(!picks.includes(5));
  assert(!picks.includes(13));
  assert(picks.includes(7)); // Next row is not the previous row's right neighbour.
  for (let i = 0; i < 63; i++) board[i] = { id: String(i), item: a.id };
  board[12] = null;
  assert.equal(productionCell(board), 12);
  const produced = run(s, { type: "produce", id: p.id });
  assert.equal(produced.kind, "produce");
  assert(city(produced.state).board[12]);
  assert.equal(productionCell(city(produced.state).board), -1);
  assert.equal(
    run(produced.state, { type: "produce", id: p.id }).kind,
    "blocked",
  );
});

test("Belenyaka six-column input keeps the seventh column outside the board", () => {
  assert.equal(hitCell(239, 199, 40, 38, 6), 35);
  assert.equal(hitCell(240, 199, 40, 38, 6), null);
  assert.equal(hitCell(0, 342, 40, 38, 6), null);
});
