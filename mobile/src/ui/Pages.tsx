import { CloudSyncPanel } from "./CloudSyncPanel";
import { AccountDeletionPanel } from "./AccountDeletionPanel";
import { ItemDetails } from "./ItemDetails";
import { OrdersPage } from "./OrdersPage";
import { CollectionPage } from "./CollectionPage";
import { StoragePage } from "./StoragePage";
import { PageShell } from "./PageShell";
import { EnergyAdPanel } from "./EnergyAdPanel";
import { AccountPanel } from "./AccountPanel";
import { OrderGuide } from "./OrderGuide";
import { Market } from "./Market";
import { useRef, useState } from "react";
import { Label } from "./Controls";
import {
  city,
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
    | "cloud"
    | "account-deletion"
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
  cloud: "Bulut kaydı",
  "account-deletion": "Hesabımı sil",
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
  achievement: "Başarı",
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
  presentationView,
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
  presentationView?: string | null;
}) {
  const routeOffset = useRef(0);
  const cityView = useRef({ cityID: save.cityID, achievements: false });
  const [bodyHeight, setBodyHeight] = useState(0);
  const [cityHeading, setCityHeading] = useState<string | null>(null);
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
          : page.kind === "cities" &&
              (cityHeading || presentationView === "achievements")
            ? (cityHeading ?? `${name(save.cityID)} Başarıları`)
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
      {page.kind === "cloud" && (
        <CloudSyncPanel onCancel={() => open({ kind: "profile" })} />
      )}
      {page.kind === "account-deletion" && (
        <AccountDeletionPanel onCancel={() => open({ kind: "profile" })} />
      )}
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
        <OrderGuide key={page.id} id={page.id} save={save} onBoard={close} />
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
          initialView={() =>
            presentationView === "achievements"
              ? { cityID: save.cityID, achievements: true }
              : cityView.current
          }
          onViewChange={(cityID, achievements) => {
            cityView.current = { cityID, achievements };
            setCityHeading(achievements ? `${name(cityID)} Başarıları` : null);
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
          save={save}
          dispatch={dispatch}
          onCloud={() => open({ kind: "cloud" })}
          onDeletion={() => open({ kind: "account-deletion" })}
        />
      )}
      {page.kind === "info" &&
        (() => {
          const t = c.board[page.index ?? -1];
          return t ? (
            <ItemDetails
              itemID={t.item}
              onStore={() => {
                const result = act({ type: "store", index: page.index! });
                if (result?.kind === "tap") close();
              }}
              onProducer={() =>
                open({ kind: "producer", index: product(t.item).producer })
              }
            />
          ) : (
            <Label>
              Eşyayı seçmek için dokun. Birleştirmek için aynı eşyanın üzerine
              sürükle veya ona dokun.
            </Label>
          );
        })()}
      {page.kind === "energy" && (
        <EnergyAdPanel save={save} page onCancel={close} />
      )}
      {page.kind === "market" && (
        <Market
          save={save}
          dispatch={dispatch}
          onEnergy={() => open({ kind: "energy" })}
        />
      )}
    </PageShell>
  );
}
