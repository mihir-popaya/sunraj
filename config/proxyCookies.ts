/** Make backend auth cookies usable on the same-origin development proxy. */
export function rewriteDevAuthCookie(cookie: string): string {
  const name = cookie.slice(0, cookie.indexOf("=")).trim();
  if (name !== "access_token" && name !== "refresh_token") return cookie;

  // The local proxy is same-origin, so cross-site SameSite=None is unnecessary.
  // Preserve HttpOnly, Secure (when present), expiry, and the cookie value.
  return cookie.replace(/;\s*SameSite=None(?=;|$)/gi, "; SameSite=Lax");
}
