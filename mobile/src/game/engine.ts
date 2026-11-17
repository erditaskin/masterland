import {
  recordDelivery,
  deliveryProgress,
  validDeliveryProgress,
  type DeliveryProgress,
  type DeliveryRequirement,
} from "./deliveryProgress";
import { contentName } from "../i18n/locale";
import { storeKitTestEnabled, testModeEnabled } from "./testMode";
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
  cityID: string;
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
  city2_opening_plan: { producers: PlanRow[]; intro_quests: QuestRow[] };
};
export const name = contentName;
const plans = [data.city1_opening_plan, data.city2_opening_plan];
export const producers: Producer[] = plans
  .flatMap((plan, cityIndex) =>
    plan.producers.map((p) => ({ ...p, cityID: `city${cityIndex + 1}` })),
  )
  .map((p, i) => ({
    id: p.producer_id,
    get name() {
      return name(p.producer_id);
    },
    cityID: p.cityID,
    level: p.required_player_level,
    price: p.unlock_gold,
    products: p.product_unlocks.map((a) => ({
      id: a.item_id,
      get name() {
        return name(a.item_id);
      },
      producer: i,
      tier: a.tier,
      level: a.required_player_level,
      price: a.gold_cost,
    })),
  }));
export const products = producers.flatMap((p) => p.products);
export const product = (id: string) => products.find((p) => p.id === id)!;
const mapQuest = (q: QuestRow): Order => ({
  id: q.id,
  requirements: q.requirements,
  gold: q.reward_gold,
  xp: q.reward_xp,
  titles: q.grants_title_ids,
});
export const intro: Order[] =
  data.city1_opening_plan.intro_quests.map(mapQuest);
export const cityIntro = (s: Save) =>
  plans[Number(s.cityID.slice(4)) - 1]?.intro_quests.map(mapQuest) ?? [];
export const cityProducers = (s: Save) =>
  producers.filter((p) => p.cityID === s.cityID);
