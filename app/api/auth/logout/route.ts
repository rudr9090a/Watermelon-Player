import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  clearAuthCookies,
  SESSION_COOKIE,
  USERNAME_COOKIE,
} from "@/lib/auth-cookies";
import { watermelonLogout } from "@/lib/server/watermelon";

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const username = request.cookies.get(USERNAME_COOKIE)?.value;

  if (session && username) {
    await watermelonLogout({ session, username });
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
