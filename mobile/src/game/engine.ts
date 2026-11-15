import reference from "../../../data/content-reference.json";
export interface Product {
  id: string;
  name: string;
  producer: number;
  tier: number;
  level: number;
  price: number;
}
export interface Producer {
  id: string;
  name: string;
  level: number;
  price: number;
  products: Product[];
}
export interface Requirement {
  item_id: string;
  quantity: number;
}
export interface Order {
  id: string;
  requirements: Requirement[];
  gold: number;
  xp: number;
  titles: string[];
}
interface PlanRow {
  producer_id: string;
  required_player_level: number;
  unlock_gold: number;
  product_unlocks: {
    item_id: string;
    tier: number;
    required_player_level: number;
    gold_cost: number;
  }[];
}
interface QuestRow {
  id: string;
  requirements: Requirement[];
  reward_gold: number;
  reward_xp: number;
  grants_title_ids: string[];
}
const data = reference as unknown as {
  locales: { tr: Record<string, string> };
  city1_opening_plan: { producers: PlanRow[]; intro_quests: QuestRow[] };
};
export const name = (id: string) => data.locales.tr[id + "_name_tr"] ?? id;
export const producers: Producer[] = data.city1_opening_plan.producers.map(
  (p, i) => ({
    id: p.producer_id,
    name: name(p.producer_id),
    level: p.required_player_level,
    price: p.unlock_gold,
    products: p.product_unlocks.map((a) => ({
      id: a.item_id,
      name: name(a.item_id),
      producer: i,
      tier: a.tier,
      level: a.required_player_level,
      price: a.gold_cost,
    })),
  }),
);
export const products = producers.flatMap((p) => p.products);
export const product = (id: string) => products.find((p) => p.id === id)!;
export const intro: Order[] = data.city1_opening_plan.intro_quests.map((q) => ({
  id: q.id,
  requirements: q.requirements,
  gold: q.reward_gold,
  xp: q.reward_xp,
  titles: q.grants_title_ids,
}));
export interface Tile {
  id: string;
  item: string;
}
export interface City {
  board: (Tile | null)[];
  storage: Tile[];
  storageCapacity: number;
  owned: string[];
  opened: string[];
  batches: Record<string, { remaining: number; readyAt: number }>;
  powers?: Record<string, number>;
  introIndex: number;
  repeatIndex: number;
}
export interface Save {
  schema: 2;
  xp: number;
  gold: number;
  gems: number;
  stamina: number;
  staminaCapacity?: number;
  claimedAchievements?: string[];
  energyAt: number;
  discoveries: string[];
  titles: string[];
  mastery: Record<string, number>;
  cityID: string;
  cities: Record<string, City>;
  sound: boolean;
  reducedMotion: boolean;
  serial: number;
}
export const city = (s: Save) => s.cities[s.cityID]!;
const thresholds = [0, 20, 60, 120, 200, 320, 480, 680, 920, 1200];
export const level = (s: Save) =>
  s.xp >= 1200
    ? 10 + Math.floor((s.xp - 1200) / 400)
    : thresholds.filter((x) => s.xp >= x).length;
export const levelRange = (s: Save) => {
  const l = level(s);
  return [
    l <= 10 ? thresholds[l - 1]! : 1200 + (l - 10) * 400,
    l < 10 ? thresholds[l]! : 1200 + (l - 9) * 400,
  ] as const;
};
export function fresh(now: number): Save {
  return {
    schema: 2,
    xp: 0,
    gold: 0,
    gems: 0,
    stamina: 100,
    staminaCapacity: 100,
    claimedAchievements: [],
    energyAt: now,
    discoveries: [],
    titles: [],
    mastery: {},
    cityID: "city1",
    cities: {
      city1: {
        board: Array(54).fill(null),
        storage: [],
        storageCapacity: 12,
        owned: [producers[0]!.id],
        opened: producers[0]!.products.slice(0, 2).map((p) => p.id),
        batches: {},
        introIndex: 0,
        repeatIndex: 0,
      },
    },
    sound: true,
    reducedMotion: false,
    serial: 0,
  };
}
function tile(s: Save, item: string): Tile {
  return { id: "tile-" + ++s.serial, item };
}
export const count = (s: Save, id: string) =>
  [...city(s).board, ...city(s).storage].filter((t) => t?.item === id).length;
