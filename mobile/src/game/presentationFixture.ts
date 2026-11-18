import { city, fresh, producers, type Save } from "./engine";

/** Transient visual fixture. The store guard forbids this path in distributed builds. */
export function presentationFixture(
  now: number,
  fullBoard = false,
  view?: string,
): Save {
  const s = fresh(now),
    c = city(s),
    groups = producers.filter((p) => p.cityID === "city1");
  s.xp = 5500;
  s.gold = 2480;
  s.gems = 24;
  s.stamina = 75;
  c.owned = groups.map((p) => p.id);
  c.opened = groups.flatMap((p) => p.products.map((item) => item.id));
  const known = [4, 3, 4, 3, 4];
  s.discoveries = groups.flatMap((p, i) =>
    p.products.slice(0, known[i]).map((item) => item.id),
  );
  const ids = [
    [0, 0],
    [1, 0],
    [0, 1],
    [4, 0],
    [2, 0],
    [3, 0],
  ].map(([g, tier]) => groups[g!]!.products[tier!]!.id);
  const positions = [
    0, 5, 7, 10, 14, 16, 20, 23, 24, 28, 32, 35, 36, 40, 43, 48, 51, 53,
  ];
  c.board = Array.from({ length: 54 }, (_, i) => {
    const index = fullBoard ? i : positions.indexOf(i);
    return index < 0
      ? null
      : { id: `presentation-board-${i}`, item: ids[index % ids.length]! };
  });
  c.storage = [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 3],
    [3, 0],
    [4, 0],
    [2, 0],
    [1, 0],
  ].map(([g, tier], i) => ({
    id: `presentation-storage-${i}`,
    item: groups[g!]!.products[tier!]!.id,
  }));
  if (view === "producer-cooldown")
    c.batches[groups[0]!.id] = { readyAt: now + 134000, remaining: 0 };
  if (view === "achievements" || view === "achievement") {
    c.introIndex = 1;
    s.claimedAchievements = ["achievement1", "achievement2", "achievement5"];
  }
  if (view === "orders") {
    const excluded = [groups[2]!.products[3]!.id, groups[3]!.products[0]!.id];
    c.board = c.board.map((tile) =>
      tile && excluded.includes(tile.item) ? null : tile,
    );
    c.storage = c.storage.filter((tile) => !excluded.includes(tile.item));
  }
  s.rewardQueue = [];
  return s;
}
