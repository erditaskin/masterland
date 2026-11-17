import type { EnergyRedemption } from "../ads/verifiedEnergy";
import type { Save } from "../game/engine";
import type { CloudSave } from "./cloudProtocol";
import type { createCloudOutbox } from "./cloudOutbox";
export interface CloudSyncSnapshot {
  phase:
    "signed-out" | "checking" | "choice" | "syncing" | "synced" | "pending";
  ownerID: string | null;
  remote: CloudSave | null;
  busy: boolean;
}
type Outbox = ReturnType<typeof createCloudOutbox>;
/** Whole-save choices are explicit. Epochs discard responses from an earlier account. */
export function createCloudSyncController(deps: {
  local(): Save;
  localReady(): boolean;
  isGuest?(owner: string): boolean;
  fetch(owner: string): Promise<CloudSave | null>;
  binding(): Promise<string | null>;
  bind(owner: string): Promise<void>;
  backup(): Promise<void>;
  adopt(remote: CloudSave): Promise<void>;
  queue(owner: string): Outbox;
  flushLocal(): Promise<void>;
  redeem?(
    owner: string,
    intentID: string,
    save: Save,
    revision: number,
  ): Promise<EnergyRedemption>;
}) {
  let snapshot: CloudSyncSnapshot = {
    phase: "signed-out",
    ownerID: null,
    remote: null,
    busy: false,
  };
  let epoch = 0;
  let uploaded: { owner: string; payload: string } | null = null;
  let work: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const publish = (change: Partial<CloudSyncSnapshot>) => {
    snapshot = { ...snapshot, ...change };
    listeners.forEach((listener) => listener());
  };
  function valid(token: number) {
    return token === epoch && snapshot.ownerID !== null && deps.localReady();
  }
  const run = (action: (owner: string, token: number) => Promise<void>) => {
    if (work || !snapshot.ownerID || !deps.localReady())
      return work ?? Promise.resolve();
    const owner = snapshot.ownerID,
      token = epoch;
    publish({ busy: true });
    work = action(owner, token)
      .catch(() => {
        if (valid(token)) publish({ phase: "pending" });
      })
      .finally(() => {
        work = null;
        if (token === epoch) publish({ busy: false });
      });
    return work;
  };
  async function upload(owner: string, token: number, box: Outbox) {
    if (!valid(token)) return;
    await deps.flushLocal();
    if (!valid(token)) return;
    const payload = JSON.stringify(deps.local());
    if (uploaded?.owner === owner && uploaded.payload === payload) {
      publish({ phase: "synced" });
      return;
    }
    await box.stage(deps.local());
    if (!valid(token)) return;
    publish({ phase: "syncing" });
    const result = await box.flush();
    if (!valid(token)) return;
    if (result === "conflict") {
      const remote = await deps.fetch(owner);
      if (valid(token)) publish({ phase: "choice", remote });
    } else {
      uploaded = { owner, payload };
      publish({ phase: "synced", remote: null });
    }
  }
  async function refresh(owner: string, token: number) {
    publish({ phase: "checking" });
    const binding = await deps.binding();
    if (!valid(token)) return;
    const box = deps.queue(owner);
    if (binding === owner) {
      const journal = await box.read();
      if (!valid(token)) return;
      // Retry the existing receipt before comparing the remote revision: its prior response may have been lost.
      if (journal.inFlight && journal.conflictRevision === null) {
        await upload(owner, token, box);
        return;
      }
      const remote = await deps.fetch(owner);
      if (!valid(token)) return;
      if (
        journal.conflictRevision !== null ||
        (remote?.revision ?? 0) !== journal.baseRevision
      ) {
        publish({ phase: "choice", remote });
        return;
      }
      await upload(owner, token, box);
    } else {
      const remote = await deps.fetch(owner);
      if (!valid(token)) return;
      if (!remote && deps.isGuest?.(owner)) {
        // A new guest identity has no competing cloud save. Never overwrite an existing save implicitly.
        await deps.backup();
        if (!valid(token)) return;
        await box.resolve(0, deps.local());
        await deps.bind(owner);
        await upload(owner, token, box);
      } else publish({ phase: "choice", remote });
    }
  }
  return {
    get: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async connect(ownerID: string | null) {
      ++epoch;
      uploaded = null;
      publish({
        phase: ownerID ? "checking" : "signed-out",
        ownerID,
        remote: null,
        busy: false,
      });
      // Let the old owner's pinned request finish before starting a new queue.
      const previous = work;
      const token = epoch;
      if (previous) await previous;
      if (token !== epoch || !ownerID) return;
      await run(refresh);
    },
    retry: () => run(refresh),
    sync: () => {
      if (snapshot.phase === "choice" || snapshot.phase === "signed-out")
        return Promise.resolve();
      return run(async (owner, token) => {
        if ((await deps.binding()) !== owner || !valid(token)) return;
        await upload(owner, token, deps.queue(owner));
      });
    },
    redeem: (intentID: string) => {
      if (
        !deps.redeem ||
        snapshot.phase === "choice" ||
        snapshot.phase === "signed-out"
      )
        return Promise.resolve();
      return run(async (owner, token) => {
        if ((await deps.binding()) !== owner || !valid(token)) return;
        const box = deps.queue(owner);
        await upload(owner, token, box);
        if (!valid(token) || snapshot.phase !== "synced") return;
        const journal = await box.read();
        if (!valid(token)) return;
        const before = deps.local(),
          fingerprint = JSON.stringify(before);
        const result = await deps.redeem!(
          owner,
          intentID,
          before,
          journal.baseRevision,
        );
        if (!valid(token) || result.kind === "pending") return;
        if (result.kind !== "redeemed") {
          const remote = await deps.fetch(owner);
          if (valid(token) && (remote?.revision ?? 0) !== journal.baseRevision)
            publish({ phase: "choice", remote });
          return;
        }
        const remote: CloudSave = {
          user_id: owner,
          schema_version: 1,
          revision: result.revision,
          payload: result.payload,
          updated_at: new Date().toISOString(),
        };
        if (JSON.stringify(deps.local()) !== fingerprint) {
          // Preserve play performed while the reward request was in flight; never replace it silently.
          publish({ phase: "choice", remote });
          return;
        }
        await deps.adopt(remote);
        if (!valid(token)) return;
        uploaded = { owner, payload: JSON.stringify(deps.local()) };
        publish({ phase: "synced", remote: null });
      });
    },
    choose: (choice: "device" | "cloud") => {
      if (snapshot.phase !== "choice") return Promise.resolve();
      return run(async (owner, token) => {
        const selected = snapshot.remote;
        // Refetch before replacing anything. A newer device must trigger a new choice.
        const remote = await deps.fetch(owner);
        if (!valid(token)) return;
        if ((remote?.revision ?? 0) !== (selected?.revision ?? 0)) {
          publish({ phase: "choice", remote });
          return;
        }
        await deps.flushLocal();
        if (!valid(token)) return;
        const box = deps.queue(owner);
        if (choice === "cloud") {
          if (!remote) throw Error("No cloud progress");
          await deps.adopt(remote);
          if (!valid(token)) return;
        } else {
          await deps.backup();
          if (!valid(token)) return;
          await box.resolve(remote?.revision ?? 0, deps.local());
          if (!valid(token)) return;
          await deps.bind(owner);
          if (!valid(token)) return;
        }
        uploaded = null;
        await upload(owner, token, box);
      });
    },
  };
}