export function orders(s: Save): Order[] {
  const c = city(s),
    l = level(s),
    result: Order[] = [];
  if (intro[c.introIndex]) result.push(intro[c.introIndex]!);
  const available = producers
    .filter((p) => c.owned.includes(p.id))
    .flatMap((p) => p.products)
    .filter((p) => c.opened.includes(p.id));
  for (let i = 0; i < 5 && available.length; i++) {
    const p = available[(c.repeatIndex + i) % available.length]!,
      m =
        s.mastery[
          p.producer === 0 || p.producer === 4 ? "profession1" : "profession2"
        ] ?? 0,
      q = 1 + Math.min(2, Math.floor(l / 5));
    result.push({
      id: `repeat-${c.repeatIndex}-${i}`,
      requirements: [{ item_id: p.id, quantity: q }],
      gold: (12 * 2 ** (p.tier - 1) + l * 3 + Math.floor(m / 10)) * q,
      xp: 2 + p.tier + Math.floor(l / 3) + Math.floor(m / 50),
      titles: [],
    });
  }
  return result;
}
export const canDeliver = (s: Save, o: Order) =>
  o.requirements.every((r) => count(s, r.item_id) >= r.quantity);
export type Action =
  | { type: "produce"; id: string }
  | { type: "power"; id: string; mode: number }
  | { type: "energy-capacity" }
  | { type: "claim-achievement"; id: string }
  | { type: "move"; from: number; to: number }
  | { type: "deliver"; id: string }
  | { type: "buy"; id: string }
  | { type: "unlock"; id: string }
  | { type: "store"; index: number }
  | { type: "restore"; index: number }
  | { type: "expand"; gems: boolean }
  | { type: "tick" }
  | { type: "sound" }
  | { type: "motion" };
export interface Result {
  state: Save;
  kind:
    | "none"
    | "produce"
    | "move"
    | "merge"
    | "reward"
    | "unlock"
    | "blocked"
    | "tap";
  message: string;
  from?: number;
  to?: number;
}
/** Clone mutable containers once per domain action; tile identities remain immutable. */
function copySave(s: Save): Save {
  const c = city(s);
  return {
    ...s,
    discoveries: [...s.discoveries],
    titles: [...s.titles],
    mastery: { ...s.mastery },
    claimedAchievements: [...(s.claimedAchievements ?? [])],
    cities: {
      ...s.cities,
      [s.cityID]: {
        ...c,
        board: [...c.board],
        storage: [...c.storage],
        owned: [...c.owned],
        opened: [...c.opened],
        powers: { ...c.powers },
        batches: Object.fromEntries(
          Object.entries(c.batches).map(([id, b]) => [id, { ...b }]),
        ),
      },
    },
  };
}
export const energyCapacityStep = reference.energy_design.capacity_step;
export const energyIntervalMs =
  reference.energy_design.regeneration_seconds * 1000;
export const productionPowerCosts = reference.energy_design.power_costs;
export const energyCap = (s: Save) => s.staminaCapacity ?? 100;
export const energyUpgradeCost = (s: Save) =>
  reference.energy_design.capacity_gem_base +
  reference.energy_design.capacity_gem_step *
    Math.floor((energyCap(s) - 100) / reference.energy_design.capacity_step);
