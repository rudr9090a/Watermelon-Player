import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { watermelonSignup } from "@/lib/server/watermelon";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const value = body as { username?: unknown; password?: unknown; otp?: unknown };
  if (
    typeof value.username !== "string" ||
    typeof value.password !== "string" ||
    typeof value.otp !== "string" ||
    !value.otp.trim()
  ) {
    return NextResponse.json({ error: "Username, password, and OTP are required." }, { status: 400 });
  }
  const result = await watermelonSignup({
    username: value.username,
    password: value.password,
    otp: value.otp,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status || 502 });
  }
  return NextResponse.json({ ok: true });
}
