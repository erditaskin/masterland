export const NORMAL_SAVE_KEY = "@masterland/save/v2";
export const CONTROLLED_SAVE_KEY = "@masterland/save/controlled-testflight/v1";
export function resolveSaveNamespace(input: {
  channel?: string;
  testMode?: string;
  controlled?: string;
}) {
  const controlled =
    input.controlled === "true" &&
    input.channel === "testflight" &&
    input.testMode !== "true";
  return {
    controlled,
    key: controlled ? CONTROLLED_SAVE_KEY : NORMAL_SAVE_KEY,
  };
}
