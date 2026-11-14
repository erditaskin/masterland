import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advance,
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
import { decodeLegacy } from "../src/game/migrate";
const now = 1700000000000,
  p = producers[0]!,
  a = p.products[0]!,
  b = p.products[1]!;
const run = (s: Save, action: Action, time = now) =>
  transition(s, action, time, () => false);
function twice() {
  let s = fresh(now);
  s = run(s, { type: "produce", id: p.id }).state;
  return run(s, { type: "produce", id: p.id }).state;
}
test("fresh board and first two product areas", () => {
  const s = fresh(now);
  assert.equal(city(s).board.length, 54);
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
  for (const to of [-1, 54, 100, 0])
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
test("locked next product preserves both ingredients", () => {
  let s = twice();
  s = run(s, { type: "move", from: 0, to: 1 }).state;
  s = run(s, { type: "produce", id: p.id }).state;
  s = run(s, { type: "produce", id: p.id }).state;
  s = run(s, { type: "move", from: 0, to: 2 }).state;
  assert.equal(count(s, b.id), 2);
  const r = run(s, { type: "move", from: 1, to: 2 });
  assert.equal(r.kind, "blocked");
  assert.equal(count(r.state, b.id), 2);
});
test("paid slot spends gold, never XP, and is not discovery", () => {
  const s = fresh(now);
  s.xp = 60;
  s.gold = 500;
  const t = p.products[2]!;
  const r = run(s, { type: "unlock", id: t.id });
  assert.equal(r.state.xp, 60);
  assert.equal(r.state.gold, 500 - t.price);
  assert(city(r.state).opened.includes(t.id));
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
  city(s).board = Array.from({ length: 54 }, (_, i) => ({
    id: String(i),
    item: a.id,
  }));
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
  for (let i = 0; i < 30; i++) s = run(s, { type: "produce", id: p.id }).state;
  assert.equal(city(s).batches[p.id]!.remaining, 0);
  assert.equal(run(s, { type: "produce", id: p.id }).kind, "blocked");
  s = advance(s, now + 120000);
  assert.equal(city(s).batches[p.id]!.remaining, 30);
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
  assert.equal(delivered.state.gold, q.gold);
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
  assert(!validateSave({ ...s, stamina: 101 }));
});
test("Swift save migration preserves XP, items, storage, and time base", () => {
  const s = decodeLegacy(
    {
      schema: 1,
      xp: 172,
      gold: 750,
      gems: 12,
      stamina: 86,
      energyAt: now / 1000 - 978307200,
      sound: true,
      reducedMotion: false,
      discoveries: [a.id],
      titles: [],
      mastery: { profession1: 12 },
      cityID: "city1",
      cities: {
        city1: {
          board: [a.id, ...Array(53).fill(null)],
          storage: [b.id],
          storageCapacity: 12,
          owned: [p.id],
          opened: [a.id, b.id],
          batches: {},
          introIndex: 1,
          repeatIndex: 0,
        },
      },
    },
    now,
  );
  assert.equal(s.xp, 172);
  assert.equal(s.energyAt, now);
  assert.equal(city(s).board[0]!.item, a.id);
  assert.equal(city(s).storage[0]!.item, b.id);
  assert.notEqual(city(s).storage[0]!.id, city(s).board[0]!.id);
  assert(validateSave(s));
});
test("corrupt legacy save is rejected instead of reset", () => {
  assert.throws(() => decodeLegacy({ schema: 1 }, now));
});
test("all 54 stationary input cells map correctly", () => {
  for (let i = 0; i < 54; i++)
    assert.equal(
      hitCell(((i % 6) + 0.5) * 51, (Math.floor(i / 6) + 0.5) * 51, 51),
      i,
    );
});
test("no row wrapping or off-board hit", () => {
  for (const [x, y] of [
    [-1, 0],
    [306, 0],
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
