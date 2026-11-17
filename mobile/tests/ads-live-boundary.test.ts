import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { EnergyAdController } from "../src/ads/controller";
const owner = "00000000-0000-4000-8000-000000000001";
const intent = "00000000-0000-4000-8000-000000000002";
function fixture(options: { consent?: boolean; verified?: boolean } = {}) {
  let user: { id: string } | null = { id: owner };
  let verified = options.verified ?? true,
    redeemed = false,
    credits = 0,
    shows = 0;
  const accountListeners = new Set<() => void>(),
    cloudListeners = new Set<() => void>();
  const events = new Map<string, () => void>();
  let request: { unit: string; options: any } | null = null;
  const sdk = {
    __esModule: true,
    default: () => ({ initialize: async () => {} }),
    AdsConsent: {
      gatherConsent: async () => {},
      getConsentInfo: async () => ({
        canRequestAds: options.consent !== false,
        privacyOptionsRequirementStatus: "none",
      }),
    },
    AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: "required" },
    RewardedAdEventType: { LOADED: "loaded", EARNED_REWARD: "earned" },
    AdEventType: { CLOSED: "closed", ERROR: "error" },
    TestIds: { REWARDED: "test-unit" },
    RewardedAd: {
      createForAdRequest: (unit: string, options: any) => {
        request = { unit, options };
        return {
          addAdEventListener: (event: string, callback: () => void) => {
            events.set(event, callback);
            return () => {
              events.delete(event);
            };
          },
          load: () => events.get("loaded")?.(),
          show: async () => {
            shows++;
          },
          destroy: () => {},
        };
      },
    },
  };
  const modules: Record<string, unknown> = {
    "../account/auth": {
      accountStore: {
        get: () => ({ user }),
        subscribe: (listener: () => void) => {
          accountListeners.add(listener);
          return () => accountListeners.delete(listener);
        },
      },
    },
    "../account/cloudSync": {
      cloudSync: {
        get: () => ({ phase: "synced", ownerID: user?.id }),
        subscribe: (listener: () => void) => {
          cloudListeners.add(listener);
          return () => cloudListeners.delete(listener);
        },
        redeem: async () => {
          if (verified && !redeemed) {
            redeemed = true;
            credits++;
          }
        },
      },
    },
    "./verifiedEnergyRepository": {
      prepareVerifiedEnergyAd: async () => ({
        kind: "ready",
        intentID: intent,
        used: 0,
        amount: 25,
      }),
      pendingVerifiedEnergyAds: async () =>
        verified && !redeemed ? [intent] : [],
      verifiedIntentWasRedeemed: async () => redeemed,
    },
    "@react-native-community/netinfo": {
      __esModule: true,
      default: {
        fetch: async () => ({ isConnected: true, isInternetReachable: true }),
        addEventListener: () => () => {},
      },
    },
    "expo-crypto": { randomUUID: () => intent },
    "react-native": {
      Platform: { OS: "ios" },
      AppState: { addEventListener: () => ({ remove() {} }) },
    },
    "../state/store": {
      gameStore: {
        get: () => ({ save: {} }),
        dispatch: () => {
          throw Error("Live SDK callback cannot self-credit");
        },
      },
    },
    "../game/testMode": { testModeEnabled: false },
    "./config": {
      resolveAdsConfig: () => ({
        enabled: true,
        testAds: false,
        productionRewardsEnabled: true,
        rewardedUnit: "live-unit",
      }),
    },
    "./controller": { EnergyAdController },
    "react-native-google-mobile-ads": sdk,
  };
  const code = ts.transpileModule(
    readFileSync(new URL("../src/ads/service.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exported: Record<string, any> = {};
  new Function("require", "exports", code)((id: string) => {
    assert(id in modules, id);
    return modules[id];
  }, exported);
  return {
    service: exported.energyAds,
    request: () => request,
    credits: () => credits,
    shows: () => shows,
    event: (event: string) => events.get(event)?.(),
    verified: () => {
      verified = true;
      cloudListeners.forEach((listener) => listener());
    },
    signOut: () => {
      user = null;
      accountListeners.forEach((listener) => listener());
    },
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));
test("live ad carries the authenticated intent; an earned event without SSV cannot self-credit", async () => {
  const f = fixture({ verified: false });
  await f.service.start();
  assert.equal(await f.service.watch(), true);
  assert.deepEqual(f.request(), {
    unit: "live-unit",
    options: {
      serverSideVerificationOptions: { userId: owner, customData: intent },
    },
  });
  f.event("earned");
  f.event("closed");
  await settle();
  assert.equal(f.credits(), 0);
  assert.equal(f.service.get().rewardPending, true);
  f.verified();
  await settle();
  await settle();
  assert.equal(f.credits(), 1);
  await new Promise((resolve) => setTimeout(resolve, 2100));
  assert.equal(f.service.get().rewardPending, false);
  assert.equal(f.credits(), 1);
});
test("closing an ad without earning grants nothing", async () => {
  const f = fixture({ verified: false });
  await f.service.start();
  await f.service.watch();
  f.event("closed");
  await settle();
  assert.equal(f.credits(), 0);
  assert.equal(f.service.get().rewardPending, false);
});
test("consent refusal prevents loading and showing immediately", async () => {
  const f = fixture({ consent: false, verified: false });
  await f.service.start();
  assert.equal(await f.service.watch(), false);
  assert.equal(f.request(), null);
  assert.equal(f.shows(), 0);
  assert.equal(f.credits(), 0);
});
test("sign-out invalidates a loaded live ad and cooldown ads stay blocked without their server contract", async () => {
  const f = fixture({ verified: false });
  await f.service.start();
  await f.service.load();
  f.signOut();
  assert.equal(await f.service.watch(), false);
  assert.equal(f.shows(), 0);
  assert.equal(f.credits(), 0);
  const cooldown = fixture({ verified: false });
  await cooldown.service.start();
  assert.equal(
    await cooldown.service.watch({ cityID: "city1", producerID: "producer1" }),
    false,
  );
  assert.equal(cooldown.request(), null);
});
