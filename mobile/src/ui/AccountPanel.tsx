import { useEffect, useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import * as Apple from "expo-apple-authentication";
import { accountStore } from "../account/auth";
import { accountConfig } from "../account/client";
import { languageStore, accountText as tx } from "../i18n/locale";
import { setLanguage } from "../i18n/preferences";
import { AppButton, AppChoice, Divider, Label } from "./Controls";

export function AccountPanel() {
  const account = useSyncExternalStore(
    accountStore.subscribe,
    accountStore.get,
  );
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.get,
  );
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [languageError, setLanguageError] = useState(false);
  useEffect(() => {
    void accountStore.start();
    void Apple.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);
  return (
    <View testID="accountPanel" style={{ marginTop: 14 }}>
      <Label title size={18}>
        {tx("İlerlemeni koru", "Protect your progress")}
      </Label>
      <Label style={{ marginTop: 6 }}>
        {tx("Cihazda kayıtlı", "Saved on this device")}
      </Label>
      <Label size={12} style={{ marginVertical: 8 }}>
        {tx(
          "Bulut eşitleme henüz etkin değil. Mevcut oyun kaydın cihazında korunuyor.",
          "Cloud sync is not enabled yet. Your existing progress remains on this device.",
        )}
      </Label>
      {!accountConfig.enabled ? (
        <Label size={12}>
          {tx(
            "Hesap bağlantısı hazırlanıyor.",
            "Account connection is being prepared.",
          )}
        </Label>
      ) : (
        <>
          {account.user && (
            <Label>{tx("Hesap bağlı", "Account connected")}</Label>
          )}
          {appleAvailable && (
            <Apple.AppleAuthenticationButton
              buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={{ height: 44, width: "100%", marginVertical: 5 }}
              onPress={() => {
                if (!account.busy) void accountStore.signIn("apple");
              }}
            />
          )}
          <AppButton
            testID="signInGoogle"
            text={tx("Google ile devam et", "Continue with Google")}
            disabled={
              account.busy ||
              !accountConfig.googleIOSClientID ||
              !accountConfig.googleWebClientID
            }
            onPress={() => void accountStore.signIn("google")}
          />
          <AppButton
            testID="signInFacebook"
            text={tx("Facebook ile devam et", "Continue with Facebook")}
            disabled={account.busy || !accountConfig.facebookEnabled}
            onPress={() => void accountStore.signIn("facebook")}
          />
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
              disabled={account.busy}
              onPress={() => void accountStore.signOut()}
            />
          )}
        </>
      )}
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
