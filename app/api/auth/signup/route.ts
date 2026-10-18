import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { watermelonSignup } from "@/lib/server/watermelon";
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

  const result = await watermelonSignup(credentials);

  if (!result.ok) {
    const status = result.status === 0 ? 502 : result.status;
    return NextResponse.json({ error: result.message }, { status });
  }

  // Watermelon creates the account but does not open a session.
  return NextResponse.json({ ok: true });
}
