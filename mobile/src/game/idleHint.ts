import { boardColumns } from "./grid";
import {
  city,
  cityProducers,
  count,
  orders,
  product,
  producerCatalog as producers,
  productionPlan,
  playableBoard,
  type Save,
} from "./engine";
export function idleHint(
  save: Save,
  now: number,
): { from: number; to: number; item: string } | { producerID: string } | null {
  const board = playableBoard(save);
  const columns = boardColumns(save.cityID);
  const matches = new Map<string, number[]>();
  const wanted = orders(save).flatMap((order) => order.requirements);
  let best:
    | {
        from: number;
        to: number;
        item: string;
        distance: number;
        score: number;
      }
    | undefined;
  for (const [to, tile] of board.entries()) {
    if (!tile) continue;
    const p = product(tile.item);
    const next = producers[p.producer]?.products[p.tier];
    if (!next) continue;
    const previous = matches.get(tile.item) ?? [];
    for (const from of previous) {
      const distance =
        Math.abs((from % columns) - (to % columns)) +
        Math.abs(Math.floor(from / columns) - Math.floor(to / columns));
      if (best && distance > best.distance) continue;
      const score = wanted.reduce((max, requirement) => {
        if (requirement.item_id === next.id)
          return Math.max(
            max,
            count(save, next.id) + 1 >= requirement.quantity ? 4 : 3,
          );
        return requirement.item_id === tile.item ? Math.max(max, 2) : max;
      }, 0);
      if (!best || distance < best.distance || score > best.score)
        best = { from, to, item: tile.item, distance, score };
    }
    previous.push(to);
    matches.set(tile.item, previous);
  }
  if (best) return { from: best.from, to: best.to, item: best.item };
  if (!board.includes(null)) return null;
  const p = cityProducers(save).find(
    (p) =>
      city(save).owned.includes(p.id) &&
      (city(save).batches[p.id]?.readyAt ?? 0) <= now &&
      save.stamina >= productionPlan(save, p).cost,
  );
  return p ? { producerID: p.id } : null;
}
