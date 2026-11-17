export function resolveAdsConfig(input: {
  enabled?: string;
  channel?: string;
  testMode?: string;
  controlled?: string;
  verifiedRewards?: string;
  testDeviceIDs?: string;
  rewardedUnit?: string;
  producerRewardedUnit?: string;
}) {
  // Test inventory is mandatory outside an explicitly non-test production build.
  const verifiedRewards =
    input.verifiedRewards === "true" &&
    input.testMode !== "true" &&
    (input.channel === "production" ||
      (input.channel === "testflight" && input.controlled === "true"));
  // Controlled SSV acceptance uses our own units on registered Google test devices.
  const testAds =
    !verifiedRewards &&
    (input.channel !== "production" || input.testMode === "true");
  const unitValid = /^ca-app-pub-\d+\/\d+$/.test(input.rewardedUnit ?? "");
  return {
    enabled: input.enabled === "true" && (testAds || unitValid),
    testAds,
    rewardedUnit: testAds ? null : input.rewardedUnit!,
    producerRewardedUnit: /^ca-app-pub-\d+\/\d+$/.test(
      input.producerRewardedUnit ?? "",
    )
      ? input.producerRewardedUnit!
      : null,
    // Production rewards stay closed until SSV and the authoritative ledger pass acceptance.
    productionRewardsEnabled: verifiedRewards && unitValid,
    testDeviceIDs: [
      "EMULATOR",
      ...(input.testDeviceIDs ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter((id) => /^[a-f0-9]{32}$/i.test(id)),
    ],
  };
}
