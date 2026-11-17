import { accountStore } from "../account/auth";
import { cloudSync } from "../account/cloudSync";
import {
  prepareVerifiedEnergyAd,
  pendingVerifiedEnergyAds,
  verifiedIntentWasRedeemed,
} from "./verifiedEnergyRepository";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { AppState, Platform } from "react-native";
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
  dailyUsed: number;
  rewardPending: boolean;
  needsAccount: boolean;
  error: "consent" | "offline" | "ad" | null;
};
let snapshot: Snapshot = {
  enabled:
    adsConfig.enabled &&
    (adsConfig.testAds || adsConfig.productionRewardsEnabled) &&
    Platform.OS === "ios",
  dailyUsed: 0,
  rewardPending: false,
  needsAccount: !adsConfig.testAds && !accountStore.get().user,
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
let rewardTarget: { producerID: string; cityID: string } | undefined;
let watchJob: Promise<boolean> | null = null;
let initialized = false;
let consentRevision = 0;
let consentJob: Promise<void> | null = null;
let loadJob: Promise<void> | null = null;
let liveIntent: {
  ownerID: string;
  intentID: string;
  preparedAt: number;
} | null = null;
let recovering: Promise<void> | null = null;
let awaitingIntent: string | null = null;
let checkedOwner: string | null = null;
let liveRecoveryStarted = false;
async function recoverVerifiedRewards(expectedIntent?: string) {
  expectedIntent ??= awaitingIntent ?? undefined;
  if (adsConfig.testAds || !adsConfig.productionRewardsEnabled || recovering)
    return recovering;
  const owner = accountStore.get().user?.id;
  if (
    !owner ||
    cloudSync.get().ownerID !== owner ||
    cloudSync.get().phase !== "synced"
  )
    return;
  recovering = (async () => {
    const pending = await pendingVerifiedEnergyAds(owner);
    for (const intentID of pending) {
      if (accountStore.get().user?.id !== owner) return;
      await cloudSync.redeem(intentID);
      if (cloudSync.get().phase !== "synced") break;
    }
    if (accountStore.get().user?.id === owner)
      publish({
        rewardPending:
          (await pendingVerifiedEnergyAds(owner)).length > 0 ||
          (Boolean(expectedIntent) &&
            !(await verifiedIntentWasRedeemed(owner, expectedIntent!))),
      });
  })()
    .catch(() => {
      if (accountStore.get().user?.id === owner)
        publish({ rewardPending: true });
    })
    .finally(() => {
      recovering = null;
    });
  return recovering;
}
let observedOwner: string | null = null;
accountStore.subscribe(() => {
  if (adsConfig.testAds) return;
  const owner = accountStore.get().user?.id ?? null;
  if (owner !== observedOwner) {
    observedOwner = owner;
    liveIntent = null;
    awaitingIntent = null;
    checkedOwner = null;
    consentRevision++;
    controller.reset();
    publish({ dailyUsed: 0, rewardPending: false, needsAccount: !owner });
  }
});
cloudSync.subscribe(() => {
  const cloud = cloudSync.get();
  if (
    cloud.phase === "synced" &&
    cloud.ownerID &&
    (snapshot.rewardPending || checkedOwner !== cloud.ownerID)
  ) {
    checkedOwner = cloud.ownerID;
    void recoverVerifiedRewards();
  }
});
const controller = new EnergyAdController(
  (phase) =>
    publish({ phase, ...(phase === "error" ? { error: "ad" as const } : {}) }),
  async (receipt) => {
    if (!snapshot.enabled) throw Error("Rewards disabled");
    if (!adsConfig.testAds) {
      const intent = liveIntent;
      if (
        !adsConfig.productionRewardsEnabled ||
        !intent ||
        accountStore.get().user?.id !== intent.ownerID
      )
        throw Error("Reward account changed");
      awaitingIntent = intent.intentID;
      publish({ rewardPending: true });
      // The server ledger survives app termination. A late callback is recovered on the next active session.
      for (let attempt = 0; attempt < 8; attempt++) {
        if (accountStore.get().user?.id !== intent.ownerID) return;
        await recoverVerifiedRewards(intent.intentID);
        if (await verifiedIntentWasRedeemed(intent.ownerID, intent.intentID)) {
          awaitingIntent = null;
          publish({
            rewardPending: false,
            dailyUsed: Math.min(4, snapshot.dailyUsed + 1),
          });
          return;
        }
        publish({ rewardPending: true });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return;
    }
    // Controlled acceptance can preview test creatives without modifying a live-account balance.
    if (!testModeEnabled) return;
    const result = gameStore.dispatch({
      type: "test-ad-reward",
      ...rewardTarget,
      receipt,
    });
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
  start: async () => {
    if (
      !adsConfig.testAds &&
      adsConfig.productionRewardsEnabled &&
      !liveRecoveryStarted
    ) {
      liveRecoveryStarted = true;
      AppState.addEventListener("change", (state) => {
        if (state === "active") void recoverVerifiedRewards();
      });
      NetInfo.addEventListener((network) => {
        if (network.isConnected && network.isInternetReachable !== false)
          void recoverVerifiedRewards();
      });
    }
    await updateConsent();
    await recoverVerifiedRewards();
  },
  privacy: () => updateConsent(true),
  load: () => {
    if (loadJob) return loadJob;
    loadJob = (async () => {
      if (
        !snapshot.enabled ||
        (!adsConfig.testAds && snapshot.rewardPending) ||
        snapshot.consentBusy ||
        !snapshot.canRequestAds ||
        !initialized
      )
        return;
      if (["loading", "ready", "showing", "earned"].includes(snapshot.phase))
        return;
      const revision = consentRevision;
      if (!adsConfig.testAds) {
        const owner = accountStore.get().user?.id;
        if (
          !owner ||
          cloudSync.get().ownerID !== owner ||
          cloudSync.get().phase !== "synced"
        ) {
          publish({ needsAccount: !owner, error: "ad" });
          return;
        }
        const intent = await prepareVerifiedEnergyAd(owner);
        publish({ dailyUsed: intent.used });
        if (
          intent.kind !== "ready" ||
          revision !== consentRevision ||
          accountStore.get().user?.id !== owner
        )
          return;
        liveIntent = {
          ownerID: owner,
          intentID: intent.intentID,
          preparedAt: Date.now(),
        };
      }
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
        const ad = RewardedAd.createForAdRequest(
          adsConfig.testAds ? TestIds.REWARDED : adsConfig.rewardedUnit!,
          !adsConfig.testAds && liveIntent
            ? {
                serverSideVerificationOptions: {
                  userId: liveIntent.ownerID,
                  customData: liveIntent.intentID,
                },
              }
            : undefined,
        );
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
  watch: (target?: { producerID: string; cityID: string }) => {
    if (watchJob) return watchJob;
    watchJob = (async () => {
      if (["showing", "earned"].includes(snapshot.phase) || !snapshot.enabled)
        return false;
      // Cooldown reward targets require their own server contract; never show an unpayable live ad.
      if (!adsConfig.testAds && (target || snapshot.rewardPending))
        return false;
      if (
        !adsConfig.testAds &&
        liveIntent &&
        Date.now() - liveIntent.preparedAt > 20 * 60 * 1000
      )
        controller.reset();
      if (!snapshot.canRequestAds) await updateConsent();
      if (!snapshot.canRequestAds) return false;
      await energyAds.load();
      if (!adsConfig.testAds && snapshot.dailyUsed >= 4) return false;
      if (snapshot.phase !== "ready")
        await new Promise<void>((resolve, reject) => {
          const stop = () => {
            clearTimeout(timer);
            listeners.delete(check);
          };
          const check = () => {
            if (snapshot.phase === "ready") {
              stop();
              resolve();
            } else if (snapshot.error || snapshot.phase === "error") {
              stop();
              reject(Error("Ad unavailable"));
            }
          };
          const timer = setTimeout(() => {
            stop();
            reject(Error("Ad timeout"));
          }, 20000);
          listeners.add(check);
          check();
        });
      if (snapshot.phase !== "ready") return false;
      rewardTarget = target;
      return await energyAds.show();
    })()
      .catch(() => {
        publish({ error: "ad" });
        return false;
      })
      .finally(() => {
        watchJob = null;
      });
    return watchJob;
  },
  show: async () => {
    if (!snapshot.canRequestAds || snapshot.consentBusy || !snapshot.enabled)
      return false;
    if (!(await connected())) {
      publish({ error: "offline" });
      return false;
    }
    if (
      !adsConfig.testAds &&
      (!liveIntent ||
        accountStore.get().user?.id !== liveIntent.ownerID ||
        snapshot.dailyUsed >= 4)
    )
      return false;
    const day = new Date().toISOString().slice(0, 10);
    const rewards = gameStore.get().save.testAdRewards;
    if (testModeEnabled && rewards?.day === day && rewards.receipts.length >= 4)
      return false;
    return controller.show();
  },
};
