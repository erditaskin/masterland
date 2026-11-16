import test from "node:test";
import assert from "node:assert/strict";
import {
  energyAdAvailability,
  mayPromoteEnergyAd,
  energyAdPolicy,
} from "../src/ads/policy";

test("rewarded energy requires online server quota and a loaded ad", () => {
  assert.equal(
    energyAdAvailability({
      online: false,
      serverRewardsToday: 0,
      loaded: true,
    }),
    "offline",
  );
  assert.equal(
    energyAdAvailability({
      online: true,
      serverRewardsToday: null,
      loaded: true,
    }),
    "loading",
  );
  assert.equal(
    energyAdAvailability({ online: true, serverRewardsToday: 4, loaded: true }),
    "daily-limit",
  );
  assert.equal(
    energyAdAvailability({ online: true, serverRewardsToday: 3, loaded: true }),
    "ready",
  );
  assert.equal(energyAdPolicy.energy, 15);
});
test("promotion cooldown and session budget do not interrupt gameplay", () => {
  const base = {
    availability: "ready" as const,
    now: 1800000,
    lastPromotionAt: 0,
    sessionPromotions: 1,
    boardIdle: true,
    pageOpen: false,
    rewardOpen: false,
  };
  assert.equal(mayPromoteEnergyAd(base), true);
  for (const change of [
    { now: 1799999 },
    { sessionPromotions: 2 },
    { boardIdle: false },
    { pageOpen: true },
    { rewardOpen: true },
    { availability: "daily-limit" as const },
  ]) {
    assert.equal(mayPromoteEnergyAd({ ...base, ...change }), false);
  }
});
