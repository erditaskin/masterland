import { product, type Order, type Save } from "../game/engine";
import { orderProgress } from "../game/orderProgress";

export { orderItemHighlights } from "../game/orderProgress";

export function ordersByProgress<T extends Order>(input: T[], save: Save) {
  return orderProgress(input, save).sort(
    (a, b) =>
      Number(b.ready) - Number(a.ready) ||
      b.fulfilled * a.total - a.fulfilled * b.total,
  );
}

export function readyOrdersFirst<T extends Order>(input: T[], save: Save): T[] {
  return ordersByProgress(input, save).map(({ order }) => order);
}

/** Keep the main order first; expose available production variety before duplicates. */
export function prioritizeOrderRail(input: Order[], save?: Save): Order[] {
  if (input.length < 2) return input;
  const result = [input[0]!],
    remaining = input.slice(1);
  const seen = new Set(
    result[0]!.requirements.map((r) => product(r.item_id).producer),
  );
  while (result.length < 3) {
    const candidate = remaining
      .filter((o) => !seen.has(product(o.requirements[0]!.item_id).producer))
      .sort(
        (a, b) =>
          product(b.requirements[0]!.item_id).tier -
          product(a.requirements[0]!.item_id).tier,
      )[0];
    if (!candidate) break;
    result.push(candidate);
    seen.add(product(candidate.requirements[0]!.item_id).producer);
    remaining.splice(remaining.indexOf(candidate), 1);
  }
  const ordered = [...result, ...remaining];
  return save ? readyOrdersFirst(ordered, save) : ordered;
}
