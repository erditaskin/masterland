import { city, type Order, type Save } from "./engine";
import { boardCapacity } from "./grid";

export const fulfilledRequirementColor = "rgba(29, 72, 37, 0.43)";
export const fulfilledRequirementBorder = "#496e39";

export function orderProgress<T extends Order>(orders: readonly T[], save: Save) {
  const inventory = new Map<string, number>();
  const { board, storage } = city(save);
  const add = (item: string) => inventory.set(item, (inventory.get(item) ?? 0) + 1);
  const capacity = Math.min(board.length, boardCapacity(save.cityID));
  for (let index = 0; index < capacity; index++) {
    const tile = board[index];
    if (tile) add(tile.item);
  }
  for (const tile of storage) if (tile) add(tile.item);

  return orders.map((order) => {
    let total = 0;
    let fulfilled = 0;
    const requirements = order.requirements.map((requirement) => {
      const available = Math.min(
        inventory.get(requirement.item_id) ?? 0,
        requirement.quantity,
      );
      total += requirement.quantity;
      fulfilled += available;
      return { ...requirement, available };
    });
    return { order, requirements, ready: fulfilled === total, fulfilled, total };
  });
}

export function orderItemHighlights(input: readonly Order[], save: Save) {
  return orderProgressHighlights(orderProgress(input, save));
}

export function orderProgressHighlights(progress: ReturnType<typeof orderProgress>) {
  const ready = new Set<string>();
  const partial = new Set<string>();
  for (const entry of progress) {
    for (const requirement of entry.requirements) {
      if (requirement.available === requirement.quantity)
        (entry.ready ? ready : partial).add(requirement.item_id);
    }
  }
  for (const id of ready) partial.delete(id);
  return { ready, partial };
}
