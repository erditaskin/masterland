import { useEffect, useSyncExternalStore } from "react";
import { View } from "react-native";
import { energyAds } from "../ads/service";
import { accountText as tx, languageStore } from "../i18n/locale";
import type { Save } from "../game/engine";
import { AppButton, Divider, Label } from "./Controls";
export function EnergyAdPanel({ save }: { save: Save }) {
  const ad = useSyncExternalStore(energyAds.subscribe, energyAds.get);
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const day = new Date().toISOString().slice(0, 10);
  const used =
    save.testAdRewards?.day === day ? save.testAdRewards.receipts.length : 0;
  useEffect(() => {
    if (ad.canRequestAds && !ad.consentBusy && used < 4) void energyAds.load();
  }, [ad.canRequestAds, ad.consentBusy, used]);
  if (!ad.enabled) return null;
  const showing = ad.phase === "showing" || ad.phase === "earned";
  return (
    <View testID="energyAdPanel" style={{ width: "100%" }}>
      <Divider />
      <Label title>
        {tx("Enerji hediyesi · test reklamı", "Energy gift · test ad")}
      </Label>
      <Label size={12}>
        {tx(
          "İsteğe bağlı reklamı tamamla, +15 enerji al.",
          "Complete an optional ad for +15 energy.",
        )}{" "}
        {used}/4
      </Label>
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
        testID="watchEnergyAd"
        disabled={
          used >= 4 || ad.consentBusy || showing || ad.phase === "loading"
        }
        text={
          used >= 4
            ? tx("Bugünkü hediyeler tamamlandı", "Today's gifts are complete")
            : ad.phase === "ready"
              ? tx("İzle · +15 enerji", "Watch · +15 energy")
              : tx("Reklamı hazırla", "Prepare ad")
        }
        onPress={() => {
          if (ad.phase === "ready") void energyAds.show();
          else if (!ad.canRequestAds) void energyAds.start();
          else void energyAds.load();
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
