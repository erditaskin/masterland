import { useSyncExternalStore } from "react";
import { View, useWindowDimensions } from "react-native";
import { deletionStore } from "../account/deletion";
import { accountText as tx, languageStore } from "../i18n/locale";
import { AppButton, Label } from "./Controls";
import { PagePaper } from "./Skin";
export function DeletionRecovery({ preview = false }: { preview?: boolean }) {
  const state = useSyncExternalStore(
    deletionStore.subscribe,
    deletionStore.get,
  );
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const { width, height } = useWindowDimensions();
  const phase = preview ? "offline" : state.phase;
  if (!["checking", "offline"].includes(phase)) return null;
  return (
    <View
      testID="deletionRecovery"
      accessibilityViewIsModal
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        backgroundColor: "#001d2be8",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          height: Math.min(height - 80, 320),
          padding: 30,
          justifyContent: "center",
        }}
      >
        <PagePaper width={width - 40} height={Math.min(height - 80, 320)} />
        <Label title size={22}>
          {tx("Silme talebin", "Your deletion request")}
        </Label>
        <Label style={{ marginVertical: 12 }}>
          {phase === "checking"
            ? tx(
                "Sunucudaki sonuç doğrulanıyor…",
                "Checking the server result…",
              )
            : tx(
                "Sonucu doğrulamak için internete bağlan. Kayıtların doğrulama gelmeden silinmeyecek.",
                "Connect to the internet to verify the result. Progress will only be erased after confirmation.",
              )}
        </Label>
        {phase === "offline" && (
          <AppButton
            testID="retryDeletionRecovery"
            text={tx("Tekrar dene", "Retry")}
            onPress={() => {
              void deletionStore.recover();
            }}
          />
        )}
      </View>
    </View>
  );
}
