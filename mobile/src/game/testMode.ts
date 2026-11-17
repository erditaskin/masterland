// Build-time switches are inlined by Expo. Production defaults remain closed.
export const testModeEnabled = process.env.EXPO_PUBLIC_TEST_MODE === "true";
export const testFlightBeta =
  process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL === "testflight";
export const productionRelease =
  process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL === "production";
export const storeKitTestEnabled = testModeEnabled && !testFlightBeta;
