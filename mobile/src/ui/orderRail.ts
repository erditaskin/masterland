import {
  canDeliver,
  count,
  product,
  type Save,
  type Order,
} from "../game/engine";
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
  return save
    ? ordered.sort(
        (a, b) => Number(canDeliver(save, b)) - Number(canDeliver(save, a)),
      )
    : ordered;
}

/** Fulfilled individual requirements stay distinct from fully deliverable orders. */
export function orderItemHighlights(input: Order[], save: Save) {
  const ready = new Set<string>(),
    partial = new Set<string>();
  for (const order of input) {
    const complete = canDeliver(save, order);
    for (const requirement of order.requirements) {
      if (count(save, requirement.item_id) >= requirement.quantity)
        (complete ? ready : partial).add(requirement.item_id);
    }
  }
  for (const id of ready) partial.delete(id);
  return { ready, partial };
}
