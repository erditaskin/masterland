import { testModeEnabled } from "../game/testMode";
import { useEffect, useSyncExternalStore } from "react";
import { View } from "react-native";
import { energyAds, adsConfig } from "../ads/service";
import { accountText as tx, languageStore } from "../i18n/locale";
import type { Save } from "../game/engine";
import { AppButton, Divider, Label } from "./Controls";
export function EnergyAdPanel({
  save,
  producerID,
}: {
  save: Save;
  producerID?: string;
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
    if (producerID && !adsConfig.testAds) return;
    if (ad.canRequestAds && !ad.consentBusy && used < 4) void energyAds.load();
  }, [ad.canRequestAds, ad.consentBusy, used, producerID]);
  if (
    !ad.enabled ||
    (producerID && !adsConfig.testAds && !adsConfig.producerRewardedUnit)
  )
    return null;
  const previewOnly = adsConfig.testAds && !testModeEnabled;
  const showing = ad.phase === "showing" || ad.phase === "earned";
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
            : tx(
                "Test ödülü uygulandı.",
                "Test reward applied.",
              )}
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
          {ad.error === "offline"
            ? tx(
                "Reklam için internet gerekiyor.",
                "An internet connection is required.",
              )
            : tx(
                "Reklam hazırlanamadı. Hakkın korunuyor.",
                "The ad could not be prepared. No reward allowance was used.",
              )}
        </Label>
      )}
      <AppButton
        testID={producerID ? "watchProducerAd" : "watchEnergyAd"}
        disabled={
          used >= 4 ||
          ad.rewardPending ||
          ad.consentBusy ||
          showing ||
          ad.phase === "loading"
        }
        text={
          used >= 4
            ? tx("Bugünkü hediyeler tamamlandı", "Today's gifts are complete")
            : showing
              ? tx("Reklam gösteriliyor…", "Showing ad…")
              : ad.phase === "loading" || ad.consentBusy
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
  return (
    <View style={{ marginTop: 12 }}>
      <AppButton
        testID="adPrivacy"
        tone="secondary"
        disabled={ad.consentBusy}
        text={
          ad.privacyRequired
            ? tx("Reklam gizlilik tercihleri", "Ad privacy choices")
            : tx("Reklam izin bilgisini güncelle", "Refresh ad consent")
        }
        onPress={() => {
          void (ad.privacyRequired ? energyAds.privacy() : energyAds.start());
        }}
      />
    </View>
  );
}
