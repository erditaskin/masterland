import { accountText, languageStore } from "../i18n/locale";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { View } from "react-native";
import { useIAP, finishTransaction, type Purchase } from "expo-iap";
import {
  exchanges,
  storeProducts,
  type Save,
  type Action,
  type Result,
} from "../game/engine";
import { storeKitTestEnabled } from "../game/testMode";
import { gameStore } from "../state/store";
import { PaperCard } from "./PagePrimitives";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignText } from "./DesignSpace";
import { ChromeSprite } from "./GameChrome";
import { ActionButton, Label } from "./Controls";
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
  onEnergy,
}: {
  save: Save;
  dispatch: (a: Action) => Result | null;
  onEnergy: () => void;
}) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const format = new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US");
  return (
    <DesignContent end={storeKitTestEnabled ? 4600 : 2220}>
      <DesignText rect={[90, 740, 1026, 108]} size={66} bold align="center">
        Gezginin Kesesi
      </DesignText>
      <DesignText rect={[90, 860, 1026, 85]} size={44} bold align="center">
        {accountText(
          `${format.format(save.gold)} altın · ${format.format(save.gems)} elmas`,
          `${format.format(save.gold)} gold · ${format.format(save.gems)} gems`,
        )}
      </DesignText>
      {exchanges.map((offer, i) => {
        const y = 990 + i * 420;
        return (
          <Fragment key={offer.id}>
            <PaperCard designRect={[90, y, 1026, 380]} />
            <ChromeSprite
              index={offer.energy ? 5 : 6}
              rect={[125, y + 65, 250, 250]}
            />
            <DesignText rect={[410, y + 45, 660, 120]} size={68} bold>
              {offer.title}
            </DesignText>
            <ActionButton
              designRect={[410, y + 210, 660, 132]}
              testID={"exchange-" + offer.id}
              text={`${offer.gems ? offer.gems + " elmas" : offer.gold + " altın"} · Al`}
              onPress={() => dispatch({ type: "exchange", id: offer.id })}
            />
          </Fragment>
        );
      })}
      <DesignText rect={[114, 1850, 990, 120]} size={38} align="center">
        Gerçek para satışı bu sürümde kapalı.
      </DesignText>
      <ActionButton
        designRect={[90, 2030, 1026, 132]}
        text="Enerji hediyesi"
        tone="secondary"
        onPress={onEnergy}
      />
      {storeKitTestEnabled && (
        <DesignBox rect={[90, 2300, 1026, 2200]}>
          <TestStore />
        </DesignBox>
      )}
    </DesignContent>
  );
}
