import { CloudSyncPanel } from "./CloudSyncPanel";
import { cloudSync } from "../account/cloudSync";
import { deletionStore } from "../account/deletion";
import { AccountDeletionPanel } from "./AccountDeletionPanel";
import { AdPrivacyControl } from "./EnergyAdPanel";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { ProviderButton } from "./ProviderButton";
import * as Apple from "expo-apple-authentication";
import { accountStore, type LoginProvider } from "../account/auth";
import { accountConfig } from "../account/client";
import { languageStore, accountText as tx } from "../i18n/locale";
import { setLanguage } from "../i18n/preferences";
import { PaperCard } from "./PagePrimitives";
import { AppButton, AppChoice, Label } from "./Controls";

export function AccountPanel({
  onClose,
  summary,
  settings,
}: {
  onClose: () => void;
  summary?: ReactNode;
  settings?: ReactNode;
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
      <PaperCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("../../assets/art/shared-profile-v1.png")}
            style={{ width: 90, height: 90 }}
            resizeMode="contain"
          />
          <View style={{ flex: 1, gap: 6 }}>
            <Label title size={21}>
              {registered
                ? tx("Gezgin", "Traveler")
                : tx("Hesapsız oynuyorsun", "Playing as a guest")}
            </Label>
            {registered ? (
              summary
            ) : (
              <Label size={13}>
                {tx(
                  "İlerlemen bu cihazda korunur.",
                  "Your progress stays on this device.",
                )}
              </Label>
            )}
          </View>
        </View>
      </PaperCard>
      {!registered && (
        <PaperCard
          header={
            <Label title size={18}>
              {tx(
                "İlerlemeni buluta kaydet",
                "Save your progress to the cloud",
              )}
            </Label>
          }
        >
          <Label size={13}>
            {tx(
              "Hesabını bağlayarak ilerlemeni koru ve farklı cihazlarda da devam et.",
              "Link your account to protect your progress and continue on other devices.",
            )}
          </Label>
        </PaperCard>
      )}
      {!accountConfig.enabled && (
        <Label size={12}>
          {tx(
            "Hesap bağlantısı hazırlanıyor.",
            "Account connection is being prepared.",
          )}
        </Label>
      )}
      <>
        {registered && account.user && (
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
        {account.ready && !registered && (
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
            {process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_HIDDEN !== "true" && (
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
            )}
            {!accountConfig.facebookEnabled &&
              process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_HIDDEN !== "true" && (
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
        {registered && (
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
      {!registered && (
        <Label size={12}>
          {tx(
            "Giriş yapmadan oyuna devam edebilirsin. İlerlemen bu cihazda korunur.",
            "You can keep playing without signing in. Your progress stays on this device.",
          )}
        </Label>
      )}
      <CloudSyncPanel />
      <PaperCard
        header={
          <Label title size={20}>
            {tx("Ayarlar", "Settings")}
          </Label>
        }
      >
        {settings}
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
      </PaperCard>
      <AccountDeletionPanel />
      <AdPrivacyControl />
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
