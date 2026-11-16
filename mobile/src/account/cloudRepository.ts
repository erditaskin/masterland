import { accountClient } from "./client";
import { readCloudRow, readWriteResult } from "./cloudProtocol";
import { validateSave, type Save } from "../game/engine";
/** Deliberately not called by local-save persistence until account conflict handling is installed. */
export async function fetchCloudSave(userID: string) {
  if (!accountClient) throw Error("Cloud is not configured");
  const { data, error } = await accountClient
    .from("game_saves")
    .select("user_id,schema_version,revision,payload,updated_at")
    .eq("user_id", userID)
    .maybeSingle();
  if (error) throw error;
  return data === null ? null : readCloudRow(data, userID);
}
export async function writeCloudSave(
  save: Save,
  expectedRevision: number,
  requestID: string,
  source: "normal" | "review" | "qa" | "milestone",
) {
  if (!accountClient) throw Error("Cloud is not configured");
  if (
    source !== "normal" ||
    !validateSave(save) ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      requestID,
    )
  )
    throw Error("Invalid cloud snapshot");
  const { data, error } = await accountClient.rpc("write_game_save", {
    expected_revision: expectedRevision,
    request_id: requestID,
    save_payload: save,
    save_schema_version: 1,
  });
  if (error) throw error;
  return readWriteResult(data);
}
