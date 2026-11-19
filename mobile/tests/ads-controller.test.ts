import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { EnergyAdController, type RewardedEvents } from "../src/ads/controller";
import { resolveAdsConfig } from "../src/ads/config";

test("every non-production build uses test inventory; live rewards remain closed", () => {
  for (const channel of [undefined, "local", "testflight"]) {
    assert.equal(
      resolveAdsConfig({
        enabled: "true",
        channel,
        rewardedUnit: "ca-app-pub-1/2",
      }).testAds,
      true,
    );
  }
  assert.equal(
    resolveAdsConfig({
      enabled: "true",
      channel: "production",
      testMode: "true",
    }).testAds,
    true,
  );
  assert.equal(
    resolveAdsConfig({
      enabled: "true",
      channel: "production",
      rewardedUnit: "bad",
    }).enabled,
    false,
  );
  assert.equal(
    resolveAdsConfig({
      enabled: "true",
      channel: "production",
      rewardedUnit: "ca-app-pub-1/2",
    }).productionRewardsEnabled,
    false,
  );
});
function fixture() {
  let events!: RewardedEvents;
  let shows = 0,
    destroyed = 0;
  const receipts: string[] = [];
  const controller = new EnergyAdController(
    () => {},
    async (receipt) => {
      receipts.push(receipt);
    },
  );
  const load = (id: string) =>
    controller.load(id, (callbacks) => {
      events = callbacks;
      return {
        load() {},
        async show() {
          shows++;
        },
        destroy() {
          destroyed++;
        },
      };
    });
  return {
    controller,
    load,
    get events() {
      return events;
    },
    receipts,
    get shows() {
      return shows;
    },
    get destroyed() {
      return destroyed;
    },
  };
}
test("close/error never credit; earned credits exactly once after explicit show", async () => {
  const f = fixture();
  f.load("one");
  f.events.earned();
  assert.deepEqual(f.receipts, []);
  await f.controller.show();
  assert.equal(f.shows, 0);
  f.events.loaded();
  await Promise.all([f.controller.show(), f.controller.show()]);
  assert.equal(f.shows, 1);
  f.events.closed();
  f.events.earned();
  assert.deepEqual(f.receipts, []);
  f.load("two");
  f.events.loaded();
  await f.controller.show();
  f.events.earned();
  f.events.earned();
  f.events.closed();
  assert.deepEqual(f.receipts, ["two"]);
  f.load("three");
  f.events.failed();
  assert.equal(await f.controller.show(), false);
  assert.deepEqual(f.receipts, ["two"]);
});
test("stale SDK callbacks cannot alter a replacement ad", () => {
  const f = fixture();
  f.load("one");
  const old = f.events;
  f.load("two");
  old.loaded();
  old.earned();
  old.failed();
  assert.equal(f.controller.getPhase(), "loading");
  assert.deepEqual(f.receipts, []);
  assert.equal(f.destroyed, 1);
});
test("test earned receipts persist quota, ignore duplicates and reset on next UTC day", () => {
  const script = `
    import assert from 'node:assert/strict';
    import {fresh,transition,validateSave} from './src/game/engine.ts';
    const now=1700000000000;let s=fresh(now);s.stamina=100;
    const act=(id,time=now)=>{const r=transition(s,{type:'test-ad-reward',receipt:id},time);s=r.state;return r;};
    const id=(n)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
    act(id(1));assert.equal(s.stamina,125);assert.equal(s.testOnly,true);act(id(1));assert.equal(s.stamina,125);
    for(let n=2;n<=4;n++)act(id(n));assert.equal(s.stamina,200);
    assert.equal(act(id(5)).kind,'blocked');assert.equal(s.stamina,200);
    s=JSON.parse(JSON.stringify(s));assert.equal(validateSave(s),true);
    assert.equal(act(id(6)).kind,'blocked');act(id(7),now+86400000);assert.equal(s.testAdRewards.receipts.length,1);
    s.testAdRewards.receipts.push('bad');assert.equal(validateSave(s),false);
  `;
  execFileSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", script],
    {
      cwd: process.cwd(),
      env: { ...process.env, EXPO_PUBLIC_TEST_MODE: "true" },
    },
  );
});
test("all five local city rewards preserve energy on producer refill and share quota", () => {
  const script = `
    import assert from 'node:assert/strict';
    import {city,cityProducers,transition,productionBatchSize} from './src/game/engine.ts';
    import {presentationFixture} from './src/game/presentationFixture.ts';
    const now=1794996000000;
    for (const view of ['board','badinca','yalikoru','demirdere','ipekyolu']) {
      const save=presentationFixture(now,false,view);
      const producer=cityProducers(save)[0];
      city(save).batches[producer.id]={remaining:0,readyAt:now+120000};
      const reward=transition(save,{type:'test-ad-reward',cityID:save.cityID,producerID:producer.id,receipt:'00000000-0000-4000-8000-000000000001'},now);
      assert.equal(reward.kind,'reward',view);
      assert.equal(reward.state.stamina,save.stamina);
      assert.equal(city(reward.state).batches[producer.id].remaining,productionBatchSize);
      const energy=transition(reward.state,{type:'test-ad-reward',receipt:'00000000-0000-4000-8000-000000000002'},now);
      assert.equal(energy.state.stamina,save.stamina+25);
      assert.equal(energy.state.testAdRewards.receipts.length,2);
      assert.equal(energy.state.testOnly,true);
    }
  `;
  execFileSync(process.execPath, ["--import","tsx","--input-type=module","-e",script], {
    env: { ...process.env, EXPO_PUBLIC_TEST_MODE: "true" },
  });
});

test("production rejects client-side test ad credit", () => {
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `
    import assert from 'node:assert/strict';import {fresh,transition} from './src/game/engine.ts';
    const s=fresh(Date.now());const r=transition(s,{type:'test-ad-reward',receipt:'00000000-0000-4000-8000-000000000001'},Date.now());
    assert.equal(r.kind,'blocked');assert.equal(r.state.stamina,s.stamina);assert.equal(r.state.testAdRewards,undefined);
  `,
    ],
    { env: { ...process.env, EXPO_PUBLIC_TEST_MODE: "false" } },
  );
});

test("verified rewards require explicit production or controlled acceptance and never test progress", () => {
  const base = {
    enabled: "true",
    verifiedRewards: "true",
    rewardedUnit: "ca-app-pub-1/2",
  };
  assert.equal(
    resolveAdsConfig({ ...base, channel: "local" }).productionRewardsEnabled,
    false,
  );
  assert.equal(
    resolveAdsConfig({ ...base, channel: "testflight" })
      .productionRewardsEnabled,
    false,
  );
  assert.equal(
    resolveAdsConfig({ ...base, channel: "testflight", controlled: "true" })
      .productionRewardsEnabled,
    true,
  );
  assert.equal(
    resolveAdsConfig({ ...base, channel: "testflight", controlled: "true" })
      .testAds,
    false,
  );
  assert.equal(
    resolveAdsConfig({ ...base, channel: "production", testMode: "true" })
      .productionRewardsEnabled,
    false,
  );
  assert.equal(
    resolveAdsConfig({ ...base, channel: "production" })
      .productionRewardsEnabled,
    true,
  );
});
