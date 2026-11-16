export function resolveAdsConfig(input: {
  enabled?: string;
  channel?: string;
  testMode?: string;
  rewardedUnit?: string;
}) {
  // Test inventory is mandatory outside an explicitly non-test production build.
  const testAds = input.channel !== "production" || input.testMode === "true";
  const unitValid = /^ca-app-pub-\d+\/\d+$/.test(input.rewardedUnit ?? "");
  return {
    enabled: input.enabled === "true" && (testAds || unitValid),
    testAds,
    rewardedUnit: testAds ? null : input.rewardedUnit!,
    // Production rewards stay closed until SSV and the authoritative ledger pass acceptance.
    productionRewardsEnabled: false as const,
  };
}
