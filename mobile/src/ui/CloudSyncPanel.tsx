import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { cloudSync, cloudSyncEnabled } from "../account/cloudSync";
import { level, type Save } from "../game/engine";
import { gameStore } from "../state/store";
import { AppButton, Button } from "./Controls";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignImage, DesignText } from "./DesignSpace";
import { PaperCard } from "./PagePrimitives";
import { cityArt } from "./cityArt";

export function SaveChoiceView({
  local,
  remote,
  choice,
  busy,
  onSelect,
  onConfirm,
  onCancel,
}: {
  local: Save;
  remote?: Save;
  choice: "device" | "cloud" | null;
  busy: boolean;
  onSelect: (choice: "device" | "cloud") => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <DesignContent end={2310} testID="cloudSyncPanel">
      <DesignText rect={[120, 735, 966, 160]} size={58} bold align="center">
        Hangi kayıtla devam etmek istiyorsun?
      </DesignText>
      <DesignText rect={[120, 910, 966, 80]} size={41} align="center">
        Kaynaklar birleştirilmez.
      </DesignText>
      {(
        [
          { key: "device", title: "Bu cihaz", save: local },
          { key: "cloud", title: "Bulut", save: remote },
        ] as const
      ).map(({ key, title, save }, index) => {
        const y = 1030 + index * 380;
        return (
          <View key={key} pointerEvents="box-none">
            <PaperCard
              designRect={[90, y, 1026, 340]}
              selected={choice === key}
            />
            {save && (
              <DesignImage
                source={(cityArt[save.cityID] ?? cityArt.city1)!.scene}
                rect={[110, y + 20, 370, 300]}
                crop={[0, 130, 789, 430]}
                radius={25}
              />
            )}
            <DesignText rect={[520, y + 20, 545, 100]} size={58} bold>
              {title}
            </DesignText>
            <DesignText rect={[520, y + 135, 545, 180]} size={43}>
              {save
                ? `Seviye ${level(save)}\n${save.gold.toLocaleString("tr-TR")} altın\n${save.gems} elmas`
                : "Bu hesapta henüz bulut kaydı yok."}
            </DesignText>
            <DesignBox rect={[90, y, 1026, 340]}>
              <Button
                label={title}
                testID={
                  key === "device" ? "cloudChooseDevice" : "cloudChooseRemote"
                }
                selected={choice === key}
                disabled={busy || !save}
                onPress={() => onSelect(key)}
                style={{ flex: 1 }}
              >
                <View />
              </Button>
            </DesignBox>
          </View>
        );
      })}
      <DesignText rect={[120, 1830, 966, 150]} size={42} align="center">
        {choice === "cloud"
          ? "Bu cihazdaki oyun bulut kaydıyla değiştirilecek. Önce yerel güvenlik yedeği tutulur."
          : "Bu cihazdaki ilerleme buluta kaydedilecek."}
      </DesignText>
      <AppButton
        designRect={[90, 2030, 1026, 132]}
        text="Seçimimi onayla"
        testID="cloudConfirmChoice"
        disabled={busy || !choice}
        onPress={onConfirm}
      />
      <AppButton
        designRect={[250, 2190, 706, 96]}
        text="Vazgeç"
        tone="secondary"
        disabled={busy}
        onPress={onCancel}
      />
    </DesignContent>
  );
}

export function CloudSyncPanel({
  onCancel = () => {},
}: {
  onCancel?: () => void;
}) {
  const state = useSyncExternalStore(cloudSync.subscribe, cloudSync.get);
  const local = useSyncExternalStore(gameStore.subscribe, gameStore.get);
  const [choice, setChoice] = useState<"device" | "cloud" | null>(null);
  if (state.phase === "choice" && cloudSyncEnabled && state.ownerID)
    return (
      <SaveChoiceView
        local={local.save}
        remote={state.remote?.payload}
        choice={choice}
        busy={state.busy}
        onSelect={setChoice}
        onCancel={() => {
          setChoice(null);
          onCancel();
        }}
        onConfirm={() => {
          if (!choice || state.busy) return;
          setChoice(null);
          void cloudSync.choose(choice);
        }}
      />
    );
  return (
    <DesignContent end={1650}>
      <PaperCard
        designRect={[90, 730, 1026, 570]}
        selected={state.phase === "synced"}
      />
      <DesignText rect={[126, 770, 954, 280]} size={58} bold align="center">
        {!cloudSyncEnabled || !state.ownerID
          ? "Bulut kaydı için hesabını bağla."
          : state.phase === "synced"
            ? "İlerlemen buluta kaydedildi."
            : state.phase === "pending"
              ? "Eşitleme bekliyor. İlerlemen bu cihazda korunuyor."
              : "Bulut kaydı kontrol ediliyor…"}
      </DesignText>
      <AppButton
        designRect={[126, 1100, 954, 132]}
        text="Şimdi eşitle"
        testID="cloudRetry"
        tone="secondary"
        disabled={state.busy || !cloudSyncEnabled || !state.ownerID}
        onPress={() => {
          void cloudSync.retry();
        }}
      />
      <AppButton
        designRect={[90, 1400, 1026, 132]}
        text="Vazgeç"
        tone="secondary"
        onPress={onCancel}
      />
    </DesignContent>
  );
}
