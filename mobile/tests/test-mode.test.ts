import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("test build refills without reducing overflow and credits each StoreKit transaction once", () => {
  const script = `
 import assert from 'node:assert/strict';
 import { fresh,transition } from './src/game/engine.ts';
 const now=1700000000000;let s=fresh(now);s.stamina=4;
 const act=(a)=>{const r=transition(s,a,now,()=>false);s=r.state;return r;};
 assert.equal(act({type:'test-energy-fill'}).kind,'tap');assert.equal(s.stamina,100);
 s.stamina=130;act({type:'test-energy-fill'});assert.equal(s.stamina,130);
 const a={type:'storekit-credit',sku:'com.erditaskin.masterland.gems30',transaction:'local-verified-1'};
 assert.equal(act(a).kind,'reward');assert.equal(s.gems,30);
 assert.equal(act(a).kind,'blocked');assert.equal(s.gems,30);
 assert.equal(s.rewardQueue.length,1);console.log('verified');`;
  const output = execFileSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", script],
    {
      env: {
        ...process.env,
        EXPO_PUBLIC_TEST_MODE: "true",
        EXPO_PUBLIC_DISTRIBUTION_CHANNEL: "local",
      },
      encoding: "utf8",
    },
  );
  assert.match(output, /verified/);
});

test("TestFlight retains energy refill but rejects every StoreKit credit", () => {
  const script = `
    import assert from 'node:assert/strict';
    import { fresh,transition } from './src/game/engine.ts';
    import { storeKitTestEnabled,testFlightBeta } from './src/game/testMode.ts';
    assert.equal(testFlightBeta,true);assert.equal(storeKitTestEnabled,false);
    const now=1700000000000;const s=fresh(now);s.stamina=7;
    const refill=transition(s,{type:'test-energy-fill'},now);assert.equal(refill.state.stamina,100);
    const credit=transition(refill.state,{type:'storekit-credit',sku:'com.erditaskin.masterland.gems30',transaction:'testflight-forged'},now);
    assert.equal(credit.kind,'blocked');assert.equal(credit.state.gems,0);assert.equal(credit.state.gold,0);assert.equal(credit.state.transactions.length,0);
    console.log('beta-verified');`;
  const output = execFileSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", script],
    {
      env: {
        ...process.env,
        EXPO_PUBLIC_TEST_MODE: "true",
        EXPO_PUBLIC_DISTRIBUTION_CHANNEL: "testflight",
      },
      encoding: "utf8",
    },
  );
  assert.match(output, /beta-verified/);
});
