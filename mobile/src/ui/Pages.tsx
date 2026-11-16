import { AccountPanel } from "./AccountPanel";
import { OrderGuide } from "./OrderGuide";
import { Market } from "./Market";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActionButton,
  AppCheckbox,
  AppCloseButton,
  Button,
  Divider,
  Label,
} from "./Controls";
import { Item, Sprite } from "./Art";
import { PagePaper, TitlePlaque } from "./Skin";
import {
  canDeliver,
  energyCapacityStep,
  energyUpgradeCost,
  city,
  count,
  level,
  name,
  orders,
  producers,
  cityProducers,
  product,
  type Action,
  type Save,
  type Result,
} from "../game/engine";
import { colors } from "./theme";
import { AchievementDetails } from "./Achievements";
import { ProducerDetails, ProducerPortrait } from "./ProducerDetails";
import { CityMap } from "./CityMap";
export type Page = {
  kind:
    | "collection"
    | "cities"
    | "storage"
    | "market"
    | "profile"
    | "orders"
    | "order-guide"
    | "producer"
    | "info"
    | "energy"
    | "achievement";
  index?: number;
  id?: string;
};
const titles = {
  collection: "Koleksiyon",
  cities: "Şehirler",
  storage: "Depo",
  market: "Market",
  profile: "Gezgin",
  orders: "Şehir İlanları",
  "order-guide": "Üretim Rehberi",
  producer: "Üretici",
  info: "Eşya",
  energy: "Dayanıklılık",
  achievement: "Özel Başarı",
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
  onInteract,
}: {
  page: Page;
  save: Save;
  width: number;
  height: number;
  close: () => void;
  dispatch: (a: Action) => Result | null;
  open: (p: Page) => void;
  reduced: boolean;
  onInteract: () => void;
}) {
  const routeOffset = useRef(0);
  const [bodyHeight, setBodyHeight] = useState(0);
  const insets = useSafeAreaInsets(),
    opacity = useMemo(() => new Animated.Value(reduced ? 1 : 0), [reduced]);
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: reduced ? 0 : 130,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduced]);
  const pageTop = Math.max(insets.top, 20) + 74;
  const w = width - 16,
    h = height - insets.bottom - 67 - pageTop,
    c = city(save),
    p = producers[page.index ?? 0]!;
  const isMap = page.kind === "cities";
  const bodyInset = isMap ? 0 : 12;
  const card = {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: "#fff0cfeb",
    shadowColor: "#835725",
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  } as const;
  const act = (a: Action) => dispatch(a);
  return (
    <Animated.View
      testID="fullScreenPage"
      pointerEvents="box-none"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
        opacity,
        paddingTop: pageTop,
        paddingBottom: 0,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          width: w,
          height: h,
          backgroundColor: "transparent",
          paddingHorizontal: isMap ? 0 : 20,
          paddingTop: 14,
          paddingBottom: isMap ? 42 : 20,
          borderRadius: 18,
        }}
      >
        <PagePaper width={w} height={h} rolled={isMap} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            minHeight: 44,
            gap: 8,
            marginBottom: isMap ? -6 : 4,
            marginHorizontal: isMap ? 20 : 0,
          }}
        >
          {!isMap && <TitlePlaque width={w - 92} height={44} />}
          <Label
            title
            size={isMap ? 26 : 21}
            color={isMap ? "#286331" : colors.goldLight}
            style={{ flex: 1, textAlign: "center" }}
          >
            {page.kind === "producer" ? p.name : titles[page.kind]}
          </Label>
          <AppCloseButton
            testID="closePage"
            onPress={() =>
              page.kind === "achievement" ? open({ kind: "cities" }) : close()
            }
          />
        </View>
        <View
          style={{
            height: isMap ? 0 : 1,
            backgroundColor: colors.outline,
            marginBottom: 0,
          }}
        />
        <View
          testID="pageContent"
          collapsable={false}
          style={{ flex: 1 }}
          onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}
        >
          <ScrollView
            testID="pageScroll"
            style={{ flex: 1 }}
            scrollEnabled={page.kind !== "cities"}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: bodyInset,
              paddingBottom: bodyInset,
            }}
          >
            {page.kind === "collection" && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Label title size={20}>
                    {name(save.cityID)}
                  </Label>
                  <Label size={12} color={colors.green}>
                    {
                      cityProducers(save)
                        .flatMap((producer) => producer.products)
                        .filter((item) => save.discoveries.includes(item.id))
                        .length
                    }{" "}
                    / {cityProducers(save).flatMap((p) => p.products).length}{" "}
                    keşif
                  </Label>
                </View>
                {cityProducers(save).map((producer) => (
                  <View key={producer.id} style={card}>
                    <Button
                      label={producer.name + " ürün alanları"}
                      onPress={() =>
                        open({
                          kind: "producer",
                          index: producers.indexOf(producer),
                        })
                      }
                      style={{ height: 44, marginBottom: 8 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          gap: 10,
                        }}
                      >
                        <ProducerPortrait
                          index={producers.indexOf(producer)}
                          size={38}
                        />
                        <Label title size={18} style={{ flex: 1 }}>
                          {producer.name}
                        </Label>
                        <Label size={25} color={colors.navy}>
                          ›
                        </Label>
                      </View>
                    </Button>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                    >
                      {producer.products.map((a) => (
                        <Button
                          key={a.id}
                          label={
                            save.discoveries.includes(a.id)
                              ? a.name
                              : "Keşfedilmedi"
                          }
                          onPress={() =>
                            open({
                              kind: "producer",
                              index: producers.indexOf(producer),
                            })
                          }
                          style={{
                            width: "22%",
                            minHeight: 78,
                            marginHorizontal: 2,
                            borderRadius: 12,
                            backgroundColor: save.discoveries.includes(a.id)
                              ? "#ffedbb"
                              : "#e8d3ae",
                            borderWidth: 1,
                            borderColor: "#e2c392",
                          }}
                        >
                          {save.discoveries.includes(a.id) ? (
                            <Item id={a.id} size={44} />
                          ) : (
                            <Label title size={38} color={colors.muted}>
                              ?
                            </Label>
                          )}
                          <Label
                            size={10}
                            color={
                              save.discoveries.includes(a.id)
                                ? colors.green
                                : colors.muted
                            }
                          >
                            {save.discoveries.includes(a.id)
                              ? "✓"
                              : `Seviye ${a.level}`}
                          </Label>
                        </Button>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}
            {page.kind === "order-guide" && page.id && (
              <OrderGuide key={page.id} id={page.id} save={save} />
            )}
            {page.kind === "producer" && (
              <ProducerDetails
                key={p.id}
                producer={p}
                index={page.index ?? 0}
                save={save}
                dispatch={dispatch}
              />
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
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {Array.from({ length: c.storageCapacity }, (_, i) => {
                    const t = c.storage[i];
                    return (
                      <Button
                        key={i}
                        label={t ? product(t.item).name : "Boş depo alanı"}
                        testID={"storage-" + i}
                        onPress={() => t && act({ type: "restore", index: i })}
                        style={{
                          width: "23%",
                          aspectRatio: 1,
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
                <View
                  key={o.id}
                  style={[
                    card,
                    canDeliver(save, o) && {
                      borderColor: "#58782d",
                      borderWidth: 2,
                      backgroundColor: "#91ad4e",
                      backgroundImage:
                        "linear-gradient(180deg, #b4ce78 0%, #86a847 100%)",
                    },
                  ]}
                >
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
                      <Label style={{ flex: 1 }}>
                        {product(r.item_id).name}
                      </Label>
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
                    text={`${canDeliver(save, o) ? "Ver ✓" : "Eksik ürün"} · ${o.gold} altın · ${o.xp} XP`}
                    onPress={() => act({ type: "deliver", id: o.id })}
                  />
                </View>
              ))}
            {page.kind === "cities" && (
              <CityMap
                width={w}
                save={save}
                height={Math.max(1, bodyHeight - bodyInset * 2)}
                onAchievement={(id) => open({ kind: "achievement", id })}
                initialOffset={() => routeOffset.current}
                onOffsetChange={(y) => {
                  routeOffset.current = y;
                }}
                onTravel={(id) => {
                  const result = dispatch({ type: "travel", id });
                  if (result?.kind === "tap") close();
                }}
                currentCity={save.cityID}
                onReturn={close}
                onInteract={onInteract}
                reduced={reduced}
              />
            )}
            {page.kind === "achievement" && page.id && (
              <AchievementDetails
                id={page.id}
                save={save}
                dispatch={dispatch}
                onReturn={() => open({ kind: "cities" })}
              />
            )}
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
                <AccountPanel />
                <Divider />
                {[
                  ["Ses", save.sound, "sound"],
                  ["Hareketi azalt", save.reducedMotion, "motion"],
                ].map(([label, value, kind]) => (
                  <AppCheckbox
                    key={String(kind)}
                    testID={"setting-" + kind}
                    label={String(label)}
                    checked={Boolean(value)}
                    onChange={() => act({ type: kind as "sound" | "motion" })}
                  />
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
                    {!producers[product(t.item).producer]!.products[
                      product(t.item).tier
                    ] && (
                      <Label size={14} color={colors.muted}>
                        Bu zincirin son ürünü. İlanlarda teslim edebilirsin.
                      </Label>
                    )}
                    <Divider />
                    <ActionButton
                      text="Depoya gönder"
                      testID="storeSelected"
                      onPress={() => {
                        const result = act({
                          type: "store",
                          index: page.index!,
                        });
                        if (result?.kind === "tap") close();
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
                    üzerine sürükle veya ona dokun.
                  </Label>
                );
              })()}
            {page.kind === "energy" && (
              <View style={{ alignItems: "center", paddingTop: 25 }}>
                <Sprite kind="icons" index={5} size={80} />
                <Label title size={32}>
                  {save.stamina}
                </Label>
                <Label style={{ marginTop: 12, textAlign: "center" }}>
                  Her iki dakikada 1 enerji, yalnızca 100’e kadar dolar. Ödül
                  enerjisi 100’ün üzerine eklenir. 100 ve altında üretim 1x
                  olur.
                </Label>
                <ActionButton
                  text={`+${energyCapacityStep} enerji · ${energyUpgradeCost(save)} elmas`}
                  testID="upgradeEnergyCapacity"
                  onPress={() => {
                    act({ type: "energy-capacity" });
                  }}
                />
                <ActionButton
                  text="Başarı hediyelerine git"
                  onPress={() => open({ kind: "cities" })}
                />
              </View>
            )}
            {page.kind === "market" && (
              <Market save={save} dispatch={dispatch} />
            )}
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
}
