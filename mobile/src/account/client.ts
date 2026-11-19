import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { testModeEnabled } from "../game/testMode";
import { resolveAccountConfig } from "./config";
import { createSecureSessionStorage } from "./secureStorage";
import { createAccountClient } from "./sessionClient";

export const accountConfig = resolveAccountConfig(
  {
    enabled: process.env.EXPO_PUBLIC_BACKEND_ENABLED,
    environment: process.env.EXPO_PUBLIC_BACKEND_ENV,
    url: process.env.EXPO_PUBLIC_API_URL,
    googleIOSClientID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleWebClientID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    facebookEnabled: process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED,
  },
  testModeEnabled,
);
const storage = createSecureSessionStorage(SecureStore, Crypto.randomUUID);
const deviceKey = "masterland.installation.id";
let installationID: Promise<string> | undefined;
async function getDevice() {
  const os = Platform.OS;
  if (os !== "ios" && os !== "android") return null;
  installationID ??= (async () => {
    const saved = await storage.getItem(deviceKey);
    if (saved) return saved;
    const id = Crypto.randomUUID();
    await storage.setItem(deviceKey, id);
    return id;
  })().catch((error) => {
    installationID = undefined;
    throw error;
  });
  return { id: await installationID, os };
}
export const accountClient = accountConfig.enabled
  ? createAccountClient({
      url: accountConfig.url,
      key: `masterland.api.auth.${accountConfig.environment}`,
      storage,
      device: getDevice,
      fetch: (...args) => fetch(...args),
    })
  : null;
export const facebookLoginVisible =
  process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_HIDDEN !== "true";
export const authRedirect = "masterland://auth/callback";
