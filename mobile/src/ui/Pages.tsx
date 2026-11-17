import { OrdersPage } from "./OrdersPage";
import { CollectionPage } from "./CollectionPage";
import { StoragePage } from "./StoragePage";
import { PageShell } from "./PageShell";
import { EnergyAdPanel } from "./EnergyAdPanel";
import { AccountPanel } from "./AccountPanel";
import { OrderGuide } from "./OrderGuide";
import { Market } from "./Market";
import { useRef, useState } from "react";
import { View } from "react-native";
import { ActionButton, AppCheckbox, Divider, Label } from "./Controls";
import { Item, Sprite } from "./Art";
import {
  energyCapacityStep,
  energyUpgradeCost,
  city,
  level,
  name,
  producers,
  product,
  type Action,
  type Save,
  type Result,
} from "../game/engine";
import { AchievementDetails } from "./Achievements";
import { ProducerDetails } from "./ProducerDetails";
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
  variant?: "producer" | "collection";
  index?: number;
  id?: string;
};
const titles = {
  collection: "Koleksiyon",
  cities: "Şehirler",
  storage: "Depo",
  market: "Market",
  profile: "Hesap",
  orders: "Şehir İlanları",
  "order-guide": "Üretim Rehberi",
  producer: "Üretici",
  info: "Eşya",
  energy: "Enerji hediyesi",
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
  const cityView = useRef({ cityID: save.cityID, achievements: false });
  const [bodyHeight, setBodyHeight] = useState(0);
  const w = width - 16,
    c = city(save),
    p = producers[page.index ?? 0]!;
  const act = (a: Action) => dispatch(a);
  return (
    <PageShell
      title={
        page.kind === "producer"
          ? page.variant === "collection"
            ? "Ürün zinciri"
            : p.name
          : titles[page.kind]
      }
      width={width}
      height={height}
      reduced={reduced}
      onClose={() =>
        page.kind === "achievement" ? open({ kind: "cities" }) : close()
      }
      routeKey={`${page.kind}:${page.variant ?? ""}:${page.id ?? page.index ?? ""}`}
      scroll={page.kind !== "cities"}
      onBodyHeight={setBodyHeight}
    >
      {page.kind === "collection" && (
        <CollectionPage
          save={save}
          width={w - 32}
          onProducer={(index) =>
            open({ kind: "producer", index, variant: "collection" })
          }
        />
      )}
      {page.kind === "order-guide" && page.id && (
        <OrderGuide key={page.id} id={page.id} save={save} />
      )}
      {page.kind === "producer" && (
        <ProducerDetails
          key={p.id}
          width={w - 32}
          variant={page.variant ?? "producer"}
          onProducer={() =>
            open({ kind: "producer", index: page.index, variant: "producer" })
          }
          producer={p}
          index={page.index ?? 0}
          save={save}
          dispatch={dispatch}
        />
      )}
      {page.kind === "storage" && (
        <StoragePage
          key={save.cityID}
          save={save}
          width={w - 32}
          dispatch={dispatch}
          onBoard={close}
        />
      )}
      {page.kind === "orders" && (
        <OrdersPage
          save={save}
          onDeliver={(id) => act({ type: "deliver", id })}
          onGuide={(id) => open({ kind: "order-guide", id })}
        />
      )}
      {page.kind === "cities" && (
        <CityMap
          width={w - 32}
          save={save}
          height={Math.max(1, bodyHeight)}
          onAchievement={(id) => open({ kind: "achievement", id })}
          initialView={() => cityView.current}
          onViewChange={(cityID, achievements) => {
            cityView.current = { cityID, achievements };
          }}
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
        <AccountPanel
          onClose={close}
          summary={
            <>
              <Label>
                Seviye {level(save)} · {name(save.cityID)}
              </Label>
              <Label size={12}>
                {save.xp} XP · {save.gold} altın
              </Label>
            </>
          }
          settings={
            <>
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
          }
        />
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
              <Label tone="muted">Basamak {product(t.item).tier}</Label>
              {!producers[product(t.item).producer]!.products[
                product(t.item).tier
              ] && (
                <Label size={14} tone="muted">
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
                text="Üreticiyi gör"
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
              Eşyayı seçmek için dokun. Birleştirmek için aynı eşyanın üzerine
              sürükle veya ona dokun.
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
            Her iki dakikada 1 enerji, yalnızca 100’e kadar dolar. Ödül enerjisi
            100’ün üzerine eklenir. 100 ve altında üretim 1x olur.
          </Label>
          <ActionButton
            text={`+${energyCapacityStep} enerji · ${energyUpgradeCost(save)} elmas`}
            testID="upgradeEnergyCapacity"
            onPress={() => {
              act({ type: "energy-capacity" });
            }}
          />
          <EnergyAdPanel save={save} />
          <ActionButton
            text="Başarı hediyelerine git"
            onPress={() => open({ kind: "cities" })}
          />
        </View>
      )}
      {page.kind === "market" && <Market save={save} dispatch={dispatch} />}
    </PageShell>
  );
}
