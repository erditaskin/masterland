/** UX limits only. The server must independently authorize each reward. */
export const energyAdPolicy = Object.freeze({
  energy: 15,
  dailyRewards: 4,
  promotionIntervalMs: 30 * 60 * 1000,
  promotionsPerSession: 2,
});

export type RewardedAdAvailability =
  "ready" | "offline" | "daily-limit" | "loading";
export function energyAdAvailability(input: {
  online: boolean;
  serverRewardsToday: number | null;
  loaded: boolean;
}): RewardedAdAvailability {
  if (!input.online) return "offline";
  if (input.serverRewardsToday === null) return "loading";
  if (input.serverRewardsToday >= energyAdPolicy.dailyRewards)
    return "daily-limit";
  return input.loaded ? "ready" : "loading";
}

/** Promotions never interrupt a merge, reward celebration, or another page. */
export function mayPromoteEnergyAd(input: {
  availability: RewardedAdAvailability;
  now: number;
  lastPromotionAt: number | null;
  sessionPromotions: number;
  boardIdle: boolean;
  pageOpen: boolean;
  rewardOpen: boolean;
}): boolean {
  return (
    input.availability === "ready" &&
    input.boardIdle &&
    !input.pageOpen &&
    !input.rewardOpen &&
    input.sessionPromotions < energyAdPolicy.promotionsPerSession &&
    (input.lastPromotionAt === null ||
      input.now - input.lastPromotionAt >= energyAdPolicy.promotionIntervalMs)
  );
}
