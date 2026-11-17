import { CloudSyncPanel } from "./CloudSyncPanel";
import { cloudSync } from "../account/cloudSync";
import { deletionStore } from "../account/deletion";
import { AccountDeletionPanel } from "./AccountDeletionPanel";
import { AdPrivacyControl } from "./EnergyAdPanel";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { ProviderButton } from "./ProviderButton";
import * as Apple from "expo-apple-authentication";
import { accountStore, type LoginProvider } from "../account/auth";
import { accountConfig } from "../account/client";
import { languageStore, accountText as tx } from "../i18n/locale";
import { setLanguage } from "../i18n/preferences";
import { AppButton, AppChoice, Divider, Label } from "./Controls";

export function AccountPanel({ onClose }: { onClose: () => void }) {
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
  const name =
    account.user?.user_metadata.full_name ?? account.user?.user_metadata.name;
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
    if (await accountStore.signIn(provider)) onClose();
    else setSigningIn(false);
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
    <View testID="accountPanel" style={{ marginTop: 14 }}>
      <View style={{ alignItems: "center", marginBottom: 18 }}>
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 12 }}
        />
        <Label title size={24}>
          {account.user
            ? tx("Hesabın", "Your account")
            : tx("Giriş yap", "Sign in")}
        </Label>
      </View>
      <Label style={{ marginTop: 6 }}>
        {tx("Cihazda kayıtlı", "Saved on this device")}
      </Label>
      {!accountConfig.enabled && (
        <Label size={12}>
          {tx(
            "Hesap bağlantısı hazırlanıyor.",
            "Account connection is being prepared.",
          )}
        </Label>
      )}
      <>
        {account.user && (
          <View testID="signedInAccount">
            <Label title>{tx("Oturum açık", "Signed in")}</Label>
            {typeof name === "string" && name.trim() ? (
              <Label>{name}</Label>
            ) : null}
            {account.user.email ? <Label>{account.user.email}</Label> : null}
            <Label>
              {tx("Giriş yöntemi", "Sign-in method")}: {providers}
            </Label>
          </View>
        )}
        {account.ready && !account.user && (
          <View style={{ gap: 10, marginTop: 12, marginBottom: 14 }}>
            {appleAvailable && (
              <View
                pointerEvents={
                  !accountConfig.enabled || account.busy || deletion.hasJournal
                    ? "none"
                    : "auto"
                }
                style={{ opacity: !accountConfig.enabled ? 0.55 : 1 }}
              >
                <Apple.AppleAuthenticationButton
                  testID="signInApple"
                  buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={8}
                  style={{ height: 48, width: "100%" }}
                  onPress={() => {
                    if (
                      accountConfig.enabled &&
                      !account.busy &&
                      !deletion.hasJournal
                    )
                      void signIn("apple");
                  }}
                />
              </View>
            )}
            <ProviderButton
              provider="google"
              text={tx("Google ile devam et", "Continue with Google")}
              disabled={
                !accountConfig.enabled ||
                account.busy ||
                deletion.hasJournal ||
                !accountConfig.googleIOSClientID ||
                !accountConfig.googleWebClientID
              }
              onPress={() => void signIn("google")}
            />
            <ProviderButton
              provider="facebook"
              text={tx("Facebook ile devam et", "Continue with Facebook")}
              disabled={
                !accountConfig.enabled ||
                account.busy ||
                deletion.hasJournal ||
                !accountConfig.facebookEnabled
              }
              onPress={() => void signIn("facebook")}
            />
            {!accountConfig.facebookEnabled && (
              <Label size={11}>
                {tx(
                  "Facebook girişi yakında.",
                  "Facebook sign-in coming soon.",
                )}
              </Label>
            )}
          </View>
        )}
        {!account.ready && (
          <Label>{tx("Oturum kontrol ediliyor…", "Checking session…")}</Label>
        )}
        {account.busy && <Label>{tx("Bağlanıyor…", "Connecting…")}</Label>}
        {account.error && (
          <Label>
            {tx(
              "Bağlantı tamamlanamadı. İlerlemen korunuyor; tekrar deneyebilirsin.",
              "Connection could not be completed. Your progress is safe; you can try again.",
            )}
          </Label>
        )}
        {account.user && (
          <AppButton
            testID="accountSignOut"
            tone="secondary"
            text={tx("Hesaptan çık", "Sign out")}
            disabled={account.busy || deletion.hasJournal || cloud.busy}
            onPress={() => {
              void accountStore.signOut();
            }}
          />
        )}
      </>
      <AppButton
        testID="closeAccount"
        tone="secondary"
        text={tx("Kapat", "Close")}
        onPress={onClose}
      />
      {!account.user && (
        <Label size={12}>
          {tx(
            "Giriş yapmadan oyuna devam edebilirsin. İlerlemen bu cihazda korunur.",
            "You can keep playing without signing in. Your progress stays on this device.",
          )}
        </Label>
      )}
      <CloudSyncPanel />
      <AccountDeletionPanel />
      <AdPrivacyControl />
      <Divider />
      <Label title size={18}>
        {tx("Dil · EN önizleme", "Language · EN preview")}
      </Label>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        {(
          [
            ["tr", "Türkçe"],
            ["en", "English"],
          ] as const
        ).map(([code, label]) => (
          <AppChoice
            key={code}
            testID={`language-${code}`}
            label={label}
            selected={language === code}
            onPress={() => {
              void setLanguage(code)
                .then(() => setLanguageError(false))
                .catch(() => setLanguageError(true));
            }}
            style={{ flex: 1, minHeight: 44 }}
          >
            <Label>{label}</Label>
          </AppChoice>
        ))}
      </View>
      {languageError && (
        <Label>
          {tx(
            "Dil tercihi kaydedilemedi.",
            "Language preference could not be saved.",
          )}
        </Label>
      )}
    </View>
  );
}
