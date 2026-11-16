import { validateSave } from "../game/engine";

export const PRE_CLOUD_BACKUP_KEY = "@masterland/pre-cloud-backup/v1";

type LocalStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

/** Keep the original normal save before any cloud-account migration can touch it. */
export async function preservePreCloudSave(
  storage: LocalStorage,
  serialized: string,
): Promise<void> {
  if (!validateSave(JSON.parse(serialized)))
    throw new Error("Yedeklenecek kayıt doğrulanamadı.");
  if ((await storage.getItem(PRE_CLOUD_BACKUP_KEY)) !== null) return;
  await storage.setItem(PRE_CLOUD_BACKUP_KEY, serialized);
}
