import * as Crypto from "expo-crypto";
import { accountClient } from "./client";
import { readDeletionReceipt } from "./deletionReceipt";
import { gameStore } from "../state/store";

export const accountDeletionEnabled =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED === "true";

let busy = false;
const listeners = new Set<() => void>();
const setBusy = (value: boolean) => {
  busy = value;
  listeners.forEach((listener) => listener());
};
export const deletionStore = {
  get: () => busy,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export async function deleteCurrentAccount() {
  if (!accountDeletionEnabled || !accountClient || busy)
    throw Error("Deletion unavailable");
  const client = accountClient;
  setBusy(true);
  try {
    const session = await client.getSession();
    if (!session) throw Error("Sign-in required");
    const requestID = Crypto.randomUUID();
    const random = await Crypto.getRandomBytesAsync(32);
    const receipt = Array.from(random, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const result = await client.request("/v1/account/deletion", {
      method: "POST",
      ownerID: session.user.id,
      body: { request_id: requestID, receipt, confirmation: "DELETE" },
    });
    if (!readDeletionReceipt(result, requestID).auth_deleted)
      throw Error("Deletion failed");
    await client.clearLocal();
    const { cloudSync } = await import("./cloudSync");
    await cloudSync.connect(null);
    await gameStore.resetAfterAccountDeletion(requestID);
  } finally {
    setBusy(false);
  }
}
