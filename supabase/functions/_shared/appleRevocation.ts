import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.3";
const keys = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
/** Authorization code and tokens remain in this invocation's memory and are never logged or persisted. */
export async function revokeAppleAuthorization(input: {
  code: string;
  subject: string;
  clientID: string;
  clientSecret: string;
}) {
  const result = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientID,
      client_secret: input.clientSecret,
      code: input.code,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!result.ok) throw Error("Apple exchange failed");
  const tokens = await result.json();
  if (
    typeof tokens.id_token !== "string" ||
    typeof tokens.refresh_token !== "string"
  )
    throw Error("Apple tokens missing");
  const verified = await jwtVerify(tokens.id_token, keys, {
    issuer: "https://appleid.apple.com",
    audience: input.clientID,
  });
  if (verified.payload.sub !== input.subject)
    throw Error("Apple subject mismatch");
  const revoked = await fetch("https://appleid.apple.com/auth/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientID,
      client_secret: input.clientSecret,
      token: tokens.refresh_token,
      token_type_hint: "refresh_token",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!revoked.ok) throw Error("Apple revocation failed");
}