export function productionPlan(s: Save, p: Producer) {
  const selected = city(s).powers?.[p.id] ?? 1;
  const effective = s.stamina > 100 ? selected : 1;
  return {
    selected,
    effective,
    cost: productionPowerCosts[effective - 1]!,
    product: p.products[effective - 1]!,
  };
}
export interface Achievement {
  id: string;
  city_id: string;
  enabled: boolean;
  kind: string;
  metric: string;
  target: number;
  subject_id: string | null;
  reward: {
    capacity?: number;
    energy?: number;
    xp?: number;
    gold?: number;
    gems?: number;
    title?: string;
  };
}
export const achievements = reference.achievements as Achievement[];
export function achievementProgress(s: Save, a: Achievement): number {
  const c = s.cities[a.city_id];
  if (!c) return 0;
  switch (a.metric) {
    case "intro":
      return c.introIndex;
    case "owned":
      return c.owned.length;
    case "discoveries":
      return s.discoveries.filter(
        (id) =>
          producers[product(id).producer] &&
          c.owned.includes(producers[product(id).producer]!.id),
      ).length;
    case "producer_discoveries":
      return s.discoveries.filter(
        (id) => producers[product(id).producer]?.id === a.subject_id,
      ).length;
    case "item":
      return a.subject_id && s.discoveries.includes(a.subject_id) ? 1 : 0;
    default:
      return 0;
  }
}
export function achievementState(s: Save, a: Achievement) {
  if ((s.claimedAchievements ?? []).includes(a.id)) return "claimed";
  if (!a.enabled || !s.cities[a.city_id]) return "locked";
  return achievementProgress(s, a) >= a.target ? "ready" : "progress";
}
function grantEnergy(s: Save, capacity: number, energy: number, now: number) {
  const wasFull = s.stamina >= energyCap(s);
  s.staminaCapacity = energyCap(s) + capacity;
  s.stamina = Math.min(energyCap(s), s.stamina + energy);
  if (wasFull || s.stamina === energyCap(s)) s.energyAt = now;
}
export function advance(s: Save, now: number): Save {
  let next: Save | undefined;
  const edit = () => next ?? (next = copySave(s));
  if (s.stamina < energyCap(s)) {
    const n = Math.max(0, Math.floor((now - s.energyAt) / energyIntervalMs));
    if (n) {
      const a = edit();
      a.stamina = Math.min(energyCap(s), s.stamina + n);
      a.energyAt =
        a.stamina === energyCap(s) ? now : s.energyAt + n * energyIntervalMs;
    }
  }
  for (const [id, b] of Object.entries(city(s).batches)) {
    if (b.readyAt > 0 && b.readyAt <= now)
      city(edit()).batches[id] = { remaining: 30, readyAt: 0 };
  }
  return next ?? s;
}
export function transition(
  original: Save,
  action: Action,
  now: number,
  diamond = () => Math.random() < 0.1,
): Result {
  const base = advance(original, now);
  if (action.type === "tick") return { state: base, kind: "none", message: "" };
  const s = copySave(base),
    c = city(s);
  const blocked = (message: string): Result => ({
    state: base,
    kind: "blocked",
    message,
  });
  const done = (
    kind: Result["kind"],
    message: string,
    from?: number,
    to?: number,
  ): Result => ({ state: s, kind, message, from, to });
  const discover = (id: string) => {
    if (!s.discoveries.includes(id)) {
      s.discoveries.push(id);
      s.xp++;
      if (diamond()) s.gems++;
    }
  };
  switch (action.type) {
    case "produce": {
      const p = producers.find((p) => p.id === action.id);
      if (!p || !c.owned.includes(p.id))
        return blocked("Önce bu üreticiyi aç.");
      if ((c.batches[p.id]?.readyAt ?? 0) > now)
        return blocked("Üretici hazırlanıyor.");
      const i = c.board.indexOf(null);
      if (i < 0) return blocked("Tahta dolu. Birleştir veya depoya gönder.");
      const plan = productionPlan(s, p);
      if (!plan.product || !c.opened.includes(plan.product.id))
        return blocked("Güç modu için önce ürün alanını aç.");
      if (s.stamina < plan.cost) return blocked("Dayanıklılık yenileniyor.");
      if (s.stamina === energyCap(s)) s.energyAt = now;
      s.stamina -= plan.cost;
      const item = plan.product.id;
      c.board[i] = tile(s, item);
      const b = c.batches[p.id] ?? { remaining: 30, readyAt: 0 };
      b.remaining--;
      if (b.remaining === 0) b.readyAt = now + 120000;
      c.batches[p.id] = b;
      discover(item);
      return done("produce", plan.product.name, undefined, i);
    }
    case "power": {
      const p = producers.find((p) => p.id === action.id);
      if (
        !p ||
        !c.owned.includes(p.id) ||
        !Number.isInteger(action.mode) ||
        action.mode < 1 ||
        action.mode > 4 ||
        !p.products[action.mode - 1]
      )
        return blocked("Güç modu geçersiz.");
      if (!c.opened.includes(p.products[action.mode - 1]!.id))
        return blocked("Önce bu ürün alanını aç.");
      c.powers = { ...c.powers, [p.id]: action.mode };
      return done(
        "tap",
        `${action.mode}x seçildi. 100 ve altında üretim 1x olur.`,
      );
    }
    case "energy-capacity": {
      const cost = energyUpgradeCost(s);
      if (s.gems < cost) return blocked(`${cost} elmas gerekiyor.`);
      s.gems -= cost;
      grantEnergy(
        s,
        reference.energy_design.capacity_step,
        reference.energy_design.capacity_step,
        now,
      );
      return done(
        "unlock",
        `Enerji kapasitesi ve enerji +${energyCapacityStep}.`,
      );
    }
    case "claim-achievement": {
      const a = achievements.find((a) => a.id === action.id);
      if (!a || achievementState(s, a) !== "ready")
        return blocked("Bu başarı ödülü henüz alınamaz.");
      s.claimedAchievements = [...(s.claimedAchievements ?? []), a.id];
      s.gold += a.reward.gold ?? 0;
      s.gems += a.reward.gems ?? 0;
      s.xp += a.reward.xp ?? 0;
      if (a.reward.title)
        s.titles = Array.from(new Set([...s.titles, a.reward.title]));
      if (a.reward.capacity || a.reward.energy)
        grantEnergy(s, a.reward.capacity ?? 0, a.reward.energy ?? 0, now);
      return done("reward", `${name(a.id)}: Ödüller alındı.`);
    }
    case "move": {
      const { from, to } = action;
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= 54 ||
        to >= 54 ||
        !c.board[from]
      )
        return blocked("");
      const a = c.board[from]!,
        b = c.board[to];
      if (!b) {
        c.board[to] = a;
        c.board[from] = null;
        return done("move", "", from, to);
      }
      if (a.item !== b.item) return blocked("Yalnızca iki aynı ürün birleşir.");
      const p = product(a.item),
        next = producers[p.producer]!.products[p.tier];
      if (!next) return blocked("Bu zincirin son ürünü.");
      if (!c.opened.includes(next.id))
        return blocked(`${next.name}: ürün alanını aç.`);
      c.board[from] = null;
      c.board[to] = tile(s, next.id);
      discover(next.id);
      return done("merge", next.name, from, to);
    }
    case "deliver": {
      const o = orders(base).find((o) => o.id === action.id);
      if (!o || !canDeliver(base, o))
        return blocked("İlanın ürünleri henüz hazır değil.");
      for (const r of o.requirements) {
        let n = r.quantity;
        for (let i = 0; i < 54 && n; i++)
          if (c.board[i]?.item === r.item_id) {
            c.board[i] = null;
            n--;
          }
        while (n) {
          const i = c.storage.findIndex((t) => t.item === r.item_id);
          c.storage.splice(i, 1);
          n--;
        }
      }
      if (intro[c.introIndex]?.id === o.id) c.introIndex++;
      else c.repeatIndex++;
      s.gold += o.gold;
      s.xp += o.xp;
      s.titles = Array.from(new Set([...s.titles, ...o.titles]));
      for (const id of new Set(
        o.requirements.map((r) => {
          const p = product(r.item_id);
          return p.producer === 0 || p.producer === 4
            ? "profession1"
            : "profession2";
        }),
      ))
        s.mastery[id] = (s.mastery[id] ?? 0) + o.xp;
      return done("reward", `+${o.gold} altın  ·  +${o.xp} XP`);
    }
    case "buy": {
      const p = producers.find((p) => p.id === action.id);
      if (!p || c.owned.includes(p.id)) return blocked("");
      if (level(s) < p.level) return blocked(`${p.level}. seviye gerekiyor.`);
      if (s.gold < p.price) return blocked(`${p.price} altın gerekiyor.`);
      s.gold -= p.price;
      c.owned.push(p.id);
      c.opened = Array.from(
        new Set([...c.opened, ...p.products.slice(0, 2).map((p) => p.id)]),
      );
      return done("unlock", `${p.name} açıldı.`);
    }
    case "unlock": {
      const p = product(action.id);
      if (!p || c.opened.includes(p.id)) return blocked("");
      const producer = producers[p.producer]!;
      if (!c.owned.includes(producer.id)) return blocked("Önce üreticiyi aç.");
      if (level(s) < p.level) return blocked(`${p.level}. seviye gerekiyor.`);
      if (p.tier > 1 && !c.opened.includes(producer.products[p.tier - 2]!.id))
        return blocked("Önce önceki basamağı aç.");
      if (s.gold < p.price) return blocked(`${p.price} altın gerekiyor.`);
      s.gold -= p.price;
      c.opened.push(p.id);
      return done("unlock", "Ürün alanı açıldı. Birleştirerek keşfet.");
    }
    case "store": {
      const t = c.board[action.index];
      if (!t) return blocked("");
      if (c.storage.length >= c.storageCapacity) return blocked("Depo dolu.");
      c.storage.push(t);
      c.board[action.index] = null;
      return done("tap", "Depoya gönderildi.");
    }
    case "restore": {
      const t = c.storage[action.index],
        i = c.board.indexOf(null);
      if (!t || i < 0) return blocked("Tahta dolu.");
      c.storage.splice(action.index, 1);
      c.board[i] = t;
      return done("move", "Tahtaya alındı.", undefined, i);
    }
    case "expand": {
      const factor = 1 + (c.storageCapacity - 12) / 4,
        cost = action.gems ? 5 * factor : 100 * factor;
      if (action.gems ? s.gems < cost : s.gold < cost)
        return blocked("Yeterli bakiye yok.");
      if (action.gems) s.gems -= cost;
      else s.gold -= cost;
      c.storageCapacity += 4;
      return done("unlock", "Depoya 4 alan eklendi.");
    }
    case "sound":
      s.sound = !s.sound;
      return done("tap", "");
    case "motion":
      s.reducedMotion = !s.reducedMotion;
      return done("tap", "");
  }
}
export function validateSave(value: unknown): value is Save {
  if (!value || typeof value !== "object") return false;
  const s = value as Save;
  const nonNegative = (v: unknown) =>
    typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
  const known = (id: unknown) =>
    typeof id === "string" && products.some((p) => p.id === id);
  const tileValid = (t: unknown): t is Tile =>
    !!t &&
    typeof t === "object" &&
    typeof (t as Tile).id === "string" &&
    known((t as Tile).item);
  if (
    s.schema !== 2 ||
    ![s.xp, s.gold, s.gems, s.stamina, s.serial].every(nonNegative) ||
    (s.staminaCapacity !== undefined &&
      (!nonNegative(s.staminaCapacity) || s.staminaCapacity < 100)) ||
    s.stamina > energyCap(s) ||
    (s.claimedAchievements !== undefined &&
      (!Array.isArray(s.claimedAchievements) ||
        !s.claimedAchievements.every((id) =>
          achievements.some((a) => a.id === id),
        ) ||
        new Set(s.claimedAchievements).size !==
          s.claimedAchievements.length)) ||
    !Number.isFinite(s.energyAt) ||
    !Array.isArray(s.discoveries) ||
    !s.discoveries.every(known) ||
    !Array.isArray(s.titles) ||
    !s.titles.every((t) => typeof t === "string") ||
    typeof s.sound !== "boolean" ||
    typeof s.reducedMotion !== "boolean" ||
    !s.mastery ||
    !Object.values(s.mastery).every(nonNegative) ||
    !s.cities?.[s.cityID]
  )
    return false;
  const identities: string[] = [];
  for (const c of Object.values(s.cities)) {
    if (
      !c ||
      !Array.isArray(c.board) ||
      c.board.length !== 54 ||
      !c.board.every((t) => t === null || tileValid(t)) ||
      !Array.isArray(c.storage) ||
      !c.storage.every(tileValid) ||
      !nonNegative(c.storageCapacity) ||
      c.storageCapacity < 12 ||
      c.storageCapacity < c.storage.length ||
      (c.powers !== undefined &&
        (!c.powers ||
          typeof c.powers !== "object" ||
          !Object.entries(c.powers).every(
            ([id, power]) =>
              producers.some((p) => p.id === id) &&
              Number.isInteger(power) &&
              power >= 1 &&
              power <= 4,
          ))) ||
      !nonNegative(c.introIndex) ||
      !nonNegative(c.repeatIndex) ||
      !Array.isArray(c.owned) ||
      !c.owned.every((id) => producers.some((p) => p.id === id)) ||
      !Array.isArray(c.opened) ||
      !c.opened.every(known) ||
      !c.batches ||
      !Object.values(c.batches).every(
        (b) =>
          b &&
          nonNegative(b.remaining) &&
          b.remaining <= 30 &&
          Number.isFinite(b.readyAt) &&
          b.readyAt >= 0,
      )
    )
      return false;
    identities.push(
      ...c.board.flatMap((t) => (t ? [t.id] : [])),
      ...c.storage.map((t) => t.id),
    );
  }
  return new Set(identities).size === identities.length;
}
export function visualFixture(now: number): Save {
  const s = fresh(now);
  s.xp = 172;
  s.gold = 750;
  s.gems = 12;
  s.stamina = 86;
  const c = city(s),
    p = producers;
  const a = p[0]!.products,
    b = p[1]!.products,
    d = p[2]!.products,
    e = p[3]!.products;
  const ids = [
    a[0]!,
    a[0]!,
    a[0]!,
    a[1]!,
    a[1]!,
    b[0]!,
    b[0]!,
    b[0]!,
    b[1]!,
    b[1]!,
    d[0]!,
    d[0]!,
    d[1]!,
    e[0]!,
    e[0]!,
    e[1]!,
    e[1]!,
    a[0]!,
  ];
  c.board = c.board.map((_, i) => (ids[i] ? tile(s, ids[i]!.id) : null));
  c.owned = p.slice(0, 4).map((p) => p.id);
  c.opened = p
    .slice(0, 4)
    .flatMap((p) => p.products.slice(0, 2).map((a) => a.id));
  s.discoveries = [...c.opened];
  c.introIndex = 1;
  c.repeatIndex = 1;
  c.batches[p[1]!.id] = { remaining: 0, readyAt: now + 135000 };
  return s;
}
