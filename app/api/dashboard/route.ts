import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, USERNAME_COOKIE } from "@/lib/auth-cookies";
import { watermelonDashboard } from "@/lib/server/watermelon";

/**
 * Same-origin bridge for `GET /api/dashboard`.
 *
 * It forwards the `session` + `username` cookies (the ones the FastAPI backend
 * reads) and relays the backend response. On success it adds an `account`
 * object derived from the bridge's own `username` cookie, because the backend
 * `aoi` field is only a status string and exposes no account data.
 */
export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const username = request.cookies.get(USERNAME_COOKIE)?.value;

  if (!session || !username) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const result = await watermelonDashboard({ session, username });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ...result.data,
    account: { username },
  });
}
