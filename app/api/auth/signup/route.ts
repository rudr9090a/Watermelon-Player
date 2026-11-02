import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { watermelonSignupRequest } from "@/lib/server/watermelon";
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

  const result = await watermelonSignupRequest(credentials);

  if (!result.ok) {
    const status = result.status === 0 ? 502 : result.status;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json({ ok: true, requiresOtp: true });
}
