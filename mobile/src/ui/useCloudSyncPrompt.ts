import { useEffect, useRef, useSyncExternalStore } from "react";
import { Alert } from "react-native";
import { accountStore } from "../account/auth";
import { cloudSync } from "../account/cloudSync";
import { accountText } from "../i18n/locale";

export function useCloudSyncPrompt() {
  const cloud = useSyncExternalStore(cloudSync.subscribe, cloudSync.get);
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  const discussed = useRef<string | null>(null);
  useEffect(() => {
    if (!cloud.ownerID) {
      discussed.current = null;
      return;
    }
    if (
      cloud.phase !== "choice" ||
      cloud.busy ||
      account.user?.id !== cloud.ownerID ||
      account.user.is_anonymous
    )
      return;
    const key = `${cloud.ownerID}:${cloud.remote?.revision ?? 0}`;
    if (discussed.current === key) return;
    discussed.current = key;
    const choose = (choice: "device" | "cloud") => {
      const current = cloudSync.get();
      if (
        current.ownerID === cloud.ownerID &&
        current.remote?.revision === cloud.remote?.revision
      )
        void cloudSync.choose(choice);
    };
    Alert.alert(
      accountText("Bu cihazdaki ilerleme", "Progress on this device"),
      accountText(
        "Bu cihazdaki ilerlemeni hesabına aktarmak ister misin?",
        "Would you like to use this device’s progress on your account?",
      ),
      [
        { text: accountText("Şimdi değil", "Not now"), style: "cancel" },
        ...(cloud.remote
          ? [
              {
                text: accountText(
                  "Hesaptakiyle devam et",
                  "Use account progress",
                ),
                onPress: () => choose("cloud"),
              },
            ]
          : []),
        {
          text: accountText("Evet, aktar", "Yes, transfer"),
          onPress: () => choose("device"),
        },
      ],
    );
  }, [account.user, cloud]);
}
