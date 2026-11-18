import { Platform, View } from "react-native";
import * as Apple from "expo-apple-authentication";
import type { LoginProvider } from "../account/auth";
import {
  level,
  name as cityName,
  type Save,
  type Action,
  type Result,
} from "../game/engine";
import { DesignContent } from "./DesignContent";
import {
  DesignBox,
  DesignImage,
  DesignSurface,
  DesignText,
} from "./DesignSpace";
import { AppButton, AppCheckbox, Button, Label } from "./Controls";
import { PaperCard } from "./PagePrimitives";
import { ProviderButton } from "./ProviderButton";
import { AdPrivacyControl } from "./EnergyAdPanel";

export interface AccountViewModel {
  registered: boolean;
  name?: string;
  providers?: string;
  email?: string;
  appleAvailable: boolean;
  language: "tr" | "en";
  languageError: boolean;
  blocked: boolean;
  cloudPhase: string;
  connectionEnabled: boolean;
  googleEnabled: boolean;
  facebookEnabled: boolean;
  facebookVisible: boolean;
  deleting: boolean;
  busy: boolean;
  ready: boolean;
  error: boolean;
}
export interface AccountViewActions {
  close: () => void;
  cloud: () => void;
  deletion: () => void;
  signOut: () => void;
  signIn: (provider: LoginProvider) => void;
  sync: () => void;
  language: (code: "tr" | "en") => void;
}
export function AccountView({
  save,
  dispatch,
  model,
  actions,
}: {
  save: Save;
  dispatch: (action: Action) => Result | null;
  model: AccountViewModel;
  actions: AccountViewActions;
}) {
  const {
    registered,
    name,
    providers,
    appleAvailable,
    language,
    languageError,
    blocked,
  } = model;
  const { close: onClose, cloud: onCloud, deletion: onDeletion } = actions;
  const showApple = appleAvailable && Platform.OS === "ios";
  const googleY = showApple ? 1500 : 1330;
  const settingsY = registered ? 1330 : googleY + 340;
  return (
    <DesignContent end={settingsY + 1900} testID="accountPanel">
      <PaperCard designRect={[90, 730, 1026, 260]} />
      <DesignImage
        source={require("../../assets/art/shared-profile-v1.png")}
        rect={[115, 750, 210, 210]}
        fit
      />
      <DesignText rect={[355, 750, 716, 100]} size={57} bold>
        {registered ? "Gezgin" : "Hesapsız oynuyorsun"}
      </DesignText>
      <DesignText rect={[355, 857, 716, 105]} size={39}>
        {registered
          ? `Seviye ${level(save)} · ${cityName(save.cityID)}`
          : "İlerlemen bu cihazda korunur."}
      </DesignText>
      <PaperCard
        designRect={[90, 1020, 1026, 277]}
        selected={registered && model.cloudPhase === "synced"}
      />
      <DesignText
        rect={[126, 1038, 950, 84]}
        size={47}
        bold
        color={
          registered && model.cloudPhase === "synced" ? "#34852b" : undefined
        }
      >
        {registered
          ? model.cloudPhase === "synced"
            ? "İlerlemen buluta kaydedildi"
            : "Bulut kaydı"
          : "İlerlemeni buluta kaydet"}
      </DesignText>
      <DesignText rect={[126, 1123, 950, 98]} size={37}>
        {registered
          ? model.cloudPhase === "synced"
            ? "Son eşitleme: Az önce"
            : model.cloudPhase === "choice"
              ? "Devam edeceğin kaydı seç."
              : "İlerlemen bu cihazda korunuyor."
          : "Hesabını bağlayarak farklı cihazlarda da devam et."}
      </DesignText>
      {registered && (
        <AppButton
          designRect={[340, 1215, 530, 72]}
          text={
            model.cloudPhase === "choice"
              ? "Kayıtları karşılaştır"
              : "Şimdi eşitle"
          }
          tone="secondary"
          disabled={blocked}
          onPress={() =>
            model.cloudPhase === "choice" ? onCloud() : actions.sync()
          }
        />
      )}
      {!registered && (
        <>
          {showApple && (
            <DesignBox rect={[90, 1330, 1026, 144]}>
              <View
                pointerEvents={
                  !model.connectionEnabled || model.busy || model.deleting
                    ? "none"
                    : "auto"
                }
                style={{ flex: 1 }}
              >
                <Apple.AppleAuthenticationButton
                  testID="signInApple"
                  buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={8}
                  style={{ flex: 1, width: "100%" }}
                  onPress={() => {
                    if (
                      model.connectionEnabled &&
                      !model.busy &&
                      !model.deleting
                    )
                      actions.signIn("apple");
                  }}
                />
              </View>
            </DesignBox>
          )}
          <DesignSurface
            rect={[90, googleY, 1026, 144]}
            fill="#ffffff"
            stroke="#747775"
            radius={24}
          />
          <DesignImage
            source={require("../../assets/brand/google-g.png")}
            rect={[125, googleY + 40, 66, 66]}
            fit
          />
          <DesignText
            rect={[210, googleY, 840, 144]}
            size={47}
            color="#1f1f1f"
            align="center"
            font={
              Platform.OS === "ios"
                ? "HelveticaNeue-Medium"
                : "sans-serif-medium"
            }
          >
            Google ile devam et
          </DesignText>
          <DesignBox rect={[90, googleY, 1026, 144]}>
            <Button
              label="Google ile devam et"
              testID="signInGoogle"
              disabled={
                !model.connectionEnabled ||
                model.busy ||
                model.deleting ||
                !model.googleEnabled
              }
              onPress={() => actions.signIn("google")}
              style={{ flex: 1 }}
            >
              <View />
            </Button>
          </DesignBox>
          <AppButton
            designRect={[90, googleY + 174, 1026, 132]}
            text="Giriş yapmadan devam et"
            tone="secondary"
            testID="closeAccount"
            onPress={onClose}
          />
        </>
      )}
      <PaperCard designRect={[90, settingsY, 1026, 560]} />
      <DesignText rect={[126, settingsY + 15, 950, 80]} size={54} bold>
        Ayarlar
      </DesignText>
      <AppCheckbox
        designRect={[140, settingsY + 110, 910, 105]}
        label="Ses"
        checked={save.sound}
        testID="setting-sound"
        onChange={() => dispatch({ type: "sound" })}
      />
      <AppCheckbox
        designRect={[140, settingsY + 240, 910, 105]}
        label="Hareketi azalt"
        checked={save.reducedMotion}
        testID="setting-motion"
        onChange={() => dispatch({ type: "motion" })}
      />
      {(
        [
          ["tr", "Türkçe", 360],
          ["en", "English", 720],
        ] as const
      ).map(([code, label, x]) => (
        <AppButton
          key={code}
          designRect={[x, settingsY + 385, 330, 100]}
          text={(language === code ? "✓ " : "") + label}
          tone={language === code ? "primary" : "secondary"}
          testID={`language-${code}`}
          onPress={() => actions.language(code)}
        />
      ))}
      {registered && (
        <>
          <AppButton
            designRect={[90, settingsY + 600, 1026, 132]}
            text="Hesaptan çık"
            tone="secondary"
            testID="accountSignOut"
            disabled={blocked}
            onPress={() => {
              actions.signOut();
            }}
          />
          <AppButton
            designRect={[90, settingsY + 760, 1026, 132]}
            text="Hesabımı sil"
            tone="danger"
            testID="openAccountDeletion"
            onPress={onDeletion}
          />
        </>
      )}
      <DesignBox rect={[90, settingsY + 950, 1026, 900]}>
        {typeof name === "string" && registered && <Label>{name}</Label>}
        {model.email && registered && <Label>{model.email}</Label>}
        {registered && <Label>{providers}</Label>}
        {!model.ready && <Label>Oturum kontrol ediliyor…</Label>}
        {model.busy && <Label>Bağlanıyor…</Label>}
        {model.error && (
          <Label>
            Bağlantı tamamlanamadı. İlerlemen korunuyor; tekrar deneyebilirsin.
          </Label>
        )}
        {!model.connectionEnabled && (
          <Label>Hesap bağlantısı hazırlanıyor.</Label>
        )}
        {model.facebookVisible && !registered && (
          <ProviderButton
            provider="facebook"
            text="Facebook ile devam et"
            disabled={
              !model.connectionEnabled ||
              model.busy ||
              model.deleting ||
              !model.facebookEnabled
            }
            onPress={() => actions.signIn("facebook")}
          />
        )}
        <AdPrivacyControl />
        {languageError && <Label>Dil tercihi kaydedilemedi.</Label>}
      </DesignBox>
    </DesignContent>
  );
}
