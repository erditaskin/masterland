import { accountStore } from "../account/auth";
import { cloudSync } from "../account/cloudSync";
import {
  prepareVerifiedEnergyAd,
  cancelVerifiedEnergyAd,
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
  controlled: process.env.EXPO_PUBLIC_CONTROLLED_ACCEPTANCE,
  verifiedRewards: process.env.EXPO_PUBLIC_VERIFIED_REWARDS_ENABLED,
  testDeviceIDs: process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS,
  rewardedUnit: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_AD_UNIT_ID,
  producerRewardedUnit:
    process.env.EXPO_PUBLIC_ADMOB_IOS_PRODUCER_REWARDED_AD_UNIT_ID,
});
export type RewardedAdFailure = "consent" | "offline" | "no-fill" | "ad" | "cloud" | "account";
type Snapshot = {
  enabled: boolean;
  phase: AdPhase;
  consentBusy: boolean;
  requesting: boolean;
  canRequestAds: boolean;
  privacyRequired: boolean;
  dailyUsed: number;
  rewardPending: boolean;
  rewardOutcome: "preview" | "granted" | "verified" | null;
  needsAccount: boolean;
  error: RewardedAdFailure | null;
};
let snapshot: Snapshot = {
  enabled:
    adsConfig.enabled &&
    (adsConfig.testAds || adsConfig.productionRewardsEnabled) &&
    Platform.OS === "ios",
  dailyUsed: 0,
  rewardPending: false,
  rewardOutcome: null,
  needsAccount: !adsConfig.testAds && !accountStore.get().user,
  phase: "idle",
  consentBusy: false,
  requesting: false,
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
  target?: { cityID: string; producerID: string };
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
          cloudSync.get().phase !== "synced" ||
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
  (phase) => {
    const previous = snapshot.phase;
    if (
      !adsConfig.testAds &&
      liveIntent &&
      ((phase === "closed" && previous === "showing") || phase === "error")
    ) {
      const cancelled = liveIntent;
      liveIntent = null;
      // Best effort when offline; the server reservation also expires automatically.
      void cancelVerifiedEnergyAd(cancelled.ownerID, cancelled.intentID).catch(
        () => {},
      );
    }
    publish({ phase, ...(phase === "error" ? { error: snapshot.error ?? "ad" } : {}) });
  },
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
        if (
          cloudSync.get().phase === "synced" &&
          cloudSync.get().ownerID === intent.ownerID &&
          (await verifiedIntentWasRedeemed(intent.ownerID, intent.intentID)) &&
          accountStore.get().user?.id === intent.ownerID &&
          cloudSync.get().ownerID === intent.ownerID &&
          cloudSync.get().phase === "synced"
        ) {
          awaitingIntent = null;
          publish({
            rewardPending: false,
            rewardOutcome: "verified",
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
    if (!testModeEnabled) {
      publish({ rewardOutcome: "preview" });
      return;
    }
    const result = gameStore.dispatch({
      type: "test-ad-reward",
      ...rewardTarget,
      receipt,
    });
    if (!result || result.kind === "blocked")
      throw Error("Test reward rejected");
    await gameStore.flush();
    publish({ rewardOutcome: "granted" });
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
      if (privacy) {
        const refreshed = await AdsConsent.requestInfoUpdate();
        if (refreshed.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED)
          await AdsConsent.showPrivacyOptionsForm();
      } else {
        await AdsConsent.gatherConsent();
      }
      const info = await AdsConsent.getConsentInfo();
      publish({
        canRequestAds: info.canRequestAds,
        privacyRequired:
          info.privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      });
      if (info.canRequestAds && !initialized) {
        await (await sdk()).default().setRequestConfiguration({
          testDeviceIdentifiers: adsConfig.testDeviceIDs,
        });
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
        if (
          state === "background" &&
          liveIntent &&
          !snapshot.rewardPending &&
          ["loading", "ready", "showing"].includes(snapshot.phase)
        ) {
          // Keep the intent binding: a valid late earned callback must still be redeemable.
          void cancelVerifiedEnergyAd(
            liveIntent.ownerID,
            liveIntent.intentID,
          ).catch(() => {});
        }
      });
      NetInfo.addEventListener((network) => {
        if (network.isConnected && network.isInternetReachable !== false)
          void recoverVerifiedRewards();
      });
    }
    if (!snapshot.canRequestAds) await updateConsent();
    await recoverVerifiedRewards();
  },
  refreshConsent: () => updateConsent(),
  privacy: () => updateConsent(true),
  load: (target?: { cityID: string; producerID: string }) => {
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
        if (target && !adsConfig.producerRewardedUnit) return;
        await cloudSync.sync();
        if (cloudSync.get().phase !== "synced") return;
        const intent = await prepareVerifiedEnergyAd(owner, target);
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
          target,
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
          adsConfig.testAds
            ? TestIds.REWARDED
            : target
              ? adsConfig.producerRewardedUnit!
              : adsConfig.rewardedUnit!,
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
          ad.addAdEventListener(AdEventType.ERROR, (error) => {
            const code = error?.reason ?? error?.code?.split("/").at(-1);
            if (code === "no-fill" || code === "mediation-no-fill")
              publish({ error: "no-fill" });
            else if (code === "network-error")
              publish({ error: "offline" });
            events.failed();
          }),
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
      if (
        !adsConfig.testAds &&
        (snapshot.rewardPending || (target && !adsConfig.producerRewardedUnit))
      )
        return false;
      if (
        !adsConfig.testAds &&
        JSON.stringify(liveIntent?.target) !== JSON.stringify(target)
      )
        controller.reset();
      if (
        !adsConfig.testAds &&
        liveIntent &&
        Date.now() - liveIntent.preparedAt >= 14 * 60 * 1000
      )
        controller.reset();
      publish({ requesting: true, error: null });
      if (!(await connected())) {
        publish({ error: "offline" });
        return false;
      }
      if (!snapshot.canRequestAds) await updateConsent();
      if (!snapshot.canRequestAds) {
        publish({ error: "consent" });
        return false;
      }
      if (!adsConfig.testAds) {
        if (!(await accountStore.ensureGuest())) {
          publish({ error: "account" });
          return false;
        }
        const owner = accountStore.get().user?.id;
        if (!owner) {
          publish({ error: "account" });
          return false;
        }
        if (cloudSync.get().ownerID !== owner) await cloudSync.connect(owner);
        else if (cloudSync.get().phase !== "synced") await cloudSync.retry();
        if (cloudSync.get().phase !== "synced") {
          publish({ error: "cloud" });
          return false;
        }
      }
      await energyAds.load(target);
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
      publish({ rewardOutcome: null });
      rewardTarget = target;
      return await energyAds.show();
    })()
      .catch(() => {
        if (!snapshot.error) publish({ error: "ad" });
        return false;
      })
      .finally(() => {
        watchJob = null;
        publish({ requesting: false });
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
