import { test } from "node:test";
import assert from "node:assert/strict";
import { presentationFixture } from "../src/game/presentationFixture";
import { city, level, validateSave } from "../src/game/engine";

test("presentation data is a valid isolated save with 54 cells and unique storage identities", () => {
  const fixture = presentationFixture(1794996000000),
    c = city(fixture);
  assert(validateSave(fixture));
  assert.equal(level(fixture), 12);
  assert.equal(fixture.discoveries.length, 18);
  assert.equal(c.board.length, 54);
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