export const cityRules = reference.city_economy;
export const cityRule = (id: string) => cityRules.find((r) => r.id === id);
export interface RewardNotice {
  id: string;
  kind: "discovery" | "level" | "achievement" | "purchase";
  title: string;
  itemID?: string;
  message?: string;
  ornament?: "gift" | "title" | "xp" | "energy";
  gold: number;
  gems: number;
  energy: number;
  xp: number;
}
export function newCity(id: string): City {
  const first = producers.find((p) => p.cityID === id)!;
  return {
    board: Array(54).fill(null),
    storage: [],
    storageCapacity: 12,
    owned: [first.id],
    opened: first.products.slice(0, 2).map((p) => p.id),
    batches: {},
    introIndex: 0,
    repeatIndex: 0,
  };
}
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
  progressionVersion?: 2;
  testOnly?: boolean;
  xp: number;
  gold: number;
  gems: number;
  stamina: number;
  staminaCapacity?: number;
  claimedAchievements?: string[];
  deliveryProgress?: DeliveryProgress;
  energyAt: number;
  discoveries: string[];
  titles: string[];
  mastery: Record<string, number>;
  cityID: string;
  cities: Record<string, City>;
  sound: boolean;
  reducedMotion: boolean;
  serial: number;
  rewardQueue?: RewardNotice[];
  transactions?: string[];
  testAdRewards?: { day: string; receipts: string[] };
}
export const city = (s: Save) => s.cities[s.cityID]!;
const legacyThresholds = [0, 20, 60, 120, 200, 320, 480, 680, 920, 1200];
const thresholds = [0, 20, 60, 120, 320, 720, 1400, 2300, 3000, 3800];
function levelFloor(l: number, modern: boolean) {
  const values = modern ? thresholds : legacyThresholds;
  return l <= 10
    ? values[l - 1]!
    : values[9]! + (l - 10) * (modern ? 850 : 400);
}
export const level = (s: Save) => {
  const modern = s.progressionVersion === 2,
    values = modern ? thresholds : legacyThresholds;
  return s.xp >= values[9]!
    ? 10 + Math.floor((s.xp - values[9]!) / (modern ? 850 : 400))
    : values.filter((x) => s.xp >= x).length;
};
export const levelRange = (s: Save) => {
  const l = level(s),
    modern = s.progressionVersion === 2;
  return [levelFloor(l, modern), levelFloor(l + 1, modern)] as const;
};
export function fresh(now: number): Save {
  return {
    schema: 2,
    progressionVersion: 2,
    ...(testModeEnabled ? { testOnly: true } : {}),
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
  const opening = cityIntro(s)[c.introIndex];
  if (
    opening &&
    opening.requirements.every((r) =>
      c.owned.includes(producers[product(r.item_id).producer]!.id),
    )
  )
    result.push(opening);
  const available = cityProducers(s)
    .filter((p) => c.owned.includes(p.id))
    .flatMap((p) => p.products)
    .filter(
      (p) =>
        p.tier <= Math.min(5, 2 + Math.floor(l / 3)) ||
        s.discoveries.includes(p.id),
    );
  for (let i = 0; i < 5 && available.length; i++) {
    // Keep one quick, base-product order so expensive upper tiers cannot stall play.
    const quick = available.filter((p) => p.tier === 1);
    const groups = [...new Set(available.map((p) => p.producer))];
    const group = available.filter(
      (p) => p.producer === groups[(c.repeatIndex + i) % groups.length],
    );
    const p = (
        i === 0 && quick.length
          ? quick[c.repeatIndex % quick.length]
          : group[
              (c.repeatIndex + Math.floor(i / groups.length)) % group.length
            ]
      )!,
      m =
        s.mastery[
          p.producer === 0 || p.producer === 4 ? "profession1" : "profession2"
        ] ?? 0,
      q = 1 + Math.min(2, Math.floor(l / 5));
    const different = available.filter((item) => item.producer !== p.producer);
    const wanted = i === 0 || l < 3 ? 1 : i % 2 === 0 ? 3 : 2;
    const requirements = [{ item_id: p.id, quantity: q }];
    for (const candidate of [
      ...different.slice((c.repeatIndex + i) % Math.max(1, different.length)),
      ...different,
    ]) {
      if (requirements.length >= wanted) break;
      if (
        requirements.some(
          (r) => product(r.item_id).producer === candidate.producer,
        )
      )
        continue;
      requirements.push({ item_id: candidate.id, quantity: 1 });
    }
    result.push({
      id: `${s.cityID}-repeat-${c.repeatIndex}-${i}`,
      requirements,
      gold: requirements.reduce(
        (sum, r) =>
          sum +
          (12 * 2 ** (product(r.item_id).tier - 1) + Math.min(10, l)) *
            r.quantity,
        0,
      ),
      xp: requirements.reduce(
        (sum, r) =>
          sum +
          2 +
          product(r.item_id).tier +
          Math.min(4, Math.floor(l / 5)) +
          Math.min(2, Math.floor(m / 500)),
        0,
      ),
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
  | { type: "producer-refill"; id: string }
  | {
      type: "test-ad-reward";
      receipt: string;
      producerID?: string;
      cityID?: string;
    }
  | { type: "test-energy-fill" }
  | { type: "test-gold-add" }
  | { type: "test-gems-add" }
  | { type: "test-level-up" }
  | { type: "travel"; id: string }
  | { type: "dismiss-reward"; id: string }
  | { type: "exchange"; id: string }
  | { type: "storekit-credit"; sku: string; transaction: string }
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
    rewardQueue: [...(s.rewardQueue ?? [])],
    transactions: [...(s.transactions ?? [])],
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
export const productionBatchSize = 80;
export const productionCooldownMs = 120000;
export const productionPowerCosts = reference.energy_design.power_costs;
// Compatibility export: this is a passive refill limit, never a wallet capacity.
export const energyCap = (_s: Save) => 100;
export const energyUpgradeCost = (_s: Save) => 3;
export function energyCountdown(s: Save, now: number) {
  if (s.stamina >= 100) return "";
  const seconds = Math.max(
    0,
    Math.ceil(
      ((100 - s.stamina) * energyIntervalMs - (now - s.energyAt)) / 1000,
    ),
  );
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    sec = seconds % 60;
  return `${h ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
export const exchanges = [
  {
    id: "energy25",
    title: "25 enerji",
    gems: 3,
    gold: 0,
    energy: 25,
    grantGold: 0,
  },
  {
    id: "gold500",
    title: "500 altın",
    gems: 5,
    gold: 0,
    energy: 0,
    grantGold: 500,
  },
];
export const storeProducts = [
  {
    sku: "com.erditaskin.masterland.gems30",
    title: "30 elmas",
    gems: 30,
    gold: 0,
  },
  {
    sku: "com.erditaskin.masterland.gold2500",
    title: "2.500 altın",
    gems: 0,
    gold: 2500,
  },
];
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
  requirements?: DeliveryRequirement[];
  profession_id?: string;
  rank_id?: string;
  badge_id?: string;
  celebration?: {
    message?: string;
    ornament?: "gift" | "title" | "xp" | "energy";
  };
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
  if (a.requirements?.length) {
    const ratio = Math.min(
      ...a.requirements.map((requirement) =>
        requirement.target > 0
          ? deliveryProgress(
              s.deliveryProgress,
              a.city_id,
              requirement,
              (id) => producers[product(id)?.producer]?.id,
            ) / requirement.target
          : 0,
      ),
    );
    return Math.min(a.target, Math.floor(a.target * ratio));
  }
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
export function earnedBadges(s: Save) {
  return achievements
    .filter((a) => a.badge_id && (s.claimedAchievements ?? []).includes(a.id))
    .map((a) => ({
      achievementID: a.id,
      badgeID: a.badge_id!,
      titleID: a.reward.title,
      professionID: a.profession_id,
      rankID: a.rank_id,
      cityID: a.city_id,
    }));
}
export function achievementState(s: Save, a: Achievement) {
  if ((s.claimedAchievements ?? []).includes(a.id)) return "claimed";
  if (!a.enabled || !s.cities[a.city_id]) return "locked";
  if (
    a.requirements?.some(
      (r) =>
        !Number.isSafeInteger(r.target) ||
        r.target < 1 ||
        !r.producer_ids.length ||
        r.producer_ids.some(
          (id) => producers.find((p) => p.id === id)?.cityID !== a.city_id,
        ),
    )
  )
    return "locked";
  if (a.requirements?.length)
    return a.requirements.every(
      (requirement) =>
        deliveryProgress(
          s.deliveryProgress,
          a.city_id,
          requirement,
          (id) => producers[product(id)?.producer]?.id,
        ) >= requirement.target,
    )
      ? "ready"
      : "progress";
  return achievementProgress(s, a) >= a.target ? "ready" : "progress";
}
function grantEnergy(s: Save, _capacity: number, energy: number, now: number) {
  s.stamina += energy;
  if (s.stamina >= 100) s.energyAt = now;
}
export function migrateCurrentSave(s: Save, now: number): Save {
  const out = copySave(s);
  if (s.progressionVersion !== 2) {
    const oldLevel = level(s),
      [start, end] = levelRange(s);
    const progress = (s.xp - start) / (end - start);
    out.progressionVersion = 2;
    out.xp =
      levelFloor(oldLevel, true) +
      Math.floor(
        progress *
          (levelFloor(oldLevel + 1, true) - levelFloor(oldLevel, true)),
      );
  }
  if (testModeEnabled) out.testOnly = true;
  delete out.staminaCapacity;
  if (out.stamina >= 100) out.energyAt = now;
  return out;
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
      city(edit()).batches[id] = { remaining: productionBatchSize, readyAt: 0 };
  }
  return next ?? s;
}
/** Prefer scattered empty cells; a crowded board still accepts production. */
export function productionCell(
  board: City["board"],
  random = Math.random,
): number {
  const empty = board.flatMap((tile, i) => (tile ? [] : [i]));
  const spaced = empty.filter(
    (i) =>
      ![
        i - 6,
        i + 6,
        ...(i % 6 ? [i - 1] : []),
        ...(i % 6 < 5 ? [i + 1] : []),
      ].some((n) => n >= 0 && n < board.length && board[n] !== null),
  );
  const candidates = spaced.length ? spaced : empty;
  return candidates.length
    ? candidates[Math.floor(random() * candidates.length)]!
    : -1;
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
  ): Result => {
    for (let l = level(base) + 1; l <= level(s); l++) {
      const energy = l % 5 === 0 ? 20 : 10;
      grantEnergy(s, 0, energy, now);
      s.rewardQueue!.push({
        id: "level-" + l,
        kind: "level",
        title: `Seviye ${l}`,
        gold: 0,
        gems: 0,
        energy,
        xp: 0,
      });
    }
    return { state: s, kind, message, from, to };
  };
  const discover = (id: string) => {
    if (!s.discoveries.includes(id)) {
      s.discoveries.push(id);
      s.xp++;
      const gold = product(id).tier * 5,
        gems = diamond() ? 1 : 0;
      s.gold += gold;
      s.gems += gems;
      s.rewardQueue!.push({
        id: "discovery-" + id,
        kind: "discovery",
        title: "Yeni keşif!",
        itemID: id,
        gold,
        gems,
        energy: 0,
        xp: 1,
      });
    }
  };
  switch (action.type) {
    case "dismiss-reward": {
      if (s.rewardQueue?.[0]?.id !== action.id) return blocked("");
      s.rewardQueue.shift();
      return done("none", "");
    }
    case "travel": {
      const rule = cityRule(action.id);
      if (!rule?.enabled) return blocked("Bu şehir hazırlanıyor.");
      if (action.id === s.cityID) return blocked("");
      if (!s.cities[action.id]) {
        if (level(s) < rule.level)
          return blocked(`${rule.level}. seviye gerekiyor.`);
        if (s.gold < rule.gold) return blocked(`${rule.gold} altın gerekiyor.`);
        s.gold -= rule.gold;
        s.cities[action.id] = newCity(action.id);
      }
      s.cityID = action.id;
      return done("tap", name(action.id) + " şehrine hoş geldin.");
    }
    case "exchange": {
      const offer = exchanges.find((o) => o.id === action.id);
      if (!offer || s.gems < offer.gems || s.gold < offer.gold)
        return blocked("Yeterli bakiye yok.");
      s.gems -= offer.gems;
      s.gold += offer.grantGold - offer.gold;
      grantEnergy(s, 0, offer.energy, now);
      return done("reward", offer.title + " alındı.");
    }
    case "storekit-credit": {
      if (!storeKitTestEnabled) return blocked("Bu sürümde satın alma kapalı.");
      const offer = storeProducts.find((p) => p.sku === action.sku);
      if (
        !offer ||
        !action.transaction ||
        s.transactions!.includes(action.transaction)
      )
        return blocked("İşlem daha önce işlendi veya geçersiz.");
      s.transactions!.push(action.transaction);
      s.gold += offer.gold;
      s.gems += offer.gems;
      s.rewardQueue!.push({
        id: "purchase-" + action.transaction,
        kind: "purchase",
        title: "Test paketin hazır",
        gold: offer.gold,
        gems: offer.gems,
        energy: 0,
        xp: 0,
      });
      return done("reward", "StoreKit test paketi alındı.");
    }
    case "test-ad-reward": {
      if (!testModeEnabled) return blocked("Test modu kapalı.");
      if (!/^[0-9a-f-]{36}$/i.test(action.receipt))
        return blocked("Geçersiz test ödülü.");
      const day = new Date(now).toISOString().slice(0, 10);
      const receipts =
        s.testAdRewards?.day === day ? s.testAdRewards.receipts : [];
      if (receipts.includes(action.receipt)) return done("none", "");
      if (receipts.length >= 4)
        return blocked("Bugünkü reklam ödüllerin tamamlandı.");
      s.testAdRewards = { day, receipts: [...receipts, action.receipt] };
      if (action.producerID) {
        const p = producers.find(
          (p) => p.id === action.producerID && p.cityID === action.cityID,
        );
        const target = action.cityID ? s.cities[action.cityID] : null;
        if (!p || !target?.owned.includes(p.id))
          return blocked("Üretici bulunamadı.");
        target.batches[p.id] = { remaining: productionBatchSize, readyAt: 0 };
        return done("reward", "Test reklamı: üretici hazır.");
      }
      grantEnergy(s, 0, 25, now);
      return done("reward", "Test reklamı: +25 enerji kazandın.");
    }
    case "test-energy-fill": {
      if (!testModeEnabled) return blocked("Test modu kapalı.");
      s.stamina = Math.max(100, s.stamina);
      s.energyAt = now;
      return done("tap", "Test: enerji 100’e tamamlandı.");
    }
    case "test-level-up": {
      if (!testModeEnabled) return blocked("Test modu kapalı.");
      s.xp = levelRange(s)[1];
      return done("tap", `Test: seviye ${level(s)}.`);
    }
    case "test-gold-add":
    case "test-gems-add": {
      if (!testModeEnabled) return blocked("Test modu kapalı.");
      if (action.type === "test-gold-add") s.gold += 10000;
      else s.gems += 100;
      return done(
        "tap",
        action.type === "test-gold-add"
          ? "Test: 10.000 altın eklendi."
          : "Test: 100 elmas eklendi.",
      );
    }
    case "produce": {
      const p = producers.find((p) => p.id === action.id);
      if (!p || !c.owned.includes(p.id))
        return blocked("Önce bu üreticiyi aç.");
      if ((c.batches[p.id]?.readyAt ?? 0) > now)
        return blocked("Üretici hazırlanıyor.");
      const i = productionCell(c.board);
      if (i < 0) return blocked("Tahta dolu. Birleştir veya depoya gönder.");
      const plan = productionPlan(s, p);
      if (
        !plan.product ||
        (plan.product.tier > 1 && !s.discoveries.includes(plan.product.id))
      )
        return blocked("Güç modu için önce bu ürünü birleştirerek keşfet.");
      if (s.stamina < plan.cost) return blocked("Dayanıklılık yenileniyor.");
      if (s.stamina >= 100) s.energyAt = now;
      s.stamina -= plan.cost;
      const item = plan.product.id;
      c.board[i] = tile(s, item);
      const b = c.batches[p.id] ?? {
        remaining: productionBatchSize,
        readyAt: 0,
      };
      b.remaining--;
      if (b.remaining === 0) b.readyAt = now + productionCooldownMs;
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
      if (
        action.mode > 1 &&
        !s.discoveries.includes(p.products[action.mode - 1]!.id)
      )
        return blocked("Önce bu ürünü birleştirerek keşfet.");
      c.powers = { ...c.powers, [p.id]: action.mode };
      return done(
        "tap",
        `${productionPowerCosts[action.mode - 1]}x seçildi. 100 ve altında üretim 1x olur.`,
      );
    }
    case "producer-refill": {
      const p = producers.find((p) => p.id === action.id);
      if (
        !p ||
        !c.owned.includes(p.id) ||
        !((c.batches[p.id]?.readyAt ?? 0) > now)
      )
        return blocked("Üretici zaten hazır.");
      if (s.gems < 3) return blocked("3 elmas gerekiyor.");
      s.gems -= 3;
      c.batches[p.id] = { remaining: productionBatchSize, readyAt: 0 };
      return done("tap", "Üretici hazır.");
    }
    case "energy-capacity": {
      const cost = energyUpgradeCost(s);
      if (s.gems < cost) return blocked(`${cost} elmas gerekiyor.`);
      s.gems -= cost;
      grantEnergy(s, 0, 25, now);
      return done("unlock", "+25 enerji.");
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
      s.rewardQueue!.push({
        id: "achievement-" + a.id,
        kind: "achievement",
        title: name(a.id),
        message: a.celebration?.message,
        ornament: a.celebration?.ornament,
        gold: a.reward.gold ?? 0,
        gems: a.reward.gems ?? 0,
        energy: a.reward.energy ?? 0,
        xp: a.reward.xp ?? 0,
      });
      return done("reward", `${name(a.id)}: Ödüller alındı.`);
    }
    case "move": {
      const { from, to } = action;
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
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
      if (!c.opened.includes(next.id)) c.opened.push(next.id);
      c.board[from] = null;
      c.board[to] = tile(s, next.id);
      discover(next.id);
      return done("merge", "", from, to);
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
      if (cityIntro(s)[c.introIndex]?.id === o.id) c.introIndex++;
      else c.repeatIndex++;
      s.deliveryProgress = recordDelivery(
        s.deliveryProgress,
        s.cityID,
        o.requirements.map((r) => ({
          itemID: r.item_id,
          producerID: producers[product(r.item_id).producer]!.id,
          quantity: r.quantity,
        })),
      );
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
      if (!p || p.cityID !== s.cityID || c.owned.includes(p.id))
        return blocked("");
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
      return blocked(
        "Ürünleri satın alma; aynı iki ürünü birleştirerek keşfet.",
      );
    }
    case "store": {
      if (
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= 54
      )
        return blocked("");
      const t = c.board[action.index];
      if (!t) return blocked("");
      if (c.storage.length >= c.storageCapacity) return blocked("Depo dolu.");
      c.storage.push(t);
      c.board[action.index] = null;
      return done("tap", "Depoya gönderildi.");
    }
    case "restore": {
      if (
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= c.storage.length
      )
        return blocked("");
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
    (s.testAdRewards !== undefined &&
      (!s.testAdRewards ||
        !/^\d{4}-\d{2}-\d{2}$/.test(s.testAdRewards.day) ||
        !Array.isArray(s.testAdRewards.receipts) ||
        s.testAdRewards.receipts.length > 4 ||
        !s.testAdRewards.receipts.every(
          (id) => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id),
        ) ||
        new Set(s.testAdRewards.receipts).size !==
          s.testAdRewards.receipts.length)) ||
    (s.testOnly !== undefined && typeof s.testOnly !== "boolean") ||
    (s.deliveryProgress !== undefined &&
      !validDeliveryProgress(
        s.deliveryProgress,
        (id) => producers.find((p) => p.id === id)?.cityID,
        (id) => producers[product(id)?.producer]?.cityID,
      )) ||
    s.schema !== 2 ||
    (s.progressionVersion !== undefined && s.progressionVersion !== 2) ||
    ![s.xp, s.gold, s.gems, s.stamina, s.serial].every(nonNegative) ||
    (s.staminaCapacity !== undefined &&
      (!nonNegative(s.staminaCapacity) || s.staminaCapacity < 100)) ||
    (s.claimedAchievements !== undefined &&
      (!Array.isArray(s.claimedAchievements) ||
        !s.claimedAchievements.every((id) =>
          achievements.some((a) => a.id === id),
        ) ||
        new Set(s.claimedAchievements).size !==
          s.claimedAchievements.length)) ||
    (s.rewardQueue !== undefined &&
      (!Array.isArray(s.rewardQueue) ||
        !s.rewardQueue.every(
          (q) =>
            q &&
            typeof q.id === "string" &&
            typeof q.title === "string" &&
            ["discovery", "level", "achievement", "purchase"].includes(
              q.kind,
            ) &&
            [q.gold, q.gems, q.energy, q.xp].every(nonNegative) &&
            (!q.itemID || known(q.itemID)),
        ))) ||
    (s.transactions !== undefined &&
      (!Array.isArray(s.transactions) ||
        !s.transactions.every((id) => typeof id === "string") ||
        new Set(s.transactions).size !== s.transactions.length)) ||
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
          b.remaining <= productionBatchSize &&
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
