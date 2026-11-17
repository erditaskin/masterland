import * as Crypto from "expo-crypto";
import { accountClient } from "../account/client";
import type { Save } from "../game/engine";
import { readPreparedEnergyAd, readEnergyRedemption } from "./verifiedEnergy";
/** Prepared for SSV acceptance. Live ad loading remains closed in ads/config.ts. */
export async function prepareVerifiedEnergyAd(
  ownerID: string,
  target?: { cityID: string; producerID: string },
) {
  if (!accountClient) throw Error("Account unavailable");
  const data = await accountClient.request("/v1/rewards/prepare", {
    method: "POST",
    ownerID,
    body: {
      request_id: Crypto.randomUUID(),
      ...(target
        ? { target: { city_id: target.cityID, producer_id: target.producerID } }
        : {}),
    },
  });
  return readPreparedEnergyAd(data, target ? "producer" : "energy");
}
export async function redeemVerifiedEnergyAd(
  ownerID: string,
  intentID: string,
  save: Save,
  expectedRevision: number,
) {
  if (!accountClient || save.testOnly)
    throw Error("Test progress cannot receive live rewards");
  const data = await accountClient.request("/v1/rewards/redeem", {
    method: "POST",
    ownerID,
    body: {
      intent_id: intentID,
      expected_revision: expectedRevision,
      save_payload: save,
    },
  });
  return readEnergyRedemption(data, intentID, save, expectedRevision);
}
export async function pendingVerifiedEnergyAds(
  ownerID: string,
): Promise<string[]> {
  if (!accountClient) throw Error("Account unavailable");
  const data = await accountClient.request("/v1/rewards/pending", { ownerID });
  if (!Array.isArray(data)) throw Error("Invalid pending rewards");
  return data.map((row: unknown) => {
    if (
      !row ||
      typeof row !== "object" ||
      !("intent_id" in row) ||
      typeof row.intent_id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(row.intent_id)
    )
      throw Error("Invalid pending reward");
    return row.intent_id;
  });
}
export async function verifiedIntentWasRedeemed(
  ownerID: string,
  intentID: string,
): Promise<boolean> {
  if (!accountClient || !/^[0-9a-f-]{36}$/i.test(intentID))
    throw Error("Account unavailable");
  const data = await accountClient.request(`/v1/rewards/${intentID}`, {
    ownerID,
  });
  if (
    !data ||
    typeof data !== "object" ||
    !("redeemed" in data) ||
    typeof data.redeemed !== "boolean"
  )
    throw Error("Invalid reward receipt");
  return data.redeemed;
}
