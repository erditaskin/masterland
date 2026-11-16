import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { verifyAdmobCallback } from "../_shared/admobSignature.ts";
let cached: { until: number; fetchedAt: number; keys: Map<string, string> } | null = null;
async function verifierKeys(keyID: string) {
  if (
    cached &&
    cached.until > Date.now() &&
    (cached.keys.has(keyID) || Date.now() - cached.fetchedAt < 60000)
  )
    return cached.keys;
  const result = await fetch(
    "https://www.gstatic.com/admob/reward/verifier-keys.json",
    { signal: AbortSignal.timeout(5000) },
  );
  if (!result.ok) throw Error("Key service unavailable");
  const body = await result.json();
  const keys = new Map<string, string>();
  for (const key of body.keys ?? [])
    if (Number.isSafeInteger(key.keyId) && typeof key.pem === "string")
      keys.set(String(key.keyId), key.pem);
  if (!keys.size) throw Error("No verification keys");
  cached = { until: Date.now() + 3600000, fetchedAt: Date.now(), keys };
  return keys;
}
Deno.serve(async (request) => {
  if (request.method !== "GET")
    return new Response("Method not allowed", { status: 405 });
  if (Deno.env.get("ADMOB_SSV_ENABLED") !== "true")
    return new Response("Not enabled", { status: 503 });
  let reward;
  try {
    reward = verifyAdmobCallback(
      request.url,
      await verifierKeys(new URL(request.url).searchParams.get("key_id") ?? ""),
      Deno.env.get("ADMOB_REWARDED_UNIT_ID") ?? "",
      Date.now(),
    );
  } catch {
    return new Response("Callback not verified", { status: 400 });
  }
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await admin.rpc("record_energy_ssv", {
    owner_id: reward.userID,
    intent_id: reward.intentID,
    transaction_id: reward.transactionID,
    event_time: new Date(reward.timestamp).toISOString(),
  });
  // Non-200 on infrastructure failure permits AdMob retries. Duplicate callbacks return success from the RPC.
  return new Response(error ? "Reward pending" : "OK", {
    status: error ? 503 : 200,
  });
});
