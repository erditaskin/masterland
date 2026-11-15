import { product, type Order } from "../game/engine";
/** Keep the main order first; expose available production variety before duplicates. */
export function prioritizeOrderRail(input: Order[]): Order[] {
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
  return [...result, ...remaining];
}
