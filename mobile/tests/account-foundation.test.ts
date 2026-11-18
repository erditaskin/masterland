import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAccountConfig } from "../src/account/config";
import { oauthCode } from "../src/account/oauthReturn";
import { createSecureSessionStorage } from "../src/account/secureStorage";
import { chooseLanguage, contentText, languageStore } from "../src/i18n/locale";
import { producers, product, fresh, city } from "../src/game/engine";
import english from "../../data/locales/en.json";
import reference from "../../data/content-reference.json";
const settings = {
  enabled: "true",
  environment: "test",
  url: "https://api-test.masterland.app",
};

test("backend defaults to offline and test builds cannot contact production", () => {
  assert.equal(resolveAccountConfig({}, true).enabled, false);
  assert.equal(resolveAccountConfig(settings, true).enabled, true);
  assert.equal(
    resolveAccountConfig({ ...settings, environment: "production" }, true)
      .error,
    "test-on-production",
  );
  assert.equal(
    resolveAccountConfig(
      {
        ...settings,
        environment: "production",
        url: "https://api.masterland.app",
      },
      false,
    ).enabled,
    true,
  );
  for (const url of [
    "http://api-test.masterland.app",
    "https://api-test.masterland.app.attacker.net",
    "https://api-test.masterland.app/path",
    "https://user:secret@api-test.masterland.app",
  ])
    assert.equal(
      resolveAccountConfig({ ...settings, url }, false).enabled,
      false,
    );
});

test("OAuth accepts only a single code on the exact callback URL", () => {
  const redirect = "masterland://auth/callback";
  assert.equal(oauthCode(redirect + "?code=valid", redirect), "valid");
  for (const url of [
    "https://auth/callback?code=bad",
    "masterland://evil/callback?code=bad",
    redirect + "-evil?code=bad",
    redirect,
    redirect + "?code=a&code=b",
    redirect + "?error=denied&code=a",
  ])
    assert.throws(() => oauthCode(url, redirect));
});

function vault() {
  const data = new Map<string, string>();
  let generation = 0;
  let failAfter = Infinity;
  const store = {
    getItemAsync: async (key: string) => data.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => {
      if (--failAfter < 0) throw Error("keychain failed");
      assert(Buffer.byteLength(value) < 2048);
      assert(
        ![...value].some(
          (point) => point.length === 1 && /[\uD800-\uDFFF]/.test(point),
        ),
        "No split Unicode surrogate may reach native storage",
      );
      data.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      data.delete(key);
    },
  };
  return {
    data,
    storage: createSecureSessionStorage(store, () => `id-${++generation}`),
    fail: (after: number) => {
      failAfter = after;
    },
  };
}
test("large Unicode sessions round-trip through encrypted chunks and sign-out removes them", async () => {
  const v = vault(),
    text = "a".repeat(399) + "🧙Türkçe-session".repeat(500);
  await v.storage.setItem("session", text);
  assert.equal(await v.storage.getItem("session"), text);
  assert(v.data.size > 2);
  await v.storage.removeItem("session");
  assert.equal(await v.storage.getItem("session"), null);
  assert.equal(v.data.size, 0);
});
test("failed chunk replacement preserves the previously committed session", async () => {
  const v = vault();
  await v.storage.setItem("session", "original");
  v.fail(1);
  await assert.rejects(v.storage.setItem("session", "new".repeat(1000)));
  assert.equal(await v.storage.getItem("session"), "original");
  assert.equal(v.data.size, 2);
});
test("simultaneous secure writes commit in order rather than mixing chunks", async () => {
  const v = vault();
  await Promise.all([
    v.storage.setItem("session", "first".repeat(1000)),
    v.storage.setItem("session", "second".repeat(1000)),
  ]);
  assert.equal(await v.storage.getItem("session"), "second".repeat(1000));
});
test("missing committed chunk is reported rather than returning a truncated token", async () => {
  const v = vault();
  await v.storage.setItem("session", "token");
  v.data.delete("session.id-1.0");
  await assert.rejects(v.storage.getItem("session"), /Incomplete/);
});
test("every existing content key has an English translation", () => {
  for (const key of Object.keys(reference.locales.tr))
    assert(Object.hasOwn(english, key.replace(/_tr$/, "")), key);
});
test("language changes resolve existing product objects without changing save identities", () => {
  const save = fresh(1),
    before = JSON.stringify(save),
    p = producers[0]!;
  languageStore.set("en");
  assert.equal(p.name, "Wheat Field");
  assert.equal(product("item1").name, "Wheat ear");
  assert.equal(
    contentText("achievement1_description"),
    "Deliver your first order and open the traveler’s chest.",
  );
  languageStore.set("tr");
  assert.equal(p.name, "Buğday Tarlası");
  assert.equal(JSON.stringify(save), before);
  assert.equal(city(save).board.length, 63);
});
test("language selection respects saved choice and normalizes device locales", () => {
  assert.equal(chooseLanguage("en", ["tr-TR"]), "en");
  assert.equal(chooseLanguage(null, ["tr_TR"]), "tr");
  assert.equal(chooseLanguage(null, ["de-DE"]), "en");
});

