import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("test build refills without reducing overflow and credits each StoreKit transaction once", () => {
  const script = `
 import assert from 'node:assert/strict';
 import { fresh,transition,level,levelRange } from './src/game/engine.ts';
 const now=1700000000000;let s=fresh(now);s.stamina=4;
 const act=(a)=>{const r=transition(s,a,now,()=>false);s=r.state;return r;};
 assert.equal(act({type:'test-energy-fill'}).kind,'tap');assert.equal(s.stamina,100);
 s.stamina=130;act({type:'test-energy-fill'});assert.equal(s.stamina,130);
 const a={type:'storekit-credit',sku:'com.erditaskin.masterland.gems30',transaction:'local-verified-1'};
 assert.equal(act(a).kind,'reward');assert.equal(s.gems,30);
 assert.equal(act(a).kind,'blocked');assert.equal(s.gems,30);
 assert.equal(s.rewardQueue.length,1);
 const xp=s.xp, notices=s.rewardQueue.length;
 act({type:'test-gold-add'});act({type:'test-gold-add'});assert.equal(s.gold,20000);
 act({type:'test-gems-add'});act({type:'test-gems-add'});assert.equal(s.gems,230);
 assert.equal(s.xp,xp);assert.equal(s.rewardQueue.length,notices);for (let i=0;i<15;i++) {
   const before=level(s), next=levelRange(s)[1];
   act({type:'test-level-up'});assert.equal(level(s),before+1);assert.equal(s.xp,next);
 }
 assert.equal(s.gold,20000);assert.equal(s.gems,230);
 console.log('verified');`;
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
    const gold=transition(refill.state,{type:'test-gold-add'},now).state;
    const gems=transition(gold,{type:'test-gems-add'},now).state;
    assert.equal(gems.gold,10000);assert.equal(gems.gems,100);
    const leveled=transition(gems,{type:'test-level-up'},now).state;assert.equal(leveled.xp,20);
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
