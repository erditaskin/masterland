import { validateSave, type Save } from "../game/engine";
export interface CloudWrite {
  requestID: string;
  expectedRevision: number;
  save: Save;
}
interface Journal {
  ownerID: string;
  baseRevision: number;
  inFlight: CloudWrite | null;
  queued: Save | null;
  conflictRevision: number | null;
}
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
const revision = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
function uploadable(save: unknown): save is Save {
  return validateSave(save) && save.testOnly !== true;
}
/** One durable in-flight snapshot; later local changes coalesce behind it without changing its receipt. */
export function createCloudOutbox(deps: {
  storage: Storage;
  key: string;
  ownerID: string;
  newID(): string;
  write(
    ownerID: string,
    task: CloudWrite,
  ): Promise<{ kind: "saved" | "conflict"; revision: number }>;
}) {
  if (!uuid(deps.ownerID)) throw Error("Invalid cloud owner");
  let tail: Promise<unknown> = Promise.resolve(),
    worker: Promise<"idle" | "synced" | "conflict"> | null = null;
  const serial = <T>(work: () => Promise<T>) => {
    const next = tail.then(work, work);
    tail = next.catch(() => {});
    return next;
  };
  async function read(): Promise<Journal> {
    const raw = await deps.storage.getItem(deps.key);
    if (!raw)
      return {
        ownerID: deps.ownerID,
        baseRevision: 0,
        inFlight: null,
        queued: null,
        conflictRevision: null,
      };
    const value = JSON.parse(raw) as Journal;
    if (
      !value ||
      value.ownerID !== deps.ownerID ||
      !revision(value.baseRevision) ||
      (value.conflictRevision !== null && !revision(value.conflictRevision)) ||
      (value.queued !== null && !uploadable(value.queued)) ||
      (value.inFlight !== null &&
        (!value.inFlight ||
          !uuid(value.inFlight.requestID) ||
          !revision(value.inFlight.expectedRevision) ||
          !uploadable(value.inFlight.save)))
    )
      throw Error("Invalid cloud journal");
    return value;
  }
  async function save(value: Journal) {
    await deps.storage.setItem(deps.key, JSON.stringify(value));
  }
  function task(value: Save, expectedRevision: number): CloudWrite {
    const requestID = deps.newID();
    if (!uuid(requestID)) throw Error("Invalid cloud receipt");
    return {
      requestID,
      expectedRevision,
      save: JSON.parse(JSON.stringify(value)),
    };
  }
  return {
    read: () => serial(read),
    stage: (snapshot: Save) =>
      serial(async () => {
        if (!uploadable(snapshot))
          throw Error("Test or invalid progress cannot be queued");
        const journal = await read();
        const latest = journal.queued ?? journal.inFlight?.save;
        if (latest && JSON.stringify(latest) === JSON.stringify(snapshot))
          return;
        if (journal.inFlight)
          journal.queued = JSON.parse(JSON.stringify(snapshot));
        else journal.inFlight = task(snapshot, journal.baseRevision);
        await save(journal);
      }),
    /** Call only after an explicit device/cloud choice. No balance or item merging occurs. */
    resolve: (baseRevision: number, localSnapshot?: Save) =>
      serial(async () => {
        if (
          !revision(baseRevision) ||
          (localSnapshot && !uploadable(localSnapshot))
        )
          throw Error("Invalid conflict resolution");
        if (worker) throw Error("Sync is still in progress");
        await read();
        await save({
          ownerID: deps.ownerID,
          baseRevision,
          inFlight: localSnapshot ? task(localSnapshot, baseRevision) : null,
          queued: null,
          conflictRevision: null,
        });
      }),
    flush: () => {
      if (worker) return worker;
      worker = (async () => {
        let wrote = false;
        for (;;) {
          const journal = await serial(read);
          if (journal.conflictRevision !== null) return "conflict" as const;
          if (!journal.inFlight)
            return wrote ? ("synced" as const) : ("idle" as const);
          const pending = journal.inFlight;
          const result = await deps.write(deps.ownerID, pending);
          if (
            !revision(result.revision) ||
            !["saved", "conflict"].includes(result.kind) ||
            (result.kind === "saved" &&
              result.revision !== pending.expectedRevision + 1)
          )
            throw Error("Invalid cloud acknowledgement");
          await serial(async () => {
            const current = await read();
            if (current.inFlight?.requestID !== pending.requestID)
              throw Error("Cloud binding changed during sync");
            if (result.kind === "conflict")
              current.conflictRevision = result.revision;
            else {
              current.baseRevision = result.revision;
              current.inFlight = current.queued
                ? task(current.queued, result.revision)
                : null;
              current.queued = null;
            }
            await save(current);
          });
          if (result.kind === "conflict") return "conflict" as const;
          wrote = true;
        }
      })().finally(() => {
        worker = null;
      });
      return worker;
    },
  };
}
