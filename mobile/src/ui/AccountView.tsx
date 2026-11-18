import type { LoginProvider } from "../account/auth";
import type { Save, Action, Result } from "../game/engine";
import { accountText as tx } from "../i18n/locale";
import { DesignContent } from "./DesignContent";
import { DesignBox, DesignSurface, DesignText } from "./DesignSpace";
import { AppButton, AppCheckbox, Label } from "./Controls";
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
  connectionEnabled: boolean;
  facebookEnabled: boolean;
  ready: boolean;
  error: boolean;
}
export interface AccountViewActions {
  close: () => void;
  deletion: () => void;
  signOut: () => void;
  signIn: (provider: LoginProvider) => void;
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
  const settingsY = model.registered ? 1250 : 1498;
  const fields = [
    [tx("Ad soyad", "Full name"), model.name],
    [tx("E-posta", "Email"), model.email],
    [tx("Oturum yöntemi", "Sign-in method"), model.providers],
  ] as const;
  const providers = [
    [
      "apple",
      tx("Apple ile devam et", "Continue with Apple"),
      model.appleAvailable,
    ],
    [
      "google",
      tx("Google ile devam et", "Continue with Google"),
      true,
    ],
    [
      "facebook",
      tx("Facebook ile devam et", "Continue with Facebook"),
      model.facebookEnabled,
    ],
  ] as const;
  const status = model.error
    ? tx(
        "Bağlantı tamamlanamadı. Tekrar deneyebilirsin.",
        "Could not connect. Try again.",
      )
    : !model.ready
      ? tx("Oturum kontrol ediliyor…", "Checking your session…")
      : tx("Cihazda kayıtlı", "Saved on this device");

  return (
    <DesignContent end={settingsY + 970} testID="accountPanel">
      {model.registered ? (
        <>
          <PaperCard designRect={[90, 730, 1026, 345]} />
          {fields.map(([label, value], index) => {
            const y = 754 + index * 98;
            return (
              <DesignText
                key={label}
                rect={[130, y, 946, 90]}
                size={43}
                fit
                bold={index === 0}
              >
                {`${label} · ${value ?? tx("Belirtilmedi", "Not provided")}`}
              </DesignText>
            );
          })}
          <AppButton
            designRect={[90, 1092, 1026, 108]}
            text={tx("Oturumu kapat", "Sign out")}
            tone="secondary"
            testID="accountSignOut"
            disabled={model.blocked}
            onPress={actions.signOut}
          />
        </>
      ) : (
        <>
          <DesignText rect={[90, 730, 1026, 66]} size={54} bold align="center">
            {tx("Giriş yap", "Sign in")}
          </DesignText>
          <DesignText
            rect={[110, 796, 986, 56]}
            size={36}
            fit
            align="center"
            testID="accountConnectionStatus"
          >
            {status}
          </DesignText>
          {providers.map(([id, label, enabled], index) => (
            <DesignBox key={id} rect={[90, 867 + index * 160, 1026, 146]}>
              <ProviderButton
                provider={id}
                text={label}
                disabled={!model.connectionEnabled || model.blocked || !enabled}
                onPress={() => actions.signIn(id)}
              />
            </DesignBox>
          ))}
          <AppButton
            designRect={[90, 1355, 1026, 96]}
            text={tx("Giriş yapmadan devam et", "Continue without signing in")}
            tone="secondary"
            testID="closeAccount"
            onPress={actions.close}
          />
        </>
      )}
      <DesignSurface
        rect={[110, settingsY - 27, 986, 3]}
        fill="#b78452"
        radius={1.5}
      />
      <PaperCard designRect={[90, settingsY, 1026, 514]} />
      <DesignText rect={[126, settingsY + 15, 950, 80]} size={54} bold>
        {tx("Ayarlar", "Settings")}
      </DesignText>
      <AppCheckbox
        designRect={[140, settingsY + 100, 910, 105]}
        label="Ses"
        checked={save.sound}
        testID="setting-sound"
        onChange={() => dispatch({ type: "sound" })}
      />
      <AppCheckbox
        designRect={[140, settingsY + 224, 910, 105]}
        label="Hareketi azalt"
        checked={save.reducedMotion}
        testID="setting-motion"
        onChange={() => dispatch({ type: "motion" })}
      />
      {(
        [
          ["tr", "Türkçe", 140],
          ["en", "English", 617],
        ] as const
      ).map(([code, label, x]) => (
        <AppButton
          key={code}
          designRect={[x, settingsY + 359, 440, 100]}
          text={(model.language === code ? "✓ " : "") + label}
          tone={model.language === code ? "primary" : "secondary"}
          testID={`language-${code}`}
          onPress={() => actions.language(code)}
        />
      ))}
      <DesignBox rect={[90, settingsY + 535, 1026, 180]}>
        <AdPrivacyControl />
        {model.languageError && <Label>Dil tercihi kaydedilemedi.</Label>}
      </DesignBox>
      {model.registered && (
        <AppButton
          designRect={[90, settingsY + 744, 1026, 112]}
          text={tx("Hesabımı sil", "Delete my account")}
          tone="danger"
          testID="openAccountDeletion"
          disabled={model.blocked}
          onPress={actions.deletion}
        />
      )}
    </DesignContent>
  );
}
