import {
  advance,
  city,
  fresh,
  products,
  validateSave,
  type Save,
} from "./engine";
export function decodeLegacy(raw: unknown, now: number): Save {
  if (!raw || typeof raw !== "object") throw Error("Kayıt geçersiz.");
  const r = raw as Record<string, unknown>;
  if (r.schema !== 1) throw Error("Kayıt sürümü desteklenmiyor.");
  const s = fresh(now);
  for (const k of ["xp", "gold", "gems", "stamina"] as const) {
    if (typeof r[k] !== "number" || !Number.isFinite(r[k]))
      throw Error("Kayıt sayısı geçersiz.");
    s[k] = r[k];
  }
  s.energyAt =
    typeof r.energyAt === "number" ? (r.energyAt + 978307200) * 1000 : now;
  s.sound = r.sound !== false;
  s.reducedMotion = r.reducedMotion === true;
  for (const k of ["discoveries", "titles"] as const) {
    if (!Array.isArray(r[k]) || r[k].some((v) => typeof v !== "string"))
      throw Error("Kayıt dizisi geçersiz.");
    s[k] = r[k] as string[];
  }
  if (r.mastery && typeof r.mastery === "object")
    s.mastery = r.mastery as Record<string, number>;
  if (r.cityID !== "city1" || !r.cities || typeof r.cities !== "object")
    throw Error("Şehir kaydı geçersiz.");
  const c = (r.cities as Record<string, Record<string, unknown>>).city1!;
  if (
    !c ||
    !Array.isArray(c.board) ||
    c.board.length !== 54 ||
    !Array.isArray(c.storage)
  )
    throw Error("Tahta kaydı geçersiz.");
  const make = (item: unknown) => {
    if (typeof item !== "string" || !products.some((p) => p.id === item))
      throw Error("Bilinmeyen ürün.");
    return { id: "tile-" + ++s.serial, item };
  };
  const out = city(s);
  out.board = c.board.map((t) => (t === null ? null : make(t)));
  out.storage = c.storage.map(make);
  for (const k of ["owned", "opened"] as const) {
    if (!Array.isArray(c[k]) || c[k].some((v) => typeof v !== "string"))
      throw Error("Ürün alanı geçersiz.");
    out[k] = c[k] as string[];
  }
  for (const k of ["introIndex", "repeatIndex", "storageCapacity"] as const) {
    if (typeof c[k] !== "number" || !Number.isInteger(c[k]))
      throw Error("Şehir sayısı geçersiz.");
    out[k] = c[k] as number;
  }
  if (c.batches && typeof c.batches === "object")
    for (const [id, b] of Object.entries(
      c.batches as Record<string, { remaining: number; readyAt?: number }>,
    ))
      out.batches[id] = {
        remaining: b.remaining,
        readyAt: b.readyAt ? (b.readyAt + 978307200) * 1000 : 0,
      };
  if (!validateSave(s)) throw Error("Aktarılan kayıt doğrulanamadı.");
  return advance(s, now);
}
