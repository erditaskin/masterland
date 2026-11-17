import { validateSave, type Save } from "../game/engine";
const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export type PreparedEnergyAd =
  | { kind: "daily_limit"; used: number }
  | { kind: "ready"; intentID: string; used: number; amount: 1 | 25 };
export function readPreparedEnergyAd(
  value: unknown,
  kind: "energy" | "producer" = "energy",
): PreparedEnergyAd {
  if (!value || typeof value !== "object") throw Error("Invalid ad intent");
  const row = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(row.used) ||
    Number(row.used) < 0 ||
    Number(row.used) > 4
  )
    throw Error("Invalid daily allowance");
  if (row.kind === "daily_limit" && row.used === 4)
    return { kind: "daily_limit", used: 4 };
  if (
    row.kind !== "ready" ||
    !uuid(row.intent_id) ||
    row.amount !== (kind === "producer" ? 1 : 25) ||
    Number(row.used) >= 4
  )
    throw Error("Ad reward is not ready");
  return {
    kind: "ready",
    intentID: row.intent_id,
    used: Number(row.used),
    amount: row.amount as 1 | 25,
  };
}
export type EnergyRedemption =
  | { kind: "pending" }
  | { kind: "already_redeemed" | "conflict"; revision: number }
  | { kind: "redeemed"; revision: number; amount: 1 | 15 | 25; payload: Save };
/** An SDK earned callback alone is never evidence of a payable reward. */
export function readEnergyRedemption(
  value: unknown,
  intentID: string,
  before: Save,
  expectedRevision: number,
): EnergyRedemption {
  if (!uuid(intentID) || !value || typeof value !== "object")
    throw Error("Invalid redemption");
  const row = value as Record<string, unknown>;
  if (row.kind === "pending") return { kind: "pending" };
  if (!Number.isSafeInteger(row.revision) || Number(row.revision) < 0)
    throw Error("Invalid reward revision");
  if (row.kind === "already_redeemed" || row.kind === "conflict")
    return { kind: row.kind, revision: Number(row.revision) };
  if (
    row.kind !== "redeemed" ||
    (row.amount !== 1 && row.amount !== 15 && row.amount !== 25) ||
    row.revision !== expectedRevision + 1 ||
    !validateSave(row.payload) ||
    row.payload.testOnly
  )
    throw Error("Unverified reward payload");
  const expected: Save = {
    ...before,
    transactions: [...(before.transactions ?? []), `ad:${intentID}`],
  };
  if (row.reward_kind === "producer") {
    const cityID = row.city_id,
      producerID = row.producer_id;
    if (
      row.amount !== 1 ||
      typeof cityID !== "string" ||
      typeof producerID !== "string" ||
      !before.cities[cityID]?.owned.includes(producerID)
    )
      throw Error("Invalid producer reward target");
    const city = before.cities[cityID]!;
    expected.cities = {
      ...before.cities,
      [cityID]: {
        ...city,
        batches: {
          ...city.batches,
          [producerID]: { remaining: 80, readyAt: 0 },
        },
      },
    };
  } else {
    if (row.amount === 1) throw Error("Invalid energy reward amount");
    expected.stamina = before.stamina + row.amount;
  }
  if (JSON.stringify(row.payload) !== JSON.stringify(expected)) {
    // JSON object key order is not significant across PostgreSQL JSONB responses.
    const ordered = (v: unknown): unknown =>
      Array.isArray(v)
        ? v.map(ordered)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, entry]) => [k, ordered(entry)]),
            )
          : v;
    if (
      JSON.stringify(ordered(row.payload)) !== JSON.stringify(ordered(expected))
    )
      throw Error("Reward snapshot changed unrelated progress");
  }
  return {
    kind: "redeemed",
    revision: Number(row.revision),
    amount: row.amount,
    payload: row.payload,
  };
}
