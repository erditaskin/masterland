import { consumeAppleDeletionProof } from "./auth";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { accountClient, accountConfig } from "./client";
import { createSecureSessionStorage } from "./secureStorage";
import { gameStore } from "../state/store";
import { resolveSaveNamespace } from "../state/saveNamespace";
import {
  readDeletionJournal,
  readDeletionReceipt,
  reconcileDeletion,
  type DeletionJournal,
} from "./deletionJournal";
export const accountDeletionEnabled =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED === "true";
const namespace = resolveSaveNamespace({
  channel: process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
  testMode: process.env.EXPO_PUBLIC_TEST_MODE,
  controlled: process.env.EXPO_PUBLIC_CONTROLLED_ACCEPTANCE,
}).key;
const storage = createSecureSessionStorage(SecureStore, Crypto.randomUUID);
const journalKey = `masterland.deletion.${accountConfig.environment}`;
type Snapshot = {
  phase: "idle" | "checking" | "offline" | "reauthenticate";
  hasJournal: boolean;
};
let snapshot: Snapshot = { phase: "idle", hasJournal: false };
const listeners = new Set<() => void>();
const publish = (change: Snapshot) => {
  snapshot = change;
  listeners.forEach((listener) => listener());
};
let active: Promise<unknown> | null = null;
async function readJournal() {
  const raw = await storage.getItem(journalKey);
  return raw ? readDeletionJournal(raw) : null;
}
async function status(journal: DeletionJournal) {
  const result = await fetch(
    `${accountConfig.url}/functions/v1/delete-account`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: accountConfig.key,
      },
      body: JSON.stringify({
        action: "status",
        request_id: journal.requestID,
        receipt: journal.receipt,
      }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (result.status === 404) return null;
  if (!result.ok) throw Error("Deletion status unavailable");
  return readDeletionReceipt(await result.json(), journal.requestID);
}
async function finish(requestID: string) {
  try {
    await accountClient?.auth.signOut({ scope: "local" });
  } finally {
    // Drain the old owner's network work before erasing its local queues and backups.
    const { cloudSync } = await import("./cloudSync");
    await cloudSync.connect(null);
    await gameStore.resetAfterAccountDeletion(requestID);
  }
}
async function recover() {
  if (!accountClient) return;
  try {
    const journal = await readJournal();
    if (!journal) {
      publish({ phase: "idle", hasJournal: false });
      return;
    }
    publish({ phase: "checking", hasJournal: true });
    if (journal.namespace !== namespace)
      throw Error("Deletion belongs to another build");
    const result = await reconcileDeletion(journal, {
      status,
      reset: finish,
      clear: () => storage.removeItem(journalKey),
    });
    publish({
      phase: result === "completed" ? "idle" : "reauthenticate",
      hasJournal: result !== "completed",
    });
  } catch {
    publish({ phase: "offline", hasJournal: true });
  }
}
export const deletionStore = {
  get: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  recover: () => {
    if (active) return active;
    active = recover().finally(() => {
      active = null;
    });
    return active;
  },
};
export async function deleteCurrentAccount(confirmed: boolean) {
  if (!confirmed || !accountDeletionEnabled || !accountClient || active)
    throw Error("Deletion unavailable");
  const client = accountClient;
  active = (async () => {
    const session = await client.auth.getUser();
    if (session.error || !session.data.user) throw Error("Sign-in required");
    let journal = await readJournal();
    if (
      journal &&
      (journal.userID !== session.data.user.id ||
        journal.namespace !== namespace)
    )
      throw Error("Another deletion is pending");
    if (!journal) {
      const random = await Crypto.getRandomBytesAsync(32);
      journal = {
        requestID: Crypto.randomUUID(),
        receipt: Array.from(random, (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
        userID: session.data.user.id,
        namespace,
      };
      await storage.setItem(journalKey, JSON.stringify(journal));
    }
    publish({ phase: "checking", hasJournal: true });
    try {
      const { data, error } = await client.functions.invoke("delete-account", {
        body: {
          request_id: journal.requestID,
          receipt: journal.receipt,
          confirmation: "DELETE",
          apple_authorization_code: consumeAppleDeletionProof(
            session.data.user.id,
          ),
        },
      });
      if (!error && data?.auth_deleted) {
        readDeletionReceipt(data, journal.requestID);
        await finish(journal.requestID);
        await storage.removeItem(journalKey);
        publish({ phase: "idle", hasJournal: false });
        return;
      }
      await recover();
      if (snapshot.hasJournal) throw Error("Deletion pending");
    } catch (error) {
      if (snapshot.phase === "checking") await recover();
      throw error;
    }
  })();
  try {
    await active;
    return "completed" as const;
  } finally {
    active = null;
  }
}
