/** Delivery facts are independent of profession names, rank thresholds and presentation. */
export interface DeliveryProgress {
  [cityID: string]: {
    ordersByProducerSet: Record<string, number>;
    items: Record<string, number>;
  };
}
export interface DeliveryRequirement {
  metric: "delivery_orders" | "delivery_items";
  producer_ids: string[];
  match: "any" | "all";
  target: number;
}
interface DeliveredItem {
  itemID: string;
  producerID: string;
  quantity: number;
}
export function recordDelivery(
  previous: DeliveryProgress | undefined,
  cityID: string,
  items: DeliveredItem[],
): DeliveryProgress {
  const current = previous?.[cityID];
  const next = {
    ordersByProducerSet: { ...current?.ordersByProducerSet },
    items: { ...current?.items },
  };
  const key = JSON.stringify(
    [...new Set(items.map((item) => item.producerID))].sort(),
  );
  next.ordersByProducerSet[key] = (next.ordersByProducerSet[key] ?? 0) + 1;
  for (const item of items)
    next.items[item.itemID] = (next.items[item.itemID] ?? 0) + item.quantity;
  return { ...previous, [cityID]: next };
}
/** One mixed order counts once, even when several producers belong to the same profession. */
export function deliveryProgress(
  progress: DeliveryProgress | undefined,
  cityID: string,
  requirement: DeliveryRequirement,
  producerOf: (itemID: string) => string | undefined,
): number {
  const city = progress?.[cityID];
  if (!city || !requirement.producer_ids.length) return 0;
  const wanted = new Set(requirement.producer_ids);
  if (requirement.metric === "delivery_items")
    return Object.entries(city.items).reduce(
      (total, [item, quantity]) =>
        total + (wanted.has(producerOf(item) ?? "") ? quantity : 0),
      0,
    );
  return Object.entries(city.ordersByProducerSet).reduce(
    (total, [key, count]) => {
      const producers = JSON.parse(key) as string[];
      const matches =
        requirement.match === "all"
          ? [...wanted].every((id) => producers.includes(id))
          : producers.some((id) => wanted.has(id));
      return total + (matches ? count : 0);
    },
    0,
  );
}
export function validDeliveryProgress(
  value: unknown,
  producerCity: (id: string) => string | undefined,
  itemCity: (id: string) => string | undefined,
): value is DeliveryProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const counter = (n: unknown) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  const map = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object" && !Array.isArray(v);
  return Object.entries(value).every(([cityID, city]) => {
    if (!map(city) || !map(city.items) || !map(city.ordersByProducerSet))
      return false;
    if (
      !Object.entries(city.items).every(
        ([id, n]) => itemCity(id) === cityID && counter(n),
      )
    )
      return false;
    return Object.entries(city.ordersByProducerSet).every(([key, n]) => {
      try {
        const ids: unknown = JSON.parse(key);
        return (
          counter(n) &&
          Array.isArray(ids) &&
          ids.length > 0 &&
          ids.every(
            (id) => typeof id === "string" && producerCity(id) === cityID,
          ) &&
          JSON.stringify([...new Set(ids)].sort()) === key
        );
      } catch {
        return false;
      }
    });
  });
}
