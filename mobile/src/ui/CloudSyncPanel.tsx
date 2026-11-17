import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { cloudSync, cloudSyncEnabled } from "../account/cloudSync";
import { accountText as tx } from "../i18n/locale";
import { level } from "../game/engine";
import { gameStore } from "../state/store";
import { AppButton, Divider, Label } from "./Controls";
export function CloudSyncPanel() {
  const state = useSyncExternalStore(cloudSync.subscribe, cloudSync.get);
  const local = useSyncExternalStore(gameStore.subscribe, gameStore.get);
  const [choice, setChoice] = useState<"device" | "cloud" | null>(null);
  if (!cloudSyncEnabled || !state.ownerID) return null;
  return (
    <View testID="cloudSyncPanel">
      <Divider />
      <Label title size={18}>
        {tx("Bulut kaydı", "Cloud save")}
      </Label>
      <Label size={12}>
        {state.phase === "synced"
          ? tx(
              "İlerlemen buluta kaydedildi.",
              "Your progress is saved to the cloud.",
            )
          : state.phase === "choice"
            ? tx(
                "Hangi kayıtla devam etmek istiyorsun? Kaynaklar birleştirilmez.",
                "Which save do you want to continue with? Balances are not combined.",
              )
            : state.phase === "pending"
              ? tx(
                  "Eşitleme bekliyor. İlerlemen bu cihazda korunuyor.",
                  "Sync pending. Your progress is safe on this device.",
                )
              : tx("Bulut kaydı kontrol ediliyor…", "Checking cloud save…")}
      </Label>
      {state.phase === "choice" && (
        <>
          <Label>
            {tx("Bu cihaz", "This device")}: {tx("Seviye", "Level")}{" "}
            {level(local.save)} · {local.save.gold} {tx("altın", "gold")}
          </Label>
          <Label>
            {state.remote
              ? `${tx("Bulut", "Cloud")}: ${tx("Seviye", "Level")} ${level(state.remote.payload)} · ${state.remote.payload.gold} ${tx("altın", "gold")}`
              : tx(
                  "Bu hesapta henüz bulut kaydı yok.",
                  "This account has no cloud save yet.",
                )}
          </Label>
          <AppButton
            testID="cloudChooseDevice"
            disabled={state.busy}
            text={tx(
              "Bu cihazdaki kayıtla devam et",
              "Continue with this device save",
            )}
            onPress={() => setChoice("device")}
          />
          {state.remote && (
            <AppButton
              testID="cloudChooseRemote"
              tone="secondary"
              disabled={state.busy}
              text={tx(
                "Buluttaki kayıtla devam et",
                "Continue with cloud save",
              )}
              onPress={() => setChoice("cloud")}
            />
          )}
          {choice && (
            <View testID="cloudChoiceConfirmation">
              <Label size={12}>
                {choice === "device"
                  ? tx(
                      "Bu cihazdaki ilerleme hesaba kaydedilecek; varsa önceki bulut kaydının yerini alacak.",
                      "This device's progress will be saved to the account, replacing any existing cloud save.",
                    )
                  : tx(
                      "Bu cihazdaki oyun bulut kaydıyla değiştirilecek. Önce yerel güvenlik yedeği tutulur.",
                      "The game on this device will be replaced by the cloud save. A local safety backup is kept first.",
                    )}
              </Label>
              <AppButton
                testID="cloudConfirmChoice"
                disabled={state.busy}
                text={tx("Seçimimi onayla", "Confirm my choice")}
                onPress={() => {
                  setChoice(null);
                  void cloudSync.choose(choice);
                }}
              />
              <AppButton
                tone="muted"
                disabled={state.busy}
                text={tx("Vazgeç", "Cancel")}
                onPress={() => setChoice(null)}
              />
            </View>
          )}
        </>
      )}
      {state.phase !== "choice" && (
        <AppButton
          testID="cloudRetry"
          tone="secondary"
          disabled={state.busy}
          text={tx("Şimdi eşitle", "Sync now")}
          onPress={() => void cloudSync.retry()}
        />
      )}
    </View>
  );
}
