import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { EnergyAdController } from "../src/ads/controller";
const owner = "00000000-0000-4000-8000-000000000001";
const intent = "00000000-0000-4000-8000-000000000002";
function fixture(
  options: {
    consent?: boolean;
    privacyRequired?: boolean;
    verified?: boolean;
    producerUnit?: boolean;
    testAds?: boolean;
    testMode?: boolean;
    flush?: () => Promise<void>;
    localSyncFailure?: boolean;
    loadError?: { code: string };
  } = {},
) {
  let user: { id: string } | null = { id: owner };
  let cloudPhase = "synced";
  let verified = options.verified ?? true,
    redeemed = false,
    credits = 0,
    shows = 0,
    cancellations = 0,
    consentRefreshes = 0,
    privacyForms = 0;
  const accountListeners = new Set<() => void>(),
    cloudListeners = new Set<() => void>();
  const events = new Map<string, (error?: { code: string }) => void>();
  let appStateChanged: ((state: string) => void) | undefined;
  let request: { unit: string; options: any } | null = null;
  const sdk = {
    __esModule: true,
    default: () => ({
      initialize: async () => {},
      setRequestConfiguration: async () => {},
    }),
    AdsConsent: {
      gatherConsent: async () => { consentRefreshes++; },
      requestInfoUpdate: async () => {
        consentRefreshes++;
        return { privacyOptionsRequirementStatus: options.privacyRequired ? "required" : "none" };
      },
      showPrivacyOptionsForm: async () => { privacyForms++; },
      getConsentInfo: async () => ({
        canRequestAds: options.consent !== false,
        privacyOptionsRequirementStatus: options.privacyRequired ? "required" : "none",
      }),
    },
    AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: "required" },
    RewardedAdEventType: { LOADED: "loaded", EARNED_REWARD: "earned" },
    AdEventType: { CLOSED: "closed", ERROR: "error" },
    TestIds: { REWARDED: "test-unit" },
    RewardedAd: {
      createForAdRequest: (unit: string, requestOptions: any) => {
        request = { unit, options: requestOptions };
        return {
          addAdEventListener: (event: string, callback: (error?: { code: string }) => void) => {
            events.set(event, callback);
            return () => {
              events.delete(event);
            };
          },
          load: () => {
            if (options.loadError) events.get("error")?.(options.loadError);
            else events.get("loaded")?.();
          },
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
        ensureGuest: async () => !!user,
        get: () => ({ user }),
        subscribe: (listener: () => void) => {
          accountListeners.add(listener);
          return () => accountListeners.delete(listener);
        },
      },
    },
    "../account/cloudSync": {
      cloudSync: {
        get: () => ({ phase: cloudPhase, ownerID: user?.id }),
        subscribe: (listener: () => void) => {
          cloudListeners.add(listener);
          return () => cloudListeners.delete(listener);
        },
        connect: async () => {
          throw Error("Already synced owner must not reconnect");
        },
        retry: async () => {},
        sync: async () => {},
        redeem: async () => {
          if (verified && !redeemed) {
            redeemed = true;
            credits++;
            if (options.localSyncFailure) cloudPhase = "pending";
          }
        },
      },
    },
    "./verifiedEnergyRepository": {
      cancelVerifiedEnergyAd: async () => {
        cancellations++;
      },
      prepareVerifiedEnergyAd: async (_: string, target?: unknown) => ({
        kind: "ready",
        intentID: intent,
        used: 0,
        amount: target ? 1 : 25,
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
      AppState: {
        addEventListener: (_: string, listener: (state: string) => void) => {
          appStateChanged = listener;
          return { remove() {} };
        },
      },
    },
    "../state/store": {
      gameStore: {
        get: () => ({ save: {} }),
        dispatch: () => {
          if (!options.testAds || !options.testMode)
            throw Error("Live SDK callback cannot self-credit");
          credits++;
          return { kind: "reward" };
        },
        flush: options.flush ?? (async () => {}),
      },
    },
    "../game/testMode": { testModeEnabled: options.testMode ?? false },
    "./config": {
      resolveAdsConfig: () => ({
        enabled: true,
        testAds: options.testAds ?? false,
        productionRewardsEnabled: true,
        rewardedUnit: "live-unit",
        producerRewardedUnit: options.producerUnit ? "producer-unit" : null,
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
    cancellations: () => cancellations,
    consentRefreshes: () => consentRefreshes,
    privacyForms: () => privacyForms,
    background: () => appStateChanged?.("background"),
    event: (event: string) => events.get(event)?.(),
    resync: () => {
      cloudPhase = "synced";
      cloudListeners.forEach((listener) => listener());
    },
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
test("manual privacy refresh checks consent even when ads are already permitted", async () => {
  const f = fixture({ verified: false });
  await f.service.start();
  assert.equal(f.service.get().canRequestAds, true);
  await f.service.refreshConsent();
  assert.equal(f.consentRefreshes(), 2);
  assert.equal(f.privacyForms(), 0);
});
test("the privacy action opens the native form when choices are required", async () => {
  const f = fixture({ privacyRequired: true, verified: false });
  await f.service.start();
  assert.equal(f.service.get().privacyRequired, true);
  await f.service.privacy();
  assert.equal(f.privacyForms(), 1);
});
test("privacy status refresh skips the native form when it is not required", async () => {
  const f = fixture({ privacyRequired: false, verified: false });
  await f.service.start();
  await f.service.privacy();
  assert.equal(f.privacyForms(), 0);
  assert.equal(f.service.get().privacyRequired, false);
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

test("a configured cooldown ad uses its own unit with a producer intent", async () => {
  const f = fixture({ verified: false, producerUnit: true });
  await f.service.start();
  assert.equal(
    await f.service.watch({ cityID: "city1", producerID: "producer1" }),
    true,
  );
  assert.equal(f.request()?.unit, "producer-unit");
  assert.equal(
    f.request()?.options.serverSideVerificationOptions.customData,
    intent,
  );
  f.event("closed");
  assert.equal(f.credits(), 0);
});

test("controlled preview reports no reward and cannot change the balance", async () => {
  const f = fixture({ testAds: true });
  await f.service.start();
  await f.service.watch();
  f.event("earned");
  f.event("closed");
  await settle();
  assert.equal(f.request()?.unit, "test-unit");
  assert.equal(f.credits(), 0);
  assert.equal(f.service.get().rewardOutcome, "preview");
});
test("test mode applies exactly one reward after an earned event", async () => {
  const f = fixture({ testAds: true, testMode: true });
  await f.service.start();
  await f.service.watch();
  f.event("earned");
  f.event("earned");
  f.event("closed");
  await settle();
  assert.equal(f.credits(), 1);
  assert.equal(f.service.get().rewardOutcome, "granted");
});

test("test reward success waits for durable storage and storage failure is visible", async () => {
  let finish!: () => void;
  const f = fixture({
    testAds: true,
    testMode: true,
    flush: () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  });
  await f.service.start();
  await f.service.watch();
  f.event("earned");
  f.event("closed");
  await settle();
  assert.equal(f.service.get().rewardOutcome, null);
  finish();
  await settle();
  assert.equal(f.service.get().rewardOutcome, "granted");
  const failed = fixture({
    testAds: true,
    testMode: true,
    flush: async () => {
      throw Error("Disk unavailable");
    },
  });
  await failed.service.start();
  await failed.service.watch();
  failed.event("earned");
  failed.event("closed");
  await settle();
  assert.equal(failed.service.get().rewardOutcome, null);
  assert.equal(failed.service.get().error, "ad");
});

test("closing without earning cancels one reservation, while an earned close never cancels", async () => {
  const cancelled = fixture({ verified: false });
  await cancelled.service.start();
  await cancelled.service.watch();
  cancelled.event("closed");
  cancelled.event("closed");
  await settle();
  assert.equal(cancelled.cancellations(), 1);
  assert.equal(cancelled.credits(), 0);
  const earned = fixture({ verified: false });
  await earned.service.start();
  await earned.service.watch();
  earned.event("earned");
  earned.event("closed");
  await settle();
  earned.verified();
  await settle();
  await settle();
  assert.equal(earned.cancellations(), 0);
  assert.equal(earned.credits(), 1);
});

test("a server receipt cannot announce success before the local cloud save is durable", async () => {
  const f = fixture({ verified: false, localSyncFailure: true });
  await f.service.start();
  await f.service.watch();
  f.event("earned");
  f.event("closed");
  await settle();
  f.verified();
  await settle();
  await settle();
  assert.equal(f.credits(), 1);
  assert.equal(f.service.get().rewardPending, true);
  assert.equal(f.service.get().rewardOutcome, null);
  f.resync();
  await settle();
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 2100));
  assert.equal(f.service.get().rewardPending, false);
  assert.equal(f.service.get().rewardOutcome, "verified");
  assert.equal(f.credits(), 1);
});

test("backgrounding before completion frees quota without losing a later verified earned reward", async () => {
  const f = fixture({ verified: false });
  await f.service.start();
  await f.service.watch();
  f.background();
  await settle();
  assert.equal(f.cancellations(), 1);
  assert.equal(f.credits(), 0);
  f.event("earned");
  f.event("closed");
  await settle();
  f.verified();
  await settle();
  await settle();
  assert.equal(f.credits(), 1);
  assert.equal(f.cancellations(), 1);
});


test("no-fill remains visible and releases the live reservation without using allowance", async () => {
  const f = fixture({ verified: false, loadError: { code: "googleMobileAds/no-fill" } });
  await f.service.start();
  assert.equal(await f.service.watch(), false);
  assert.equal(f.service.get().error, "no-fill");
  assert.equal(f.service.get().requesting, false);
  assert.equal(f.service.get().dailyUsed, 0);
  assert.equal(f.shows(), 0);
  assert.equal(f.cancellations(), 1);
});