test("cloud snapshots reject another owner, future schema and corrupted inventory", async () => {
  const { readCloudRow, readWriteResult } =
    await import("../src/account/cloudProtocol");
  const row = {
    user_id: "player-1",
    schema_version: 1,
    revision: 2,
    payload: fresh(1),
    updated_at: "2026-11-16T10:00:00Z",
  };
  assert.equal(readCloudRow(row, "player-1").revision, 2);
  for (const invalid of [
    { ...row, user_id: "other" },
    { ...row, schema_version: 2 },
    { ...row, revision: -1 },
    { ...row, payload: {} },
    { ...row, updated_at: "bad" },
  ])
    assert.throws(() => readCloudRow(invalid, "player-1"));
  assert.deepEqual(readWriteResult({ kind: "conflict", revision: 0 }), {
    kind: "conflict",
    revision: 0,
  });
  assert.throws(() => readWriteResult({ kind: "saved", revision: 0 }));
  assert.throws(() => readWriteResult({ kind: "saved", revision: 1.5 }));
});

test("legacy screen translations preserve IDs, number values and Unicode boundaries", async () => {
  const { displayText } = await import("../src/i18n/display");
  assert.equal(displayText("Tahta", "en"), "Board");
  assert.equal(displayText("Tahtaya dön", "en"), "Back to the board");
  assert.equal(
    displayText("Seviye 12 · 6000 altın", "en"),
    "Level 12 · 6000 gold",
  );
  assert.equal(
    displayText("6000 altınla şehri aç", "en"),
    "Unlock city for 6000 gold",
  );
  assert.equal(
    displayText("12. seviyede açılacak.", "en"),
    "Unlocks at level 12.",
  );
  assert.equal(displayText("100’e 27:50", "en"), "100 in 27:50");
  assert.equal(displayText("Buğday Tarlası", "en"), "Wheat Field");
  assert.equal(displayText("Tahta", "tr"), "Tahta");
  assert.equal(displayText("city1 item1 12", "en"), "city1 item1 12");
  assert.equal(displayText("Tahta", "en"), "Board");
});

test("atlas achievement ranks and city labels have complete Turkish and English pairs", async () => {
  const { contentText, cityAchievementsTitle, earnedAchievementsLabel } =
    await import("../src/i18n/locale");
  const { displayText } = await import("../src/i18n/display");
  const tr = [
    "Hevesli",
    "Çırak",
    "Kalfa",
    "Uzman",
    "Üstat",
    "Usta",
    "Büyük Usta",
  ];
  const en = [
    "Novice",
    "Apprentice",
    "Journeyman",
    "Specialist",
    "Savant",
    "Master",
    "Grandmaster",
  ];
  tr.forEach((rank, index) => {
    assert.equal(contentText(`rank${index}_name`, "tr"), rank);
    assert.equal(contentText(`rank${index}_name`, "en"), en[index]);
    assert.equal(displayText(rank, "en"), en[index]);
  });
  assert.equal(cityAchievementsTitle("Yalıkoru", "tr"), "Yalıkoru Başarıları");
  assert.equal(
    cityAchievementsTitle("Timberbay", "en"),
    "Timberbay Achievements",
  );
  assert.equal(earnedAchievementsLabel(1, "en"), "1 achievement earned");
  assert.equal(earnedAchievementsLabel(2, "en"), "2 achievements earned");
  assert.equal(displayText("✓ Alındı", "en"), "✓ Claimed");
  assert.equal(displayText("Tümü ⌄", "en"), "All ⌄");
});
