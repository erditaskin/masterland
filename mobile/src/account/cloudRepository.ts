import { accountClient } from "./client";
import { readCloudRow, readWriteResult } from "./cloudProtocol";
import { validateSave, type Save } from "../game/engine";
/** Reads only the requested owner; RLS enforces the authenticated account boundary. */
export async function fetchCloudSave(userID: string) {
  if (!accountClient) throw Error("Cloud is not configured");
  const { data, error } = await accountClient
    .from("game_saves")
    .select("user_id,schema_version,revision,payload,updated_at")
    .eq("user_id", userID)
    .abortSignal(AbortSignal.timeout(15000))
    .maybeSingle();
  if (error) throw error;
  return data === null ? null : readCloudRow(data, userID);
}
export async function writeCloudSave(
  ownerID: string,
  save: Save,
  expectedRevision: number,
  requestID: string,
  source: "normal" | "review" | "qa" | "milestone",
) {
  if (!accountClient) throw Error("Cloud is not configured");
  if (
    source !== "normal" ||
    save.testOnly === true ||
    !validateSave(save) ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      requestID,
    )
  )
    throw Error("Invalid cloud snapshot");
  const session = await accountClient.auth.getSession();
  if (session.error || session.data.session?.user.id !== ownerID)
    throw Error("Cloud account changed");
  // Pin the owner's token: an account switch while the request is waiting must not write into the next account.
  const accessToken = session.data.session.access_token;
  const { data, error } = await accountClient
    .rpc("write_game_save", {
      expected_revision: expectedRevision,
      request_id: requestID,
      save_payload: save,
      save_schema_version: 1,
    })
    .setHeader("Authorization", `Bearer ${accessToken}`)
    .abortSignal(AbortSignal.timeout(15000));
  if (error) throw error;
  return readWriteResult(data);
}
