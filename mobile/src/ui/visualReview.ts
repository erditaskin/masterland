/** A theme-only inspection never unlocks a city or mutates the selected save. */
export function visualReviewCity(
  url: string | null | undefined,
  testMode: boolean,
  channel: string | undefined,
): string | null {
  if (!testMode || channel !== "local" || !url) return null;
  return (
    /^masterland:\/\/city-theme-review\/(city[1-5])$/.exec(url)?.[1] ?? null
  );
}
