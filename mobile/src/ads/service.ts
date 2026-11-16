import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { gameStore } from "../state/store";
import { testModeEnabled } from "../game/testMode";
import { resolveAdsConfig } from "./config";
import { EnergyAdController, type AdPhase } from "./controller";

export const adsConfig = resolveAdsConfig({
  enabled: process.env.EXPO_PUBLIC_ADS_ENABLED,
  channel: process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
  testMode: process.env.EXPO_PUBLIC_TEST_MODE,
  rewardedUnit: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_AD_UNIT_ID,
});
type Snapshot = {
  enabled: boolean;
  phase: AdPhase;
  consentBusy: boolean;
  canRequestAds: boolean;
  privacyRequired: boolean;
  error: "consent" | "offline" | "ad" | null;
};
let snapshot: Snapshot = {
  enabled:
    adsConfig.enabled &&
    adsConfig.testAds &&
    testModeEnabled &&
    Platform.OS === "ios",
  phase: "idle",
  consentBusy: false,
  canRequestAds: false,
  privacyRequired: false,
  error: null,
};
const listeners = new Set<() => void>();
function publish(change: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...change };
  listeners.forEach((listener) => listener());
}
// Lazy import keeps the default-disabled path entirely outside the native SDK.
let sdkModule: Promise<typeof import("react-native-google-mobile-ads")> | null =
  null;
function sdk() {
  return (sdkModule ??= import("react-native-google-mobile-ads"));
}
let initialized = false;
let consentRevision = 0;
let consentJob: Promise<void> | null = null;
let loadJob: Promise<void> | null = null;
const controller = new EnergyAdController(
  (phase) =>
    publish({ phase, ...(phase === "error" ? { error: "ad" as const } : {}) }),
  async (receipt) => {
    // This path is deliberately test-only. Live callbacks must use the server ledger.
    if (!snapshot.enabled || !adsConfig.testAds || !testModeEnabled)
      throw Error("Live rewards disabled");
    const result = gameStore.dispatch({ type: "test-ad-reward", receipt });
    if (!result || result.kind === "blocked")
      throw Error("Test reward rejected");
    await gameStore.flush();
  },
);
async function connected() {
  const network = await NetInfo.fetch();
  return network.isConnected === true && network.isInternetReachable !== false;
}
async function updateConsent(privacy = false) {
  if (!snapshot.enabled) return;
  if (consentJob) return consentJob;
  consentJob = (async () => {
    consentRevision++;
    controller.reset();
    publish({ consentBusy: true, canRequestAds: false, error: null });
    try {
      const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } =
        await sdk();
      if (privacy) await AdsConsent.showPrivacyOptionsForm();
      else await AdsConsent.gatherConsent();
      const info = await AdsConsent.getConsentInfo();
      publish({
        canRequestAds: info.canRequestAds,
        privacyRequired:
          info.privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      });
      if (info.canRequestAds && !initialized) {
        await (await sdk()).default().initialize();
        initialized = true;
      }
    } catch {
      // No ad request on a failed update; retry remains available and gameplay continues.
      publish({ error: "consent", canRequestAds: false });
    } finally {
      publish({ consentBusy: false });
    }
  })().finally(() => {
    consentJob = null;
  });
  return consentJob;
}
export const energyAds = {
  get: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  start: () => updateConsent(),
  privacy: () => updateConsent(true),
  load: () => {
    if (loadJob) return loadJob;
    loadJob = (async () => {
      if (
        !snapshot.enabled ||
        snapshot.consentBusy ||
        !snapshot.canRequestAds ||
        !initialized
      )
        return;
      if (["loading", "ready", "showing", "earned"].includes(snapshot.phase))
        return;
      const revision = consentRevision;
      if (!(await connected())) {
        publish({ error: "offline" });
        return;
      }
      if (
        revision !== consentRevision ||
        snapshot.consentBusy ||
        !snapshot.canRequestAds
      )
        return;
      publish({ error: null });
      const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } =
        await sdk();
      controller.load(Crypto.randomUUID(), (events) => {
        const ad = RewardedAd.createForAdRequest(TestIds.REWARDED);
        const unsubscribe = [
          ad.addAdEventListener(RewardedAdEventType.LOADED, events.loaded),
          ad.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            events.earned,
          ),
          ad.addAdEventListener(AdEventType.CLOSED, events.closed),
          ad.addAdEventListener(AdEventType.ERROR, events.failed),
        ];
        return {
          load: () => ad.load(),
          show: () => ad.show(),
          destroy: () => {
            unsubscribe.forEach((remove) => remove());
            ad.destroy();
          },
        };
      });
    })()
      .catch(() => publish({ error: "ad" }))
      .finally(() => {
        loadJob = null;
      });
    return loadJob;
  },
  show: async () => {
    if (!snapshot.canRequestAds || snapshot.consentBusy || !snapshot.enabled)
      return false;
    if (!(await connected())) {
      publish({ error: "offline" });
      return false;
    }
    const day = new Date().toISOString().slice(0, 10);
    const rewards = gameStore.get().save.testAdRewards;
    if (rewards?.day === day && rewards.receipts.length >= 4) return false;
    return controller.show();
  },
};
