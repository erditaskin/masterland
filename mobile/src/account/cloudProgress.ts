import { migrateCurrentSave, type Save } from "../game/engine";

type Progress = Map<string, number>;

/** Spendable balances, settings and current board placement can move in either direction. */
function milestones(save: Save): Progress {
  const xp =
    save.progressionVersion === 2
      ? save.xp
      : migrateCurrentSave(save, save.energyAt).xp;
  const points: Progress = new Map([["xp", xp]]);
  const addIDs = (prefix: string, ids: string[]) => {
    for (const id of ids) points.set(prefix + id, 1);
  };
  addIDs("item/", save.discoveries);
  addIDs("title/", save.titles);
  addIDs("claim/", save.claimedAchievements ?? []);
  addIDs("receipt/", save.transactions ?? []);
  for (const [id, city] of Object.entries(save.cities)) {
    const prefix = `city/${id}/`;
    points.set(prefix + "unlocked", 1);
    points.set(prefix + "intro", city.introIndex);
    points.set(prefix + "repeat", city.repeatIndex);
    points.set(prefix + "storage", city.storageCapacity);
    addIDs(prefix + "producer/", city.owned);
    addIDs(prefix + "open/", city.opened);
    const delivery = save.deliveryProgress?.[id];
    for (const [key, count] of Object.entries(
      delivery?.ordersByProducerSet ?? {},
    ))
      points.set(prefix + "orders/" + key, count);
    for (const [key, count] of Object.entries(delivery?.items ?? {}))
      points.set(prefix + "delivered/" + key, count);
  }
  return points;
}

export function cloudHasMoreProgress(local: Save, remote: Save): boolean {
  const localPoints = milestones(local);
  const remotePoints = milestones(remote);
  return (
    [...localPoints].every(
      ([key, count]) => (remotePoints.get(key) ?? 0) >= count,
    ) &&
    [...remotePoints].some(
      ([key, count]) => count > (localPoints.get(key) ?? 0),
    )
  );
}
