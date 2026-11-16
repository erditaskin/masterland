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
      env: { ...process.env, EXPO_PUBLIC_TEST_MODE: "true" },
      encoding: "utf8",
    },
  );
  assert.match(output, /verified/);
});
