import { testModeEnabled } from "../game/testMode";
import { useEffect, useSyncExternalStore } from "react";
import { Alert, View } from "react-native";
import { energyAds, adsConfig, type RewardedAdFailure } from "../ads/service";
import { accountText as tx, languageStore } from "../i18n/locale";
import type { Save } from "../game/engine";
import { AppButton, Divider, Label } from "./Controls";
import { EnergyGiftView } from "./EnergyGiftView";
function adFailureMessage(error: RewardedAdFailure) {
  switch (error) {
    case "offline":
      return tx("Reklam için internet gerekiyor.", "An internet connection is required.");
    case "cloud":
      return tx("Ödül için bulut kaydını eşitle. Hesap bölümünden kontrol edebilirsin.", "Sync your cloud save before earning rewards. Check the account page.");
    case "consent":
      return tx("Reklam izni doğrulanamadı. Hesap ayarlarından reklam izinlerini kontrol et.", "Could not verify ad consent. Check ad privacy in Account settings.");
    case "account":
      return tx("Misafir oturumu hazırlanamadı. Biraz sonra tekrar dene.", "Could not prepare the guest session. Try again shortly.");
    case "no-fill":
      return tx("Şu anda izlenebilir reklam yok. Biraz sonra tekrar dene.", "No ads are available right now. Try again shortly.");
    default:
      return tx("Reklam hazırlanamadı. Hakkın korunuyor.", "The ad could not be prepared. No reward allowance was used.");
  }
}
export function EnergyAdPanel({
  save,
  producerID,
  compact = false,
  page = false,
  onCancel = () => {},
  onBuy,
}: {
  save: Save;
  producerID?: string;
  compact?: boolean;
  page?: boolean;
  onCancel?: () => void;
  onBuy?: () => void;
}) {
  const ad = useSyncExternalStore(energyAds.subscribe, energyAds.get);
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const day = new Date().toISOString().slice(0, 10);
  const used = !testModeEnabled
    ? ad.dailyUsed
    : save.testAdRewards?.day === day
      ? save.testAdRewards.receipts.length
      : 0;
  useEffect(() => {
    // Live intents reserve shared quota; prepare them only after an explicit watch action.
    if (!adsConfig.testAds) return;
    if (ad.canRequestAds && !ad.consentBusy && used < 4) void energyAds.load();
  }, [ad.canRequestAds, ad.consentBusy, used, producerID]);
  if (
    !ad.enabled ||
    (producerID && !adsConfig.testAds && !adsConfig.producerRewardedUnit)
  )
    return page ? (
      <EnergyGiftView
        used={used}
        text="Reklam şu an kullanılamıyor"
        disabled
        onWatch={() => {}}
        onCancel={onCancel}
        purchase={onBuy ? { balance: save.gems, onPress: onBuy } : undefined}
      />
    ) : compact ? (
      <AppButton
        designRect={[0, 0, 966, 132]}
        text="Reklam şu an kullanılamıyor"
        tone="secondary"
        disabled
        onPress={() => {}}
      />
    ) : null;
  const previewOnly = adsConfig.testAds && !testModeEnabled;
  const showing = ad.phase === "showing" || ad.phase === "earned";
  const preparing = ad.requesting || ad.phase === "loading" || ad.consentBusy;
  if (page)
    return (
      <EnergyGiftView
        used={used}
        text={
          used >= 4
            ? "Bugünkü hediyeler tamamlandı"
            : showing
              ? "Reklam gösteriliyor…"
              : preparing
                ? "Hazırlanıyor…"
                : previewOnly
                  ? "Test reklamını önizle · ödülsüz"
                  : "Reklamı izle · +25 enerji"
        }
        disabled={
          used >= 4 ||
          ad.rewardPending ||
          showing ||
          preparing
        }
        message={
          ad.rewardPending
            ? "Ödülün doğrulanıyor. Bağlantı geldiğinde yeniden kontrol edilecek."
            : ad.error
              ? adFailureMessage(ad.error)
              : ad.rewardOutcome === "verified"
                ? "Ödül doğrulandı ve hesabına eklendi."
                : ad.rewardOutcome === "preview"
                  ? "Test reklamı tamamlandı. Bu önizleme ödül vermez."
                  : undefined
        }
        onWatch={() => {
          void energyAds.watch();
        }}
        onCancel={onCancel}
        purchase={onBuy ? { balance: save.gems, onPress: onBuy } : undefined}
      />
    );
  if (compact)
    return (
      <AppButton
        designRect={[0, 0, 966, 132]}
        testID="watchProducerAd"
        tone="secondary"
        text={
          used >= 4
            ? "Bugünkü hediyeler tamamlandı"
            : showing
              ? "Reklam gösteriliyor…"
              : preparing
                ? "Hazırlanıyor…"
                : previewOnly
                  ? "Test reklamını önizle · ödülsüz"
                  : ad.error
                    ? tx("Reklamı tekrar dene", "Retry ad")
                    : "Reklamla hazırla"
        }
        disabled={
          used >= 4 ||
          ad.rewardPending ||
          showing ||
          preparing
        }
        onPress={() => {
          void energyAds.watch(
            producerID ? { producerID, cityID: save.cityID } : undefined,
          );
        }}
      />
    );
  return (
    <View testID="energyAdPanel" style={{ width: "100%" }}>
      <Divider />
      <Label title>
        {adsConfig.testAds
          ? tx("Enerji hediyesi · test reklamı", "Energy gift · test ad")
          : producerID
            ? tx("Üretici hediyesi", "Producer gift")
            : tx("Enerji hediyesi", "Energy gift")}
      </Label>
      <Label size={12}>
        {tx(
          !testModeEnabled && adsConfig.testAds
            ? "Test reklamı önizlemesi. Bakiye ve günlük hak değişmez."
            : producerID
              ? "İsteğe bağlı reklamı tamamla, üreticiyi beklemeden hazırla."
              : "İsteğe bağlı reklamı tamamla, +25 enerji al.",
          !testModeEnabled && adsConfig.testAds
            ? "Test ad preview. Balance and daily allowance remain unchanged."
            : producerID
              ? "Complete an optional ad to refresh the producer without waiting."
              : "Complete an optional ad for +25 energy.",
        )}{" "}
        {testModeEnabled || !adsConfig.testAds ? `${used}/4` : ""}
      </Label>
      {ad.rewardOutcome && !showing && (
        <Label size={12}>
          {ad.rewardOutcome === "preview"
            ? tx(
                "Test reklamı tamamlandı. Bu önizleme ödül vermez.",
                "Test ad completed. This preview does not grant a reward.",
              )
            : ad.rewardOutcome === "verified"
              ? tx(
                  "Ödül doğrulandı ve hesabına eklendi.",
                  "Reward verified and added to your account.",
                )
              : tx("Test ödülü uygulandı.", "Test reward applied.")}
        </Label>
      )}
      {ad.needsAccount && (
        <Label size={12}>
          {tx(
            "Giriş gerekmez. Reklamı seçtiğinde misafir oturumun hazırlanır.",
            "No sign-in required. A guest session is prepared when you choose the ad.",
          )}
        </Label>
      )}
      {ad.rewardPending && (
        <Label size={12}>
          {tx(
            "Ödülün doğrulanıyor. Bağlantı geldiğinde yeniden kontrol edilecek.",
            "Your reward is being verified. It will be checked again when connected.",
          )}
        </Label>
      )}
      {ad.error && (
        <Label size={12}>
          {adFailureMessage(ad.error)}
        </Label>
      )}
      <AppButton
        testID={producerID ? "watchProducerAd" : "watchEnergyAd"}
        disabled={
          used >= 4 ||
          ad.rewardPending ||
          showing ||
          preparing
        }
        text={
          used >= 4
            ? tx("Bugünkü hediyeler tamamlandı", "Today's gifts are complete")
            : showing
              ? tx("Reklam gösteriliyor…", "Showing ad…")
              : preparing
                ? tx("Hazırlanıyor…", "Preparing…")
                : previewOnly
                  ? tx(
                      "Test reklamını önizle · ödülsüz",
                      "Preview test ad · no reward",
                    )
                  : producerID
                    ? tx(
                        "Reklamla üreticiyi hazırla",
                        "Watch ad to refresh producer",
                      )
                    : tx("Reklam · +25 enerji", "Ad · +25 energy")
        }
        onPress={() => {
          void energyAds.watch(
            producerID ? { producerID, cityID: save.cityID } : undefined,
          );
        }}
      />
    </View>
  );
}
export function AdPrivacyControl() {
  const ad = useSyncExternalStore(energyAds.subscribe, energyAds.get);
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  if (!ad.enabled) return null;
  const update = async () => {
    await energyAds.privacy();
    const current = energyAds.get();
    if (current.error === "consent") {
      Alert.alert(tx("Reklam gizliliği", "Ad privacy"), tx(
        "Reklam tercihleri açılamadı. Bağlantını kontrol edip tekrar dene.",
        "Ad preferences could not be opened. Check your connection and try again.",
      ));
    } else if (!current.privacyRequired) {
      Alert.alert(tx("Reklam gizliliği", "Ad privacy"), tx(
        "Google şu anda bu cihaz için değiştirilebilir reklam tercihleri sunmuyor.",
        "Google is not offering editable ad preferences for this device right now.",
      ));
    }
  };
  return (
    <View>
      <AppButton
        testID="adPrivacy"
        tone="secondary"
        disabled={ad.consentBusy}
        text={
          ad.consentBusy
            ? tx("Reklam izni kontrol ediliyor…", "Checking ad consent…")
            : tx("Reklam gizlilik tercihleri", "Ad privacy choices")
        }
        onPress={() => {
          void update();
        }}
      />
    </View>
  );
}
