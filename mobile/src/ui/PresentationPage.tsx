import { AchievementDetails } from "./Achievements";
import { ProducerDetails } from "./ProducerDetails";
import { AppButton } from "./Controls";
import { OrdersPage } from "./OrdersPage";
import { OrderGuide } from "./OrderGuide";
import { useState } from "react";
import { View } from "react-native";
import {
  producers,
  type Order,
  type Save,
  type Action,
  type Result,
} from "../game/engine";
import { PageShell } from "./PageShell";
import { AccountView } from "./AccountView";
import { SaveChoiceView } from "./CloudSyncPanel";
import { AccountDeletionView } from "./AccountDeletionPanel";
import { EnergyGiftView } from "./EnergyGiftView";

/** Local-only story adapter. These are the same live views, with no account/ad service actions. */
export function PresentationPage({
  view,
  save,
  width,
  height,
  close,
  dispatch,
}: {
  view: string;
  save: Save;
  width: number;
  height: number;
  close: () => void;
  dispatch: (a: Action) => Result | null;
}) {
  const [choice, setChoice] = useState<"device" | "cloud" | null>("device");
  const noop = () => {};
  const product = (group: number, tier: number) =>
    producers[group]!.products[tier]!.id;
  const items: (Order & { title: string })[] = [
    {
      id: "presentation-order",
      title: "Günün hasadı",
      requirements: [
        { item_id: product(0, 1), quantity: 2 },
        { item_id: product(2, 0), quantity: 1 },
      ],
      gold: 32,
      xp: 8,
      titles: [],
    },
    {
      id: "presentation-order-2",
      title: "Fırın siparişi",
      requirements: [
        { item_id: product(1, 1), quantity: 2 },
        { item_id: product(2, 3), quantity: 1 },
      ],
      gold: 45,
      xp: 9,
      titles: [],
    },
    {
      id: "presentation-order-3",
      title: "Köyün ihtiyaçları",
      requirements: [
        { item_id: product(3, 0), quantity: 2 },
        { item_id: product(4, 0), quantity: 1 },
      ],
      gold: 26,
      xp: 6,
      titles: [],
    },
  ];

  const title = view.startsWith("account-")
    ? view === "account-deletion"
      ? "Hesabımı sil"
      : "Hesap"
    : view === "cloud-choice"
      ? "Bulut kaydı"
      : view === "orders"
        ? "Şehir İlanları"
        : view === "order-guide"
          ? "Üretim Rehberi"
          : view === "producer-cooldown"
            ? producers[0]!.name
            : view === "achievement"
              ? "Başarı"
              : "Enerji hediyesi";
  return (
    <>
      <PageShell
        title={title}
        width={width}
        height={height}
        onClose={close}
        reduced
        routeKey={view}
      >
        {view === "account-guest" ||
        view === "account-registered" ||
        view === "account-error" ? (
          <AccountView
            save={save}
            dispatch={dispatch}
            model={{
              registered: view === "account-registered",
              guestDeletionAvailable: false,
              name: view === "account-registered" ? "Deniz Kaya" : undefined,
              email:
                view === "account-registered" ? "deniz@example.com" : undefined,
              providers: view === "account-registered" ? "Apple" : undefined,
              appleAvailable: true,
              language: "tr",
              languageError: false,
              blocked: false,
              accountBusy: false,
              connectionEnabled: true,
              facebookEnabled: true,
              facebookVisible: true,
              ready: true,
              error: view === "account-error",
            }}
            actions={{
              close,
              deletion: noop,
              signOut: noop,
              signIn: noop,
              language: noop,
            }}
          />
        ) : view === "achievement" ? (
          <AchievementDetails
            id="achievement3"
            save={save}
            dispatch={dispatch}
            onReturn={close}
            description="Buğday Tarlası'nın 4 ürününü keşfet."
          />
        ) : view === "producer-cooldown" ? (
          <ProducerDetails
            save={save}
            producer={producers[0]!}
            index={0}
            width={width}
            dispatch={dispatch}
            onProducer={noop}
            displayNow={save.energyAt}
            adControl={
              <AppButton
                designRect={[0, 0, 966, 132]}
                text="Reklamla hazırla"
                tone="secondary"
                onPress={noop}
              />
            }
          />
        ) : view === "orders" ? (
          <OrdersPage
            save={save}
            items={items}
            onDeliver={noop}
            onGuide={noop}
          />
        ) : view === "order-guide" ? (
          <OrderGuide
            save={save}
            id="presentation-order"
            targetOrder={{
              ...items[0]!,
              requirements: [{ item_id: product(0, 1), quantity: 1 }],
            }}
            onBoard={close}
          />
        ) : view === "cloud-choice" ? (
          <SaveChoiceView
            local={save}
            remote={{ ...save, xp: 3800, gold: 1920, gems: 18 }}
            choice={choice}
            busy={false}
            onSelect={setChoice}
            onConfirm={noop}
            onCancel={close}
          />
        ) : view === "account-deletion" ? (
          <AccountDeletionView
            anonymous={false}
            canDelete={false}
            onDelete={noop}
            onCancel={close}
          />
        ) : (
          <EnergyGiftView
            used={2}
            text="Reklamı izle · +25 enerji"
            disabled={false}
            onWatch={noop}
            onCancel={close}
          />
        )}
      </PageShell>
      <View
        accessible
        accessibilityLabel={view}
        testID="presentationStory"
        style={{ position: "absolute", width: 1, height: 1 }}
      />
    </>
  );
}
