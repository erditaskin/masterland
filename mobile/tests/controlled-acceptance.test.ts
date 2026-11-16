import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveSaveNamespace,
  NORMAL_SAVE_KEY,
  CONTROLLED_SAVE_KEY,
} from "../src/state/saveNamespace";
import { resolveAdsConfig } from "../src/ads/config";
test("controlled TestFlight acceptance uses a separate save without enabling debug mode", () => {
  const input = {
    channel: "testflight",
    testMode: "false",
    controlled: "true",
  };
  assert.equal(resolveSaveNamespace(input).key, CONTROLLED_SAVE_KEY);
  assert.equal(
    resolveSaveNamespace({ ...input, testMode: "true" }).key,
    NORMAL_SAVE_KEY,
  );
  assert.equal(
    resolveSaveNamespace({ ...input, channel: "production" }).key,
    NORMAL_SAVE_KEY,
  );
  assert.equal(
    resolveSaveNamespace({ channel: "testflight", testMode: "false" }).key,
    NORMAL_SAVE_KEY,
  );
  const ads = resolveAdsConfig({
    ...input,
    enabled: "true",
    rewardedUnit: "ca-app-pub-2972187520207492/2927598891",
  });
  assert.equal(ads.enabled, true);
  assert.equal(ads.testAds, true);
  assert.equal(ads.rewardedUnit, null);
  assert.equal(ads.productionRewardsEnabled, false);
});
