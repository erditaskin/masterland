/** Never accept a token/code from an unrelated link or a prefix-matching URL. */
export function oauthCode(url: string, redirect: string): string {
  const value = new URL(url),
    expected = new URL(redirect);
  if (
    value.protocol !== expected.protocol ||
    value.host !== expected.host ||
    value.pathname !== expected.pathname
  )
    throw Error("Invalid OAuth return URL");
  if (value.searchParams.has("error"))
    throw Error("OAuth provider rejected sign in");
  const code = value.searchParams.get("code");
  if (!code || value.searchParams.getAll("code").length !== 1)
    throw Error("OAuth code missing");
  return code;
}
