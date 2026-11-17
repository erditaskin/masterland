import * as Crypto from "expo-crypto";
import {
  recordCloudAdoption,
  resumeCloudAdoption,
} from "../account/cloudLocal";
import { resolveSaveNamespace } from "./saveNamespace";
import {
  eraseDeletedAccountProgress,
  resumeDeletionReset,
} from "./accountDeletion";
import { preservePreCloudSave } from "./localBackup";
import {
  testModeEnabled,
  testFlightBeta,
  productionRelease,
} from "../game/testMode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FS from "expo-file-system/legacy";
import {
  level,
  levelRange,
  advance,
  migrateCurrentSave,
  fresh,
  transition,
  validateSave,
  visualFixture,
  type Action,
  type Result,
  type Save,
} from "../game/engine";
import { decodeLegacy } from "../game/migrate";
const namespace = resolveSaveNamespace({
  channel: process.env.EXPO_PUBLIC_DISTRIBUTION_CHANNEL,
  testMode: process.env.EXPO_PUBLIC_TEST_MODE,
  controlled: process.env.EXPO_PUBLIC_CONTROLLED_ACCEPTANCE,
});
const KEY = namespace.key;
export interface Snapshot {
  save: Save;
  ready: boolean;
  error: string | null;
  result: Result | null;
  revision: number;
  review: boolean;
}
let snapshot: Snapshot = {
  save: fresh(Date.now()),
  ready: false,
  error: null,
  result: null,
  revision: 0,
  review: false,
};
const listeners = new Set<() => void>();
let pending: string | null = null,
  writing = false,
  loadEpoch = 0;
