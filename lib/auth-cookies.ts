import type { NextResponse } from "next/server";

/**
 * Cookie names expected by the Watermelon FastAPI backend.
 * `main.py` reads `session` and `username` from the incoming request cookies.
 */
export const SESSION_COOKIE = "session";
export const USERNAME_COOKIE = "username";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Cookies are first-party (browser -> Next.js bridge -> FastAPI), so `lax` is
 * sufficient and avoids the cross-site cookie problems that come with talking
 * to the API subdomain directly.
 *
 * `secure` defaults to on in production. Self-hosters who serve the frontend
 * over plain HTTP (common on a home LAN, e.g. http://music.lan:3000) must set
 * `COOKIE_SECURE=false`, otherwise the browser will refuse to store the
 * session cookie.
 */
function isSecure(): boolean {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE.toLowerCase() === "true";
  }
  return process.env.NODE_ENV === "production";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure(),
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(
  response: NextResponse,
  sessionToken: string,
  username: string,
) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: sessionToken,
    ...cookieOptions(SESSION_MAX_AGE_SECONDS),
  });
  response.cookies.set({
    name: USERNAME_COOKIE,
    value: username,
    ...cookieOptions(SESSION_MAX_AGE_SECONDS),
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    ...cookieOptions(0),
  });
  response.cookies.set({
    name: USERNAME_COOKIE,
    value: "",
    ...cookieOptions(0),
  });
}
