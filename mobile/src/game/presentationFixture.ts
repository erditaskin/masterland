import { BOARD_CAPACITY, boardCapacity } from "./grid";
import {
  city,
  cityProducers,
  fresh,
  level,
  levelRange,
  newCity,
  producers,
  type Order,
  type Save,
} from "./engine";

/** Sample order cards for the approved board composition, not a live order pool. */
export function presentationRailOrders(size = 3, mixed = false): Order[] {
  const samples = [
    ["item1"],
    ["item1", "item37"],
    ["item1", "item33", "item7"],
  ];
  return Array.from({ length: size }, (_, index) => ({
    id: `presentation-rail-${index}`,
    requirements: (mixed && samples[index]
      ? samples[index]
      : [producers[0]!.products[0]!.id]
    ).map((item_id) => ({
      item_id,
      quantity: mixed && item_id === "item33" ? 4 : 1,
    })),
    gold: mixed ? ([13, 39, 78][index] ?? 13) : 13,
    xp: mixed ? ([3, 7, 12][index] ?? 3) : 3,
    titles: [],
  }));
}

/** Transient visual fixture. The store guard forbids this path in distributed builds. */
export function presentationFixture(
  now: number,
  fullBoard = false,
  view?: string,
): Save {
  if (view === "demirdere" || view === "ipekyolu") {
    const save = presentationFixture(now, false, "yalikoru");
    for (const cityID of ["city4", "city5"]) {
      const current = (save.cities[cityID] = newCity(cityID));
      const groups = cityProducers({ ...save, cityID });
      current.owned = groups.map((producer) => producer.id);
      current.opened = groups.flatMap((producer) =>
        producer.products.map((item) => item.id),
      );
      save.discoveries.push(...current.opened);
      const [a, b, c, d, e] = groups.map((group) =>
        group.products.map((item) => item.id),
      );
      const sample = [
        [0, a![0]],
        [1, a![0]],
        [5, b![0]],
        [7, c![0]],
        [8, c![0]],
        [10, a![0]],
        [12, e![1]],
        [15, e![0]],
        [19, b![0]],
        [22, d![1]],
        [24, c![0]],
        [27, a![0]],
        [29, b![1]],
        [30, e![0]],
        [32, d![0]],
        [37, a![1]],
        [40, e![1]],
        [45, b![0]],
        [49, c![1]],
        [53, d![0]],
      ] as const;
      for (const [position, item] of sample)
        if (item)
          current.board[position] = {
            id: `preview-${cityID}-${position}`,
            item,
          };
      current.batches[groups[4]!.id] = { readyAt: now + 134000, remaining: 0 };
    }
    save.cityID = view === "demirdere" ? "city4" : "city5";
    save.gold = 4200;
    save.gems = 25;
    return save;
  }
  if (view === "yalikoru") {
    const save = fresh(now);
    save.cityID = "city3";
    save.cities.city2 = newCity("city2");
    const current = (save.cities.city3 = newCity("city3"));
    const groups = cityProducers(save);
    while (level(save) < 15) save.xp = levelRange(save)[1];
    save.stamina = 99;
    current.owned = groups.map((producer) => producer.id);
    current.opened = groups.flatMap((producer) =>
      producer.products.map((item) => item.id),
    );
    save.discoveries = [...current.opened];
    current.batches.producer17 = { readyAt: now + 134000, remaining: 0 };
    const pieces = {
      0: "item15",
      3: "item205",
      5: "item167",
      6: "item21",
      8: "item16",
      7: "item168",
      9: "item21",
      14: "item15",
      16: "item169",
      19: "item167",
      20: "item167",
      23: "item170",
      24: "item169",
      25: "item205",
      28: "item21",
      32: "item168",
      33: "item21",
      35: "item15",
      36: "item167",
      40: "item170",
      42: "item205",
      45: "item18",
      43: "item23",
      48: "item15",
      51: "item15",
      53: "item168",
    };
    for (const [position, item] of Object.entries(pieces))
      current.board[Number(position)] = {
        id: `harbor-preview-${position}`,
        item,
      };
    return save;
  }
  if (view === "badinca") {
    const save = fresh(now);
    save.cityID = "city2";
    const current = (save.cities.city2 = newCity(save.cityID));
    const plan = producers.filter(
      (producer) => producer.cityID === save.cityID,
    );
    while (level(save) < 16) save.xp = levelRange(save)[1];
    save.gold = 8000;
    save.gems = 25;
    save.stamina = 99;
    current.owned = plan.map((producer) => producer.id);
    current.opened = plan.flatMap((producer) =>
      producer.products.map((item) => item.id),
    );
    save.discoveries = [...current.opened];
    const sample = [
      "item128",
      "item134",
      "item143",
      "item152",
      "item126",
      "item136",
      "item141",
      "item150",
      "item145",
      "item154",
      "item127",
      "item138",
      "item143",
    ];
    [0, 5, 7, 10, 12, 17, 20, 24, 27, 34, 39, 46, 53].forEach(
      (position, index) => {
        current.board[position] = {
          id: "badinca-preview-" + position,
          item: sample[index]!,
        };
      },
    );
    current.board[6] = { id: "badinca-preview-6", item: "item143" };
    current.board[30] = { id: "badinca-preview-30", item: "item160" };
    current.board[50] = { id: "badinca-preview-50", item: "item162" };
    return save;
  }
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
  c.board = Array.from({ length: BOARD_CAPACITY }, (_, i) => {
    const index =
      i >= boardCapacity(s.cityID) ? -1 : fullBoard ? i : positions.indexOf(i);
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
  // The local board preview starts with the approved sample inventory.
  if (view === "board" || view === "board-two" || view === "board-mixed") {
    s.xp = 0;
    s.gold = 5;
    s.gems = 0;
    s.stamina = 99;
    c.owned = [groups[0]!.id];
    // Match the approved board's sample contents without touching a player's save.
    const samples: [number, string][] = [
      [0, "item1"],
      [1, "item50"],
      [5, "item37"],
      [7, "item50"],
      [14, "item37"],
      [16, "item53"],
      [18, "item7"],
      [21, "item33"],
      [23, "item1"],
      [31, "item33"],
      [34, "item37"],
      [37, "item53"],
      [39, "item7"],
      [46, "item1"],
      [53, "item50"],
    ];
    c.board = Array.from({ length: BOARD_CAPACITY }, (_, index) => {
      const sample = samples.find(([position]) => position === index);
      return sample
        ? { id: `presentation-board-${index}`, item: sample[1] }
        : null;
    });
  }
  return s;
}