let activeMode: "normal" | "review" | "qa" | "milestone" = "normal";
function publish(value: Snapshot) {
  snapshot = value;
  listeners.forEach((f) => f());
}
let activeWrite: Promise<void> | null = null;
function persist(): Promise<void> {
  if (activeWrite) return activeWrite;
  activeWrite = writePending().finally(() => {
    activeWrite = null;
  });
  return activeWrite;
}
async function writePending() {
  if (writing) return;
  writing = true;
  let inFlight: string | null = null;
  try {
    while (pending !== null) {
      inFlight = pending;
      pending = null;
      await AsyncStorage.setItem(KEY, inFlight);
      inFlight = null;
    }
    if (snapshot.error === "İlerlemen kaydedilemedi. Tekrar dene.")
      publish({ ...snapshot, error: null });
  } catch {
    // Keep the latest snapshot retryable; a newer queued save takes precedence.
    if (pending === null) pending = inFlight;
    publish({ ...snapshot, error: "İlerlemen kaydedilemedi. Tekrar dene." });
  } finally {
    writing = false;
  }
}
async function removeLegacyImports() {
  const cloudArtifacts = (await AsyncStorage.getAllKeys()).filter((key) =>
    key.startsWith("@masterland/cloud-"),
  );
  if (cloudArtifacts.length) await AsyncStorage.multiRemove(cloudArtifacts);
  for (const file of ["migration-v2.json", "legacy-save.json"]) {
    await FS.deleteAsync(FS.documentDirectory + file, { idempotent: true });
  }
}
async function load(mode: "normal" | "review" | "qa" | "milestone" = "normal") {
  // TestFlight sessions always use the tester's persistent normal save.
  // Production likewise rejects transient QA/preview saves, including direct store calls.
  if (testFlightBeta || productionRelease) mode = "normal";
  const token = ++loadEpoch;
  activeMode = mode;
  try {
    let save: Save;
    if (mode !== "normal") {
      if (mode === "milestone" && !testModeEnabled)
        throw Error("Test modu kapalı.");
      save =
        mode === "review" || mode === "milestone"
          ? visualFixture(Date.now())
          : fresh(Date.now());
      if (mode === "milestone") {
        while (level(save) < 12) save.xp = levelRange(save)[1];
        save.gold = 8000;
        save.stamina = 90;
      }
    } else {
      const reset = await resumeDeletionReset(
        AsyncStorage,
        removeLegacyImports,
      );
      await resumeCloudAdoption(AsyncStorage, KEY, Crypto.randomUUID);
      const stored = await AsyncStorage.getItem(KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!validateSave(parsed)) throw Error("Kayıt doğrulanamadı.");
        await preservePreCloudSave(AsyncStorage, stored);
        save = advance(migrateCurrentSave(parsed, Date.now()), Date.now());
      } else {
        const v2Path = FS.documentDirectory + "migration-v2.json";
        const imported =
          reset || namespace.controlled
            ? { exists: false }
            : await FS.getInfoAsync(v2Path);
        if (imported.exists) {
          const parsed: unknown = JSON.parse(
            await FS.readAsStringAsync(v2Path),
          );
          if (!validateSave(parsed))
            throw Error("Aktarılan kayıt doğrulanamadı.");
          save = advance(migrateCurrentSave(parsed, Date.now()), Date.now());
        } else {
          const path = FS.documentDirectory + "legacy-save.json";
          const exists =
            reset || namespace.controlled
              ? { exists: false }
              : await FS.getInfoAsync(path);
          save = exists.exists
            ? decodeLegacy(
                JSON.parse(await FS.readAsStringAsync(path)),
                Date.now(),
              )
            : fresh(Date.now());
        }
      }
    }
    if (token !== loadEpoch) return;
    publish({
      save,
      ready: true,
      error: null,
      result: null,
      revision: 0,
      review: mode !== "normal",
    });
    if (mode === "normal") {
      pending = JSON.stringify(save);
      void persist();
    }
  } catch {
    publish({
      ...snapshot,
      ready: false,
      error: "Önceki kayıt korunuyor. Kayıt okunamadı; tekrar dene.",
    });
  }
}
export const gameStore = {
  get: () => snapshot,
  subscribe: (f: () => void) => {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
  load,
  dispatch: (action: Action) => {
    if (!snapshot.ready) return null;
    const previous = snapshot.save;
    const result = transition(previous, action, Date.now());
    if (result.state === snapshot.save && result.kind === "none") return result;
    publish({
      ...snapshot,
      save: result.state,
      result,
      revision: snapshot.revision + 1,
    });
    if (!snapshot.review && result.state !== previous) {
      pending = JSON.stringify(result.state);
      void persist();
    }
    return result;
  },
  adoptCloudSave: async (ownerID: string, revision: number, payload: Save) => {
    if (!snapshot.ready || snapshot.review)
      throw Error("Local save is not ready");
    const previous = snapshot.save;
    publish({ ...snapshot, ready: false, result: null });
    try {
      await persist();
      await recordCloudAdoption(AsyncStorage, KEY, {
        ownerID,
        revision,
        payload,
        previous,
      });
      await load("normal");
      if (!snapshot.ready) throw Error("Cloud choice recovery pending");
    } catch {
      publish({
        ...snapshot,
        ready: false,
        error:
          "Seçtiğin kayıt hazırlanamadı. Önceki kayıt korunuyor; tekrar dene.",
      });
      throw Error("Cloud choice recovery pending");
    }
  },
  resetAfterAccountDeletion: async (requestID: string) => {
    ++loadEpoch;
    pending = null;
    publish({ ...snapshot, ready: false, result: null });
    try {
      await persist();
      await eraseDeletedAccountProgress(
        AsyncStorage,
        requestID,
        removeLegacyImports,
      );
      await load("normal");
      if (snapshot.ready) {
        const save = {
          ...snapshot.save,
          rewardQueue: [
            {
              id: "deletion-" + requestID,
              kind: "achievement" as const,
              title: "Hesabın silindi",
              message:
                "Bulut hesabın ve bu telefondaki ilerlemen silindi. Yeni bir misafir oyununa başladın.",
              gold: 0,
              gems: 0,
              energy: 0,
              xp: 0,
            },
          ],
        };
        publish({ ...snapshot, save });
        pending = JSON.stringify(save);
        await persist();
      }
    } catch {
      publish({
        ...snapshot,
        ready: false,
        error:
          "Hesabın silindi. Yerel sıfırlamayı tamamlamak için tekrar dene.",
      });
      throw Error("Local reset pending");
    }
  },
  flush: async () => {
    await persist();
    if (pending !== null) await persist();
    if (snapshot.error) throw Error(snapshot.error);
  },
  retry: () => {
    if (!snapshot.ready) void load(activeMode);
    else {
      publish({ ...snapshot, error: null });
      pending = JSON.stringify(snapshot.save);
      void persist();
    }
  },
};
