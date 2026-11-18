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

export function presentationReview(
  url: string | null | undefined,
  testMode: boolean,
  channel: string | undefined,
): string | null {
  if (!testMode || channel !== "local" || !url) return null;
  return (
    /^masterland:\/\/presentation-review\/(board|collection|collection-chain|storage|storage-board-full|market|item|cities|account-guest|account-registered|account-deletion|cloud-choice|energy|producer-cooldown|orders|order-guide|achievements|achievement)$/.exec(
      url,
    )?.[1] ?? null
  );
}
