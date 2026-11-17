import {
  city,
  cityProducers,
  count,
  orders,
  product,
  producers,
  productionPlan,
  type Save,
} from "./engine";
export function idleHint(
  save: Save,
  now: number,
): { from: number; to: number; item: string } | { producerID: string } | null {
  const board = city(save).board;
  const pairs: { from: number; to: number; item: string; score: number }[] = [];
  const wanted = orders(save);
  board.forEach((a, from) => {
    if (!a) return;
    const p = product(a.item),
      next = producers[p.producer]?.products[p.tier];
    if (!next) return;
    const to = board.findIndex((b, i) => i > from && b?.item === a.item);
    if (to < 0) return;
    const score = wanted.reduce(
      (max, o) =>
        Math.max(
          max,
          ...o.requirements.map((r) =>
            r.item_id === next.id
              ? count(save, r.item_id) + 1 >= r.quantity
                ? 4
                : 3
              : r.item_id === a.item
                ? 2
                : 0,
          ),
        ),
      0,
    );
    pairs.push({ from, to, item: a.item, score });
  });
  pairs.sort((a, b) => b.score - a.score);
  if (pairs[0]) return pairs[0];
  if (!board.includes(null)) return null;
  const p = cityProducers(save).find(
    (p) =>
      city(save).owned.includes(p.id) &&
      (city(save).batches[p.id]?.readyAt ?? 0) <= now &&
      save.stamina >= productionPlan(save, p).cost,
  );
  return p ? { producerID: p.id } : null;
}
