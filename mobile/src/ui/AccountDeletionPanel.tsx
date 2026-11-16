import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { accountStore, type LoginProvider } from "../account/auth";
import {
  accountDeletionEnabled,
  deleteCurrentAccount,
} from "../account/deletion";
import { accountText as tx, languageStore } from "../i18n/locale";
import { AppButton, AppCheckbox, Divider, Label } from "./Controls";
export function AccountDeletionPanel() {
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const [open, setOpen] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [verified, setVerified] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  if (!accountDeletionEnabled || !account.user) return null;
  return (
    <View>
      <Divider />
      <AppButton
        testID="openAccountDeletion"
        tone="muted"
        text={tx("Hesabımı sil", "Delete my account")}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View testID="accountDeletionConfirmation">
          <Label>
            {tx(
              "Bulut hesabın ve bu telefondaki ilerlemen silinecek. Bu işlem geri alınamaz. Aynı e-postayla daha sonra yeni bir hesap açabilirsin; eski ilerleme geri gelmez.",
              "Your cloud account and progress on this phone will be deleted. This cannot be undone. You can create a new account with the same email later; old progress will not return.",
            )}
          </Label>
          <AppCheckbox
            label={tx(
              "Hesabımı ve ilerlememi kalıcı olarak silmeyi onaylıyorum.",
              "I confirm permanent deletion of my account and progress.",
            )}
            checked={confirmed}
            onChange={() => setConfirmed(!confirmed)}
          />
          {account.user.identities
            ?.filter((i) =>
              account.user!.identities?.some(
                (identity) => identity.provider === "apple",
              )
                ? i.provider === "apple"
                : ["google", "facebook"].includes(i.provider),
            )
            .map((identity) => (
              <AppButton
                key={identity.provider}
                disabled={!confirmed || busy || account.busy}
                text={
                  tx("Yeniden giriş yap", "Sign in again") +
                  " · " +
                  identity.provider
                }
                onPress={() => {
                  const id = account.user!.id;
                  setBusy(true);
                  void accountStore
                    .signIn(identity.provider as LoginProvider, true)
                    .then((ok) => {
                      if (ok) setVerified(id);
                    })
                    .finally(() => setBusy(false));
                }}
              />
            ))}
          <AppButton
            testID="confirmAccountDeletion"
            tone="muted"
            disabled={
              !confirmed || verified !== account.user.id || busy || account.busy
            }
            text={tx("Kalıcı olarak sil", "Permanently delete")}
            onPress={() => {
              setBusy(true);
              void deleteCurrentAccount(true)
                .then((status) =>
                  setMessage(
                    status === "completed"
                      ? tx(
                          "Hesabın ve ilerlemen silindi.",
                          "Your account and progress were deleted.",
                        )
                      : tx(
                          "Hesap verilerin silindi. Sağlayıcı bağlantısının kaldırılması işleniyor.",
                          "Account data was deleted. Provider authorization removal is processing.",
                        ),
                  ),
                )
                .catch(() =>
                  setMessage(
                    tx(
                      "Silme tamamlanmadı. Tekrar deneyebilirsin.",
                      "Deletion has not completed. You can retry.",
                    ),
                  ),
                )
                .finally(() => setBusy(false));
            }}
          />
          {!!message && <Label>{message}</Label>}
        </View>
      )}
    </View>
  );
}
