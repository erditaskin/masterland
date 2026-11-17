import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { accountStore, type LoginProvider } from "../account/auth";
import {
  accountDeletionEnabled,
  deletionStore,
  deleteCurrentAccount,
} from "../account/deletion";
import { accountText as tx, languageStore } from "../i18n/locale";
import { AppButton, AppCheckbox, Divider, Label } from "./Controls";
export function AccountDeletionPanel() {
  const deletion = useSyncExternalStore(
    deletionStore.subscribe,
    deletionStore.get,
  );
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
  if ((!accountDeletionEnabled && !deletion.hasJournal) || !account.user)
    return null;
  return (
    <View>
      {deletion.hasJournal && (
        <>
          <Label>
            {tx(
              "Silme talebin kayıtlı. Sonucu kontrol edebilir veya aşağıdan yeniden giriş yaparak tekrar deneyebilirsin.",
              "Your deletion request is saved. Check its status or sign in again below to retry.",
            )}
          </Label>
          <AppButton
            text={tx("Talep durumunu kontrol et", "Check request status")}
            onPress={() => {
              void deletionStore.recover();
            }}
          />
        </>
      )}
      <Divider />
      <AppButton
        testID="openAccountDeletion"
        tone="danger"
        text={tx("Hesabımı sil", "Delete my account")}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View testID="accountDeletionConfirmation">
          <Label>
            {account.user.is_anonymous
              ? tx(
                  "Bu misafir hesabı ve bu cihazdaki ilerlemen kalıcı olarak silinecek. Bu işlem geri alınamaz.",
                  "This guest account and progress on this device will be permanently deleted. This cannot be undone.",
                )
              : tx(
                  "Bulut hesabın ve bu telefondaki ilerlemen silinecek. Bu işlem geri alınamaz. Aynı e-postayla daha sonra yeni bir hesap açabilirsin; eski ilerleme geri gelmez.",
                  "Your cloud account and progress on this phone will be deleted. This cannot be undone. You can create a new account with the same email later; old progress will not return.",
                )}
          </Label>
          <AppCheckbox
            testID="confirmAccountDeletionConsent"
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
            tone="danger"
            disabled={
              !accountDeletionEnabled ||
              !confirmed ||
              (!account.user.is_anonymous && verified !== account.user.id) ||
              busy ||
              account.busy
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
                .catch(() => {
                  setVerified(null);
                  setMessage(
                    tx(
                      "Silme sonucu henüz doğrulanmadı. Yeniden giriş yapıp tekrar deneyebilirsin.",
                      "Deletion is not confirmed yet. Sign in again to retry.",
                    ),
                  );
                })
                .finally(() => setBusy(false));
            }}
          />
          {!!message && <Label>{message}</Label>}
        </View>
      )}
    </View>
  );
}
