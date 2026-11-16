// Release builds must opt in explicitly; production defaults to disabled.
export const testModeEnabled = process.env.EXPO_PUBLIC_TEST_MODE === "true";
