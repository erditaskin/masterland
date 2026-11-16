import { PRE_CLOUD_BACKUP_KEY } from "./localBackup";
export const DELETION_RESET_KEY = "@masterland/account-deletion-reset/v1";
export const GAME_SAVE_KEY = "@masterland/save/v2";
type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
/** Persist the reset intent first. A crash must never resurrect a deleted account's backup. */
export async function eraseDeletedAccountProgress(
  storage: Storage,
  requestID: string,
  removeImports: () => Promise<void>,
) {
  if (!/^[0-9a-f-]{36}$/i.test(requestID))
    throw Error("Invalid deletion receipt");
  await storage.setItem(
    DELETION_RESET_KEY,
    JSON.stringify({ requestID, pending: true }),
  );
  await storage.removeItem(GAME_SAVE_KEY);
  await storage.removeItem(PRE_CLOUD_BACKUP_KEY);
  await removeImports();
  await storage.setItem(
    DELETION_RESET_KEY,
    JSON.stringify({ requestID, pending: false }),
  );
}
export async function resumeDeletionReset(
  storage: Storage,
  removeImports: () => Promise<void>,
) {
  const value = await storage.getItem(DELETION_RESET_KEY);
  if (!value) return false;
  const marker: unknown = JSON.parse(value);
  if (
    !marker ||
    typeof marker !== "object" ||
    !("requestID" in marker) ||
    typeof marker.requestID !== "string" ||
    !("pending" in marker) ||
    typeof marker.pending !== "boolean"
  )
    throw Error("Invalid deletion marker");
  if (marker.pending)
    await eraseDeletedAccountProgress(storage, marker.requestID, removeImports);
  return true;
}
