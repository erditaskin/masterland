import { validateSave, type Save } from "../game/engine";
import { NORMAL_SAVE_KEY, CONTROLLED_SAVE_KEY } from "../state/saveNamespace";
import { createCloudOutbox } from "./cloudOutbox";
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export interface CloudBinding {
  ownerID: string;
  uploadedHash: string | null;
}
const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function cloudKeys(namespace: string) {
  if (![NORMAL_SAVE_KEY, CONTROLLED_SAVE_KEY].includes(namespace))
    throw Error("Invalid save namespace");
  return {
    binding: `@masterland/cloud-binding/${namespace}`,
    adoption: `@masterland/cloud-adoption/${namespace}`,
    outbox: (owner: string) => {
      if (!uuid(owner)) throw Error("Invalid owner");
      return `@masterland/cloud-outbox/${namespace}/${owner}`;
    },
    backup: (owner: string | null) => {
      if (owner !== null && !uuid(owner)) throw Error("Invalid owner");
      return `@masterland/cloud-choice-backup/${namespace}/${owner ?? "guest"}`;
    },
  };
}
export async function readCloudBinding(
  storage: Storage,
  namespace: string,
): Promise<CloudBinding | null> {
  const raw = await storage.getItem(cloudKeys(namespace).binding);
  if (!raw) return null;
  const value = JSON.parse(raw) as CloudBinding;
  if (
    !value ||
    !uuid(value.ownerID) ||
    (value.uploadedHash !== null && !/^[0-9a-f]{64}$/.test(value.uploadedHash))
  )
    throw Error("Invalid cloud binding");
  return value;
}
export async function recordCloudAdoption(
  storage: Storage,
  namespace: string,
  choice: { ownerID: string; revision: number; payload: Save; previous: Save },
) {
  const keys = cloudKeys(namespace);
  if (
    !uuid(choice.ownerID) ||
    !Number.isSafeInteger(choice.revision) ||
    choice.revision < 1 ||
    !validateSave(choice.payload) ||
    choice.payload.testOnly === true ||
    !validateSave(choice.previous)
  )
    throw Error("Invalid cloud choice");
  if (await storage.getItem(keys.adoption))
    throw Error("Cloud choice already pending");
  const binding = await readCloudBinding(storage, namespace);
  await storage.setItem(
    keys.adoption,
    JSON.stringify({ ...choice, previousOwner: binding?.ownerID ?? null }),
  );
}
/** Replays only an explicit saved choice; never downloads or decides between accounts. */
export async function resumeCloudAdoption(
  storage: Storage,
  namespace: string,
  newID: () => string,
) {
  const keys = cloudKeys(namespace),
    raw = await storage.getItem(keys.adoption);
  if (!raw) return false;
  const choice = JSON.parse(raw);
  if (
    !choice ||
    !uuid(choice.ownerID) ||
    !Number.isSafeInteger(choice.revision) ||
    choice.revision < 1 ||
    !validateSave(choice.payload) ||
    choice.payload.testOnly === true ||
    !validateSave(choice.previous) ||
    (choice.previousOwner !== null && !uuid(choice.previousOwner))
  )
    throw Error("Invalid pending cloud choice");
  await storage.setItem(
    keys.backup(choice.previousOwner),
    JSON.stringify(choice.previous),
  );
  const queue = createCloudOutbox({
    storage,
    key: keys.outbox(choice.ownerID),
    ownerID: choice.ownerID,
    newID,
    write: async () => {
      throw Error("Network is forbidden during local recovery");
    },
  });
  await queue.resolve(choice.revision);
  await storage.setItem(namespace, JSON.stringify(choice.payload));
  await storage.setItem(
    keys.binding,
    JSON.stringify({ ownerID: choice.ownerID, uploadedHash: null }),
  );
  await storage.removeItem(keys.adoption);
  return true;
}
