import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { watermelonLogin } from "@/lib/server/watermelon";
import { parseCredentials } from "@/lib/server/validate";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const credentials = parseCredentials(body);
  if (!credentials) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const result = await watermelonLogin(credentials);

  if (!result.ok) {
    if (result.status === 0) {
      return NextResponse.json(
        { error: "Could not reach the Watermelon server. Please try again." },
        { status: 502 },
      );
    }
    if (result.status === 502) {
      return NextResponse.json(
        { error: "The Watermelon server returned an unexpected response." },
        { status: 502 },
      );
    }
    // Always return a generic message on failed authentication so the endpoint
    // cannot be used to discover which usernames exist.
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, result.sessionToken, result.username);
  return response;
}
