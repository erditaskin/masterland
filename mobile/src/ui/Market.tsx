import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useIAP, finishTransaction, type Purchase } from "expo-iap";
import {
  exchanges,
  storeProducts,
  type Save,
  type Action,
  type Result,
} from "../game/engine";
import { testModeEnabled } from "../game/testMode";
import { gameStore } from "../state/store";
import { ActionButton, Label } from "./Controls";
import { Sprite } from "./Art";
function TestStore() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const handling = useRef(new Set<string>());
  const completed = useRef(new Set<string>());
  const credit = useCallback(async (purchase: Purchase) => {
    const transactionId = purchase.transactionId;
    if (!transactionId || !("environmentIOS" in purchase)) return;
    if (
      handling.current.has(transactionId) ||
      completed.current.has(transactionId)
    )
      return;
    handling.current.add(transactionId);
    try {
      if (
        purchase.environmentIOS?.toLowerCase() !== "xcode" ||
        purchase.purchaseState !== "purchased"
      ) {
        setStatus("Yalnız Xcode StoreKit test işlemleri kabul edilir.");
        return;
      }
      const result = gameStore.dispatch({
        type: "storekit-credit",
        sku: purchase.productId,
        transaction: transactionId,
      });
      const credited = gameStore
        .get()
        .save.transactions?.includes(transactionId);
      if (!credited || !result) throw Error("Paket kaydedilemedi.");
      await gameStore.flush();
      await finishTransaction({ purchase, isConsumable: true });
      completed.current.add(transactionId);
      setStatus("Test paketi kaydedildi. Gerçek ödeme alınmadı.");
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "İşlem tamamlanamadı. Tekrar dene.",
      );
    } finally {
      handling.current.delete(transactionId);
      setBusy(false);
    }
  }, []);
  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: (p) => {
      void credit(p);
    },
    onPurchaseError: (e) => {
      setBusy(false);
      setStatus(
        e.code === "user-cancelled" ? "Satın alma iptal edildi." : e.message,
      );
    },
    onError: (e) => {
      setBusy(false);
      setStatus(e.message);
    },
  });
  useEffect(() => {
    if (connected)
      void fetchProducts({
        skus: storeProducts.map((p) => p.sku),
        type: "in-app",
      });
  }, [connected, fetchProducts]);
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const purchase of availablePurchases) void credit(purchase);
    }, 0);
    return () => clearTimeout(timer);
  }, [availablePurchases, credit]);
  return (
    <View style={{ gap: 8 }}>
      <Label title size={20}>
        StoreKit · Test paketleri
      </Label>
      <Label size={12}>
        Gerçek para alınmaz. Test ürünleri Xcode StoreKit oturumunda açılır.
      </Label>
      {storeProducts.map((offer) => {
        const item = products.find((p) => p.id === offer.sku);
        return (
          <View
            key={offer.sku}
            style={{
              padding: 12,
              backgroundColor: "#f9dfac",
              borderRadius: 12,
            }}
          >
            <Label title size={18}>
              {offer.title}
            </Label>
            <ActionButton
              text={
                busy
                  ? "İşlem bekleniyor…"
                  : item
                    ? `${item.displayPrice} · Test satın al`
                    : "Test mağazası bekleniyor"
              }
              testID={offer.sku}
              onPress={() => {
                if (!item || busy) {
                  setStatus(
                    "Bu test sürümünü Xcode StoreKit yapılandırmasıyla başlat.",
                  );
                  return;
                }
                setBusy(true);
                setStatus("");
                void requestPurchase({
                  request: { apple: { sku: offer.sku } },
                  type: "in-app",
                }).catch((e: Error) => {
                  setBusy(false);
                  setStatus(e.message);
                });
              }}
            />
          </View>
        );
      })}
      <ActionButton
        text="Bekleyen işlemleri kontrol et"
        onPress={() => {
          void getAvailablePurchases();
        }}
      />
      {!!status && <Label size={12}>{status}</Label>}
    </View>
  );
}
export function Market({
  save,
  dispatch,
}: {
  save: Save;
  dispatch: (a: Action) => Result | null;
}) {
  return (
    <View style={{ gap: 14 }}>
      <Label title size={23}>
        Gezginin Kesesi
      </Label>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Sprite kind="icons" index={6} size={36} />
        <Label title>{save.gold}</Label>
        <Sprite kind="icons" index={7} size={34} />
        <Label title>{save.gems}</Label>
      </View>
      <Label size={12}>Oyun içi paketler</Label>
      {exchanges.map((offer) => (
        <View
          key={offer.id}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#ffedc9",
            borderWidth: 1,
            borderColor: "#dec28d",
          }}
        >
          <Label title size={18}>
            {offer.title}
          </Label>
          <ActionButton
            testID={"exchange-" + offer.id}
            text={`${offer.gems ? offer.gems + " elmas" : offer.gold + " altın"} · Al`}
            onPress={() => dispatch({ type: "exchange", id: offer.id })}
          />
        </View>
      ))}
      {testModeEnabled ? (
        <TestStore />
      ) : (
        <Label size={12}>Gerçek para paketleri yakında.</Label>
      )}
    </View>
  );
}
