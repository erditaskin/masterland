import { accountClient } from "./client";
import { readCloudRow, readWriteResult } from "./cloudProtocol";
import { validateSave, type Save } from "../game/engine";
/** Reads only the requested owner; the verified API session enforces the account boundary. */
export async function fetchCloudSave(userID: string) {
  if (!accountClient) throw Error("Cloud is not configured");
  const data = await accountClient.request("/v1/save", { ownerID: userID });
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
  // Pin the owner's token: an account switch while the request is waiting must not write into the next account.
  const data = await accountClient.request("/v1/save", {
    method: "PUT",
    ownerID,
    body: {
      expected_revision: expectedRevision,
      request_id: requestID,
      save_payload: save,
    },
  });
  return readWriteResult(data);
}
