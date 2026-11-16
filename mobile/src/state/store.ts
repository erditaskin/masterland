import { testModeEnabled } from "../game/testMode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FS from "expo-file-system/legacy";
import {
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
const KEY = "@masterland/save/v2";
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
  try {
    while (pending !== null) {
      const value = pending;
      pending = null;
      await AsyncStorage.setItem(KEY, value);
    }
  } catch {
    publish({ ...snapshot, error: "İlerlemen kaydedilemedi. Tekrar dene." });
  } finally {
    writing = false;
  }
}
async function load(mode: "normal" | "review" | "qa" | "milestone" = "normal") {
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
        save.xp = 2000;
        save.gold = 8000;
        save.stamina = 90;
      }
    } else {
      const stored = await AsyncStorage.getItem(KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!validateSave(parsed)) throw Error("Kayıt doğrulanamadı.");
        save = advance(migrateCurrentSave(parsed, Date.now()), Date.now());
      } else {
        const v2Path = FS.documentDirectory + "migration-v2.json";
        const imported = await FS.getInfoAsync(v2Path);
        if (imported.exists) {
          const parsed: unknown = JSON.parse(
            await FS.readAsStringAsync(v2Path),
          );
          if (!validateSave(parsed))
            throw Error("Aktarılan kayıt doğrulanamadı.");
          save = advance(migrateCurrentSave(parsed, Date.now()), Date.now());
        } else {
          const path = FS.documentDirectory + "legacy-save.json";
          const exists = await FS.getInfoAsync(path);
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
