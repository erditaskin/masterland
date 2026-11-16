import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { testModeEnabled } from "../game/testMode";
import { resolveAccountConfig } from "./config";
import { createSecureSessionStorage } from "./secureStorage";

export const accountConfig = resolveAccountConfig(
  {
    enabled: process.env.EXPO_PUBLIC_BACKEND_ENABLED,
    environment: process.env.EXPO_PUBLIC_BACKEND_ENV,
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    googleIOSClientID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleWebClientID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    facebookEnabled: process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED,
  },
  testModeEnabled,
);
const storage = createSecureSessionStorage(SecureStore, Crypto.randomUUID);
export const accountClient = accountConfig.enabled
  ? createClient(accountConfig.url, accountConfig.key, {
      auth: {
        storage,
        storageKey: `masterland.auth.${accountConfig.environment}`,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  : null;
export const authRedirect = "masterland://auth/callback";
