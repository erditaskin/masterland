import { useEffect, useMemo } from "react";
import { Animated, ScrollView, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton, Button, Divider, Label } from "./Controls";
import { Item, Sprite } from "./Art";
import { BoardFrame } from "./Skin";
import {
  city,
  count,
  level,
  name,
  orders,
  producers,
  product,
  type Action,
  type Save,
} from "../game/engine";
import { colors } from "./theme";
export type Page = {
  kind:
    | "collection"
    | "cities"
    | "storage"
    | "market"
    | "profile"
    | "orders"
    | "producer"
    | "info"
    | "energy";
  index?: number;
};
const titles = {
  collection: "Koleksiyon",
  cities: "Şehirler",
  storage: "Depo",
  market: "Market",
  profile: "Gezgin",
  orders: "Şehir İlanları",
  producer: "Üretici",
  info: "Eşya",
  energy: "Dayanıklılık",
};
export function Pages({
  page,
  save,
  width,
  height,
  close,
  dispatch,
  open,
  reduced,
}: {
  page: Page;
  save: Save;
  width: number;
  height: number;
  close: () => void;
  dispatch: (a: Action) => void;
  open: (p: Page) => void;
  reduced: boolean;
}) {
  const insets = useSafeAreaInsets(),
    opacity = useMemo(() => new Animated.Value(reduced ? 1 : 0), [reduced]);
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduced ? 0 : 130,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduced]);
  const w = width - 24,
    h = height - insets.top - insets.bottom - 12,
    c = city(save),
    p = producers[page.index ?? 0]!;
  const card = {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: "#fff4dc80",
  } as const;
  const act = (a: Action) => dispatch(a);
  return (
    <Animated.View
      testID="fullScreenPage"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#102638d9",
        opacity,
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 8,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          width: w,
          height: h,
          backgroundColor: "transparent",
          padding: 16,
          borderRadius: 18,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: 12,
            backgroundColor: colors.paper,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Label title size={27} style={{ flex: 1 }}>
            {page.kind === "producer" ? p.name : titles[page.kind]}
          </Label>
          <Button
            testID="closePage"
            label="Bitti"
            onPress={close}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#ead1a3",
            }}
          >
            <Label size={23}>×</Label>
          </Button>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: colors.outline,
            marginHorizontal: 14,
          }}
        />
        <ScrollView
          testID="pageScroll"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 14, paddingBottom: 24 }}
        >
          {page.kind === "collection" && (
            <>
              <Label title size={21} style={{ marginBottom: 16 }}>
                {name(save.cityID)}
              </Label>
              {producers.map((producer, i) => (
                <View key={producer.id} style={card}>
                  <Label title size={20} style={{ marginBottom: 10 }}>
                    {producer.name}
                  </Label>
                  <View style={{ flexDirection: "row" }}>
                    {producer.products.map((a) => (
                      <Button
                        key={a.id}
                        label={
                          save.discoveries.includes(a.id)
                            ? a.name
                            : "Keşfedilmedi"
                        }
                        onPress={() => open({ kind: "producer", index: i })}
                        style={{
                          width: "25%",
                          minHeight: 100,
                          paddingHorizontal: 2,
                        }}
                      >
                        {save.discoveries.includes(a.id) ? (
                          <Item id={a.id} size={52} />
                        ) : (
                          <Label title size={38} color={colors.muted}>
                            ?
                          </Label>
                        )}
                        <Label
                          size={11}
                          style={{ textAlign: "center", marginTop: 5 }}
                        >
                          {save.discoveries.includes(a.id)
                            ? a.name
                            : `Seviye ${a.level}`}
                        </Label>
                        <Label size={10} color={colors.muted}>
                          Depo:{" "}
                          {c.storage.filter((t) => t.item === a.id).length}
                        </Label>
                      </Button>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
          {page.kind === "producer" && (
            <>
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                <Label title size={23}>
                  {p.name}
                </Label>
                <Label size={13} color={colors.muted}>
                  {c.owned.includes(p.id)
                    ? "Üretim alanları"
                    : "Yeni bir üretici"}
                </Label>
              </View>
              {!c.owned.includes(p.id) && (
                <ActionButton
                  testID="buyProducer"
                  text={`Aç · ${p.price} altın · Seviye ${p.level}`}
                  onPress={() => act({ type: "buy", id: p.id })}
                />
              )}{" "}
              {p.products.map((a) => (
                <View
                  key={a.id}
                  style={[
                    card,
                    { flexDirection: "row", alignItems: "center", gap: 10 },
                  ]}
                >
                  {save.discoveries.includes(a.id) ? (
                    <Item id={a.id} size={48} />
                  ) : (
                    <View style={{ width: 48, alignItems: "center" }}>
                      <Label title size={35} color={colors.muted}>
                        ?
                      </Label>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Label size={14}>{a.name}</Label>
                    <Label size={11} color={colors.muted}>
                      Basamak {a.tier} · Seviye {a.level}
                    </Label>
                  </View>
                  {c.opened.includes(a.id) ? (
                    <Label size={12} color={colors.green}>
                      Açık
                    </Label>
                  ) : (
                    <ActionButton
                      testID={"unlock-" + a.id}
                      text={`${a.price} altın`}
                      onPress={() => act({ type: "unlock", id: a.id })}
                    />
                  )}
                </View>
              ))}
            </>
          )}
          {page.kind === "storage" && (
            <>
              <Label
                size={14}
                color={colors.muted}
                style={{ marginBottom: 14 }}
              >
                {c.storage.length} / {c.storageCapacity} alan ·{" "}
                {name(save.cityID)}
              </Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {Array.from({ length: c.storageCapacity }, (_, i) => {
                  const t = c.storage[i];
                  return (
                    <Button
                      key={i}
                      label={t ? product(t.item).name : "Boş depo alanı"}
                      testID={"storage-" + i}
                      onPress={() => t && act({ type: "restore", index: i })}
                      style={{
                        width: 58,
                        height: 64,
                        backgroundColor: "#ead4ac",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.outline,
                      }}
                    >
                      {t && <Item id={t.item} size={51} />}
                    </Button>
                  );
                })}
              </View>
              <Divider />
              <ActionButton
                text={`+4 alan · ${100 * (1 + (c.storageCapacity - 12) / 4)} altın`}
                onPress={() => act({ type: "expand", gems: false })}
              />
              <ActionButton
                text={`+4 alan · ${5 * (1 + (c.storageCapacity - 12) / 4)} elmas`}
                onPress={() => act({ type: "expand", gems: true })}
              />
            </>
          )}
          {page.kind === "orders" &&
            orders(save).map((o) => (
              <View key={o.id} style={card}>
                {o.requirements.map((r) => (
                  <View
                    key={r.item_id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Item id={r.item_id} size={48} />
                    <Label style={{ flex: 1 }}>{product(r.item_id).name}</Label>
                    <Label
                      color={
                        count(save, r.item_id) >= r.quantity
                          ? colors.green
                          : colors.muted
                      }
                    >
                      {Math.min(count(save, r.item_id), r.quantity)} /{" "}
                      {r.quantity}
                    </Label>
                  </View>
                ))}
                <ActionButton
                  text={`Teslim et · ${o.gold} altın · ${o.xp} XP`}
                  onPress={() => act({ type: "deliver", id: o.id })}
                />
              </View>
            ))}
          {page.kind === "cities" &&
            [
              { id: "city1", level: 1, role: "Çiftlikler ve fırınlar" },
              { id: "city2", level: 2, role: "Pastalar ve tatlılar" },
              { id: "city3", level: 5, role: "Balıkçılık ve marangozluk" },
            ].map((a) => (
              <View key={a.id} style={card}>
                <Label title size={23}>
                  {name(a.id)}
                </Label>
                <Label color={colors.muted}>{a.role}</Label>
                <Label size={12} style={{ marginTop: 8 }}>
                  {a.id === save.cityID
                    ? "Buradasın"
                    : level(save) >= a.level
                      ? "Yolculuk hazırlanıyor"
                      : `${a.level}. seviyede açılır`}
                </Label>
              </View>
            ))}
          {page.kind === "profile" && (
            <>
              <Label title size={25}>
                Seviye {level(save)}
              </Label>
              <Label color={colors.muted}>
                {save.xp} XP · {save.gold} altın
              </Label>
              <Divider />
              <Label title size={20}>
                Unvanlar
              </Label>
              {save.titles.length ? (
                save.titles.map((id) => (
                  <Label key={id} style={{ marginVertical: 4 }}>
                    {name(id)}
                  </Label>
                ))
              ) : (
                <Label color={colors.muted}>
                  İlanlarla yolculuğunu ilerlet.
                </Label>
              )}
              <Divider />
              {[
                ["Ses", save.sound, "sound"],
                ["Hareketi azalt", save.reducedMotion, "motion"],
              ].map(([label, value, kind]) => (
                <View
                  key={String(kind)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 50,
                  }}
                >
                  <Label>{String(label)}</Label>
                  <Switch
                    testID={"setting-" + kind}
                    value={Boolean(value)}
                    onValueChange={() =>
                      act({ type: kind as "sound" | "motion" })
                    }
                    trackColor={{ true: colors.green }}
                  />
                </View>
              ))}
            </>
          )}
          {page.kind === "info" &&
            (() => {
              const t = c.board[page.index ?? -1];
              return t ? (
                <View style={{ alignItems: "center" }}>
                  <Item id={t.item} size={115} />
                  <Label title size={25}>
                    {product(t.item).name}
                  </Label>
                  <Label color={colors.muted}>
                    Basamak {product(t.item).tier}
                  </Label>
                  <Divider />
                  <ActionButton
                    text="Depoya gönder"
                    testID="storeSelected"
                    onPress={() => {
                      act({ type: "store", index: page.index! });
                      close();
                    }}
                  />
                  <ActionButton
                    text="Üreticiyi geliştir"
                    onPress={() =>
                      open({
                        kind: "producer",
                        index: product(t.item).producer,
                      })
                    }
                  />
                </View>
              ) : (
                <Label>
                  Eşyayı seçmek için dokun. Birleştirmek için aynı eşyanın
                  üzerine sürükle.
                </Label>
              );
            })()}
          {page.kind === "energy" && (
            <View style={{ alignItems: "center", paddingTop: 25 }}>
              <Sprite kind="icons" index={5} size={80} />
              <Label title size={32}>
                {save.stamina} / 100
              </Label>
              <Label style={{ marginTop: 12, textAlign: "center" }}>
                Her üretim bir dayanıklılık kullanır.{"\n"}İki dakikada bir
                yenilenir.
              </Label>
            </View>
          )}
          {page.kind === "market" && (
            <>
              <Label title size={24}>
                Gezginin Kesesi
              </Label>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginVertical: 14,
                }}
              >
                <Sprite kind="icons" index={6} size={42} />
                <Label size={19}>{save.gold}</Label>
                <Sprite kind="icons" index={7} size={42} />
                <Label size={19}>{save.gems}</Label>
              </View>
              <Label color={colors.muted}>Yeni tezgâhlar yakında burada.</Label>
            </>
          )}
        </ScrollView>
        <BoardFrame width={w} height={h} />
      </View>
    </Animated.View>
  );
}
