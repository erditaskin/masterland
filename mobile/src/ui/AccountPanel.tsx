import { AccountView } from "./AccountView";
import { type Save, type Action, type Result } from "../game/engine";
import { cloudSync } from "../account/cloudSync";
import { deletionStore } from "../account/deletion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Apple from "expo-apple-authentication";
import { accountStore, type LoginProvider } from "../account/auth";
import { accountConfig } from "../account/client";
import { languageStore, accountText as tx } from "../i18n/locale";
import { setLanguage } from "../i18n/preferences";
import { Label } from "./Controls";

export function AccountPanel({
  onClose,
  save,
  dispatch,
  onDeletion,
}: {
  onClose: () => void;
  save: Save;
  dispatch: (action: Action) => Result | null;
  onDeletion: () => void;
}) {
  const deletion = useSyncExternalStore(
    deletionStore.subscribe,
    deletionStore.get,
  );
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const cloud = useSyncExternalStore(cloudSync.subscribe, cloudSync.get);
  const [signingIn, setSigningIn] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [languageError, setLanguageError] = useState(false);
  useEffect(() => {
    void accountStore.start();
    void Apple.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);
  const registered = !!account.user && !account.user.is_anonymous;
  const metadata = account.user?.user_metadata;
  const name = [metadata?.full_name, metadata?.name].find(
    (value) => typeof value === "string" && value.trim(),
  );
  const providers = account.user?.identities
    ?.map(
      (identity) =>
        (
          ({
            apple: "Apple",
            google: "Google",
            facebook: "Facebook",
          }) as Record<string, string>
        )[identity.provider] ?? identity.provider,
    )
    .join(", ");
  const signIn = async (provider: LoginProvider) => {
    setSigningIn(true);
    try {
      await accountStore.signIn(provider);
    } finally {
      setSigningIn(false);
    }
  };
  if (signingIn) {
    return (
      <View testID="accountSigningIn" style={{ marginTop: 14 }}>
        <ActivityIndicator color="#315b31" style={{ marginVertical: 24 }} />
        <Label>{tx("Giriş yapılıyor…", "Signing in…")}</Label>
      </View>
    );
  }
  return (
    <AccountView
      save={save}
      dispatch={dispatch}
      model={{
        registered,
        name: typeof name === "string" ? name : undefined,
        providers,
        email: account.user?.email ?? undefined,
        appleAvailable,
        language,
        languageError,
        blocked: account.busy || deletion.hasJournal || cloud.busy,
        connectionEnabled: accountConfig.enabled,
        facebookEnabled: accountConfig.facebookEnabled,
        ready: account.ready,
        error: !!account.error,
      }}
      actions={{
        close: onClose,
        deletion: onDeletion,
        signIn: (provider) => {
          void signIn(provider);
        },
        signOut: () => {
          void accountStore.signOut();
        },
        language: (code) => {
          void setLanguage(code)
            .then(() => setLanguageError(false))
            .catch(() => setLanguageError(true));
        },
      }}
    />
  );
}
