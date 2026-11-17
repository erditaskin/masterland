import * as Crypto from "expo-crypto";
import { accountClient } from "../account/client";
import type { Save } from "../game/engine";
import { readPreparedEnergyAd, readEnergyRedemption } from "./verifiedEnergy";
async function ownerToken(ownerID: string) {
  if (!accountClient) throw Error("Account unavailable");
  const session = await accountClient.auth.getSession();
  if (session.error || session.data.session?.user.id !== ownerID)
    throw Error("Reward account changed");
  return session.data.session.access_token;
}
/** Prepared for SSV acceptance. Live ad loading remains closed in ads/config.ts. */
export async function prepareVerifiedEnergyAd(
  ownerID: string,
  target?: { cityID: string; producerID: string },
) {
  const token = await ownerToken(ownerID);
  const result = await accountClient!
    .rpc(target ? "prepare_producer_ad" : "prepare_energy_ad", {
      request_id: Crypto.randomUUID(),
      ...(target
        ? { city_id: target.cityID, producer_id: target.producerID }
        : {}),
    })
    .setHeader("Authorization", `Bearer ${token}`)
    .abortSignal(AbortSignal.timeout(15000));
  if (result.error) throw result.error;
  return readPreparedEnergyAd(result.data, target ? "producer" : "energy");
}
export async function redeemVerifiedEnergyAd(
  ownerID: string,
  intentID: string,
  save: Save,
  expectedRevision: number,
) {
  if (save.testOnly) throw Error("Test progress cannot receive live rewards");
  const token = await ownerToken(ownerID);
  const result = await accountClient!
    .rpc("redeem_energy_ad", {
      intent_id: intentID,
      expected_revision: expectedRevision,
      save_payload: save,
    })
    .setHeader("Authorization", `Bearer ${token}`)
    .abortSignal(AbortSignal.timeout(15000));
  if (result.error) throw result.error;
  return readEnergyRedemption(result.data, intentID, save, expectedRevision);
}

export async function pendingVerifiedEnergyAds(
  ownerID: string,
): Promise<string[]> {
  const token = await ownerToken(ownerID);
  const result = await accountClient!
    .from("energy_ad_rewards")
    .select("intent_id")
    .eq("user_id", ownerID)
    .is("redeemed_at", null)
    .order("granted_at", { ascending: true })
    .limit(100)
    .setHeader("Authorization", `Bearer ${token}`)
    .abortSignal(AbortSignal.timeout(15000));
  if (result.error) throw result.error;
  return (result.data ?? []).map((row) => {
    if (
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
  const token = await ownerToken(ownerID);
  const result = await accountClient!
    .from("energy_ad_rewards")
    .select("redeemed_at")
    .eq("user_id", ownerID)
    .eq("intent_id", intentID)
    .setHeader("Authorization", `Bearer ${token}`)
    .abortSignal(AbortSignal.timeout(15000))
    .maybeSingle();
  if (result.error) throw result.error;
  return typeof result.data?.redeemed_at === "string";
}
