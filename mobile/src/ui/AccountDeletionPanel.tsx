import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { accountStore, type LoginProvider } from "../account/auth";
import {
  accountDeletionEnabled,
  deletionStore,
  deleteCurrentAccount,
} from "../account/deletion";
import { accountText as tx, languageStore } from "../i18n/locale";
import { AppButton, AppCheckbox } from "./Controls";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { PaperCard } from "./PagePrimitives";

export function AccountDeletionView({
  anonymous,
  providers,
  confirmed,
  canVerify,
  canDelete,
  message,
  onConsent,
  onVerify,
  onDelete,
  onCancel,
  pending = false,
  onCheck,
}: {
  anonymous: boolean;
  providers: string[];
  confirmed: boolean;
  canVerify: boolean;
  canDelete: boolean;
  message?: string;
  onConsent: () => void;
  onVerify: (provider: LoginProvider) => void;
  onDelete: () => void;
  onCancel: () => void;
  pending?: boolean;
  onCheck?: () => void;
}) {
  const shift = pending ? 200 : 0;
  const extra = Math.max(0, providers.length - 1) * 160 + shift;
  return (
    <DesignContent
      end={message ? 2640 + extra : 2320 + extra}
      testID="accountDeletionConfirmation"
    >
      <DesignText
        rect={[90, 750, 1026, 130]}
        size={76}
        bold
        color="#a93929"
        align="center"
      >
        Hesabımı sil
      </DesignText>
      <PaperCard designRect={[90, 950, 1026, 370]} danger />
      <DesignText
        rect={[140, 980, 926, 300]}
        testID="deletionWarning"
        size={56}
        bold
        color="#a93929"
        align="center"
      >
        {anonymous
          ? "Bu misafir hesabı ve bu cihazdaki ilerlemen kalıcı olarak silinecek.\nBu işlem geri alınamaz."
          : "Bulut hesabın ve bu cihazdaki ilerlemen silinecek.\nBu işlem geri alınamaz."}
      </DesignText>
      {pending && (
        <AppButton
          designRect={[90, 1370, 1026, 132]}
          text="Silme talebi: sonucu kontrol et"
          tone="secondary"
          testID="checkDeletionStatus"
          onPress={() => onCheck?.()}
        />
      )}
      <PaperCard designRect={[90, 1380 + shift, 1026, 260]} />
      <AppCheckbox
        designRect={[120, 1400 + shift, 945, 220]}
        checkPosition="left"
        label="Hesabımı ve ilerlememi kalıcı olarak silmeyi onaylıyorum."
        testID="confirmAccountDeletionConsent"
        checked={confirmed}
        onChange={onConsent}
      />
      {providers.map((provider, index) => (
        <AppButton
          key={provider}
          designRect={[90, 1720 + shift + index * 160, 1026, 132]}
          text={`${provider === "apple" ? "Apple" : provider === "google" ? "Google" : "Facebook"} ile yeniden doğrula`}
          disabled={!canVerify}
          onPress={() => onVerify(provider as LoginProvider)}
        />
      ))}
      <AppButton
        designRect={[90, 1910 + extra, 1026, 132]}
        text="Kalıcı olarak sil"
        testID="confirmAccountDeletion"
        disabled={!canDelete}
        onPress={onDelete}
      />
      <AppButton
        designRect={[90, 2140 + extra, 1026, 132]}
        text="Vazgeç"
        tone="secondary"
        onPress={onCancel}
      />
      {message && (
        <DesignText rect={[90, 2330 + extra, 1026, 260]} size={42}>
          {message}
        </DesignText>
      )}
    </DesignContent>
  );
}

export function AccountDeletionPanel({ onCancel }: { onCancel: () => void }) {
  const deletion = useSyncExternalStore(
    deletionStore.subscribe,
    deletionStore.get,
  );
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const [confirmed, setConfirmed] = useState(false),
    [verified, setVerified] = useState<string | null>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const user = account.user;
  if ((!accountDeletionEnabled && !deletion.hasJournal) || !user)
    return (
      <DesignContent end={1250}>
        <DesignText rect={[90, 750, 1026, 300]} size={54} align="center">
          Hesap silme şu an kullanılamıyor. İlerlemen korunuyor.
        </DesignText>
        <AppButton
          designRect={[90, 1100, 1026, 132]}
          text="Vazgeç"
          tone="secondary"
          onPress={onCancel}
        />
      </DesignContent>
    );
  const hasApple = user.identities?.some(
    (identity) => identity.provider === "apple",
  );
  const providers =
    user.identities
      ?.filter((i) =>
        hasApple
          ? i.provider === "apple"
          : ["google", "facebook"].includes(i.provider),
      )
      .map((i) => i.provider) ?? [];
  return (
    <View>
      <AccountDeletionView
        pending={deletion.hasJournal}
        onCheck={() => {
          void deletionStore.recover();
        }}
        anonymous={user.is_anonymous}
        providers={providers}
        confirmed={confirmed}
        canVerify={confirmed && !busy && !account.busy}
        canDelete={
          accountDeletionEnabled &&
          confirmed &&
          (user.is_anonymous || verified === user.id) &&
          !busy &&
          !account.busy
        }
        message={message}
        onConsent={() => setConfirmed(!confirmed)}
        onCancel={onCancel}
        onVerify={(provider) => {
          const id = user.id;
          setBusy(true);
          void accountStore
            .signIn(provider, true)
            .then((ok) => {
              if (ok) setVerified(id);
            })
            .finally(() => setBusy(false));
        }}
        onDelete={() => {
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
    </View>
  );
}
