import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
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
export const accountClient = accountConfig.enabled
  ? createAccountClient({
      url: accountConfig.url,
      key: `masterland.api.auth.${accountConfig.environment}`,
      storage,
      fetch: (...args) => fetch(...args),
    })
  : null;
export const authRedirect = "masterland://auth/callback";
