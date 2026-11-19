import { redeemVerifiedEnergyAd } from "../ads/verifiedEnergyRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import * as Crypto from "expo-crypto";
import { accountStore } from "./auth";
import { accountConfig } from "./client";
import { deletionStore } from "./deletion";
import { createCloudOutbox } from "./cloudOutbox";
import { cloudKeys, readCloudBinding } from "./cloudLocal";
import { fetchCloudSave, writeCloudSave } from "./cloudRepository";
import { createCloudSyncController } from "./cloudSyncController";
import { gameStore } from "../state/store";
import { resolveSaveNamespace } from "../state/saveNamespace";
import { testModeEnabled } from "../game/testMode";
const namespace = resolveSaveNamespace({
  channel: process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
  controlled: process.env.EXPO_PUBLIC_CONTROLLED_ACCEPTANCE,
  testMode: process.env.EXPO_PUBLIC_TEST_MODE,
}).key;
export const cloudSyncEnabled = accountConfig.enabled && !testModeEnabled;
const queues = new Map<string, ReturnType<typeof createCloudOutbox>>();
export const cloudSync = createCloudSyncController({
  local: () => gameStore.get().save,
  localReady: () =>
    cloudSyncEnabled &&
    gameStore.get().ready &&
    !gameStore.get().review &&
    !gameStore.get().save.testOnly &&
    !deletionStore.get(),
  isGuest: (owner) =>
    accountStore.get().user?.id === owner &&
    accountStore.get().user?.is_anonymous === true,
  fetch: fetchCloudSave,
  binding: async () =>
    (await readCloudBinding(AsyncStorage, namespace))?.ownerID ?? null,
  bind: (ownerID) =>
    AsyncStorage.setItem(
      cloudKeys(namespace).binding,
      JSON.stringify({ ownerID, uploadedHash: null }),
    ),
  backup: async () => {
    const previous = await readCloudBinding(AsyncStorage, namespace);
    await AsyncStorage.setItem(
      cloudKeys(namespace).backup(previous?.ownerID ?? null),
      JSON.stringify(gameStore.get().save),
    );
  },
  adopt: (remote) =>
    gameStore.adoptCloudSave(remote.user_id, remote.revision, remote.payload),
  queue: (owner) => {
    let queue = queues.get(owner);
    if (!queue) {
      queue = createCloudOutbox({
        storage: AsyncStorage,
        key: cloudKeys(namespace).outbox(owner),
        ownerID: owner,
        newID: Crypto.randomUUID,
        write: (ownerID, task) =>
          writeCloudSave(
            ownerID,
            task.save,
            task.expectedRevision,
            task.requestID,
            "normal",
          ),
      });
      queues.set(owner, queue);
    }
    return queue;
  },
  flushLocal: () => gameStore.flush(),
  redeem: redeemVerifiedEnergyAd,
});
/** One bounded upload timer per active session. Local play never waits for the network. */
export function startCloudSync() {
  if (!cloudSyncEnabled) return () => {};
  let owner: string | null = null;
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let active = AppState.currentState === "active";
  const schedule = () => {
    if (!active || timer || !owner || !gameStore.get().ready) return;
    timer = setTimeout(() => {
      timer = null;
      dirty = false;
      void cloudSync.sync().finally(() => {
        if (dirty) schedule();
      });
    }, 5000);
  };
  const accountChanged = () => {
    const account = accountStore.get();
    const next =
      account.ready && !account.busy && !deletionStore.get()
        ? (account.user?.id ?? null)
        : null;
    if (next !== owner) {
      owner = next;
      void cloudSync.connect(owner);
    }
  };
  const unsubAccount = accountStore.subscribe(accountChanged);
  const unsubDeletion = deletionStore.subscribe(accountChanged);
  let observed = gameStore.get();
  const unsubGame = gameStore.subscribe(() => {
    const next = gameStore.get();
    const changed = next.save !== observed.save;
    const becameReady = next.ready && !observed.ready;
    observed = next;
    if (!changed && !becameReady) return;
    if (changed) dirty = true;
    if (
      gameStore.get().ready &&
      owner &&
      cloudSync.get().phase === "checking" &&
      !cloudSync.get().busy
    )
      void cloudSync.retry();
    else if (dirty) schedule();
  });
  const unsubNetwork = NetInfo.addEventListener((network) => {
    if (
      active &&
      owner &&
      network.isConnected &&
      network.isInternetReachable !== false
    )
      void cloudSync.retry();
  });
  const app = AppState.addEventListener("change", (state) => {
    active = state === "active";
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (active && owner) void cloudSync.retry();
    else if (owner) void cloudSync.sync();
  });
  void accountStore.start().then(accountChanged);
  accountChanged();
  return () => {
    if (timer) clearTimeout(timer);
    unsubAccount();
    unsubDeletion();
    unsubGame();
    unsubNetwork();
    app.remove();
    void cloudSync.connect(null);
  };
}
