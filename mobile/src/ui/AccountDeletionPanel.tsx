import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { accountStore } from "../account/auth";
import {
  accountDeletionEnabled,
  deletionStore,
  deleteCurrentAccount,
} from "../account/deletion";
import { accountText as tx, languageStore } from "../i18n/locale";
import { AppButton } from "./Controls";
import { DesignContent } from "./DesignContent";
import { DesignText } from "./DesignSpace";
import { PaperCard } from "./PagePrimitives";

export function AccountDeletionView({
  anonymous,
  canDelete,
  message,
  onDelete,
  onCancel,
}: {
  anonymous: boolean;
  canDelete: boolean;
  message?: string;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <DesignContent
      end={message ? 2030 : 1720}
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
      <AppButton
        designRect={[90, 1370, 1026, 132]}
        text={tx("Kalıcı olarak sil", "Delete permanently")}
        tone="danger"
        testID="confirmAccountDeletion"
        disabled={!canDelete}
        onPress={onDelete}
      />
      <AppButton
        designRect={[90, 1535, 1026, 132]}
        text={tx("Vazgeç", "Cancel")}
        tone="secondary"
        onPress={onCancel}
      />
      {message && (
        <DesignText rect={[90, 1710, 1026, 260]} size={42}>
          {message}
        </DesignText>
      )}
    </DesignContent>
  );
}

export function AccountDeletionPanel({ onCancel, onDeleted }: {
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const deleting = useSyncExternalStore(
    deletionStore.subscribe,
    deletionStore.get,
  );
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  useSyncExternalStore(languageStore.subscribe, languageStore.get);
  const [message, setMessage] = useState("");
  const user = account.user;
  if ((!accountDeletionEnabled || !user) && !deleting)
    return (
      <DesignContent end={1250}>
        <DesignText rect={[90, 750, 1026, 300]} size={54} align="center">
          {message || tx("Hesap silme şu an kullanılamıyor.", "Account deletion is unavailable.")}
        </DesignText>
        <AppButton
          designRect={[90, 1100, 1026, 132]}
          text={tx("Vazgeç", "Cancel")}
          tone="secondary"
          onPress={onCancel}
        />
      </DesignContent>
    );
  return (
    <View>
      <AccountDeletionView
        anonymous={user?.is_anonymous ?? false}
        canDelete={accountDeletionEnabled && !deleting && !account.busy && !!user}
        message={message}
        onCancel={onCancel}
        onDelete={() => {
          setMessage("");
          void deleteCurrentAccount()
            .then((deleted) => {
              if (deleted) onDeleted();
            })
            .catch(() => {
              setMessage(tx(
                "Hesap silinemedi. Tekrar dene.",
                "Could not delete the account. Try again.",
              ));
            });
        }}
      />
    </View>
  );
}
