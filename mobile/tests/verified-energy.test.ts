import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh } from "../src/game/engine";
import {
  readPreparedEnergyAd,
  readEnergyRedemption,
} from "../src/ads/verifiedEnergy";
const id = "00000000-0000-4000-8000-000000000001";
test("ad intent requires server-authorized amount, receipt and daily quota", () => {
  assert.equal(
    readPreparedEnergyAd({ kind: "ready", intent_id: id, used: 0, amount: 25 })
      .kind,
    "ready",
  );
  assert.equal(
    readPreparedEnergyAd({ kind: "daily_limit", used: 4 }).kind,
    "daily_limit",
  );
  for (const value of [
    { kind: "ready", intent_id: id, used: 0, amount: 15 },
    { kind: "ready", intent_id: id, used: 4, amount: 25 },
    { kind: "ready", intent_id: "bad", used: 0, amount: 25 },
  ])
    assert.throws(() => readPreparedEnergyAd(value));
});
test("only an exact server reward delta is accepted; JSONB key ordering is irrelevant", () => {
  const before = fresh(100);
  const payload = { ...before, stamina: 125, transactions: [`ad:${id}`] };
  const reversed = Object.fromEntries(Object.entries(payload).reverse());
  const response = {
    kind: "redeemed",
    amount: 25,
    revision: 2,
    payload: reversed,
  };
  assert.equal(readEnergyRedemption(response, id, before, 1).kind, "redeemed");
  assert.throws(() =>
    readEnergyRedemption(
      { ...response, payload: { ...payload, gold: 1000 } },
      id,
      before,
      1,
    ),
  );
  assert.throws(() =>
    readEnergyRedemption({ ...response, revision: 3 }, id, before, 1),
  );
  assert.throws(() =>
    readEnergyRedemption(
      { ...response, payload: { ...payload, testOnly: true } },
      id,
      before,
      1,
    ),
  );
});
test("pending, conflict and already-redeemed responses never contain a new credit", () => {
  const before = fresh(100);
  for (const kind of ["already_redeemed", "conflict"] as const)
    assert.deepEqual(
      readEnergyRedemption({ kind, revision: 3 }, id, before, 1),
      { kind, revision: 3 },
    );
  assert.deepEqual(readEnergyRedemption({ kind: "pending" }, id, before, 1), {
    kind: "pending",
  });
});

test("producer redemption resets only the owned producer and never credits energy", () => {
  const before = fresh(100),
    producer = before.cities.city1!.owned[0]!;
  before.cities.city1!.batches[producer] = {
    remaining: 0,
    readyAt: 9999999999999,
  };
  const payload = structuredClone(before);
  payload.cities.city1!.batches[producer] = { remaining: 80, readyAt: 0 };
  payload.transactions = [`ad:${id}`];
  const response = {
    kind: "redeemed",
    reward_kind: "producer",
    amount: 1,
    revision: 2,
    city_id: "city1",
    producer_id: producer,
    payload,
  };
  assert.equal(readEnergyRedemption(response, id, before, 1).kind, "redeemed");
  assert.throws(() =>
    readEnergyRedemption(
      { ...response, payload: { ...payload, stamina: 125 } },
      id,
      before,
      1,
    ),
  );
  assert.throws(() =>
    readEnergyRedemption({ ...response, producer_id: "other" }, id, before, 1),
  );
  assert.throws(() =>
    readEnergyRedemption({ ...response, amount: 25 }, id, before, 1),
  );
  assert.equal(
    readPreparedEnergyAd(
      { kind: "ready", amount: 1, used: 0, intent_id: id },
      "producer",
    ).kind,
    "ready",
  );
  assert.throws(() =>
    readPreparedEnergyAd(
      { kind: "ready", amount: 1, used: 0, intent_id: id },
      "energy",
    ),
  );
});
