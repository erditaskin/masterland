export type BackendEnvironment = "disabled" | "test" | "production";
export interface AccountConfig {
  enabled: boolean;
  environment: BackendEnvironment;
  url: string;
  key: string;
  googleIOSClientID: string;
  googleWebClientID: string;
  facebookEnabled: boolean;
  error: "not-configured" | "invalid-config" | "test-on-production" | null;
}

export function resolveAccountConfig(
  input: {
    enabled?: string;
    environment?: string;
    url?: string;
    key?: string;
    googleIOSClientID?: string;
    googleWebClientID?: string;
    facebookEnabled?: string;
  },
  testBuild: boolean,
): AccountConfig {
  const environment: BackendEnvironment =
    input.environment === "production"
      ? "production"
      : input.environment === "test"
        ? "test"
        : "disabled";
  const base = {
    enabled: false,
    environment,
    url: input.url ?? "",
    key: input.key ?? "",
    googleIOSClientID: input.googleIOSClientID ?? "",
    googleWebClientID: input.googleWebClientID ?? "",
    facebookEnabled: input.facebookEnabled === "true",
  };
  if (input.enabled !== "true") return { ...base, error: "not-configured" };
  if (testBuild && environment === "production")
    return { ...base, error: "test-on-production" };
  // Only public publishable keys belong in the mobile bundle. Legacy JWT/service keys are rejected.
  if (
    environment === "disabled" ||
    !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(base.url) ||
    !base.key.startsWith("sb_publishable_")
  )
    return { ...base, error: "invalid-config" };
  return { ...base, enabled: true, error: null };
}
