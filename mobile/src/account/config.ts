export type BackendEnvironment = "disabled" | "test" | "production";
export interface AccountConfig {
  enabled: boolean;
  environment: BackendEnvironment;
  url: string;
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
    googleIOSClientID: input.googleIOSClientID ?? "",
    googleWebClientID: input.googleWebClientID ?? "",
    facebookEnabled: input.facebookEnabled === "true",
  };
  if (input.enabled !== "true") return { ...base, error: "not-configured" };
  if (testBuild && environment === "production")
    return { ...base, error: "test-on-production" };
  // API origins are closed per environment; credentials never belong in the mobile configuration.
  if (
    environment === "disabled" ||
    base.url !==
      (environment === "production"
        ? "https://api.masterland.app"
        : "https://api-test.masterland.app")
  )
    return { ...base, error: "invalid-config" };
  return { ...base, enabled: true, error: null };
}
