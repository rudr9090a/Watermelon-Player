import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { watermelonAudio } from "@/lib/server/watermelon";

const RELAYED_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "content-disposition",
  "etag",
  "last-modified",
];

/**
 * Same-origin bridge for `GET /api/music/{songId}/audio`.
 *
 * The `Range` header (if any) is forwarded to the backend, and the upstream
 * status plus byte-range headers and body stream are relayed unchanged. This
 * keeps native `<audio>` progressive loading and seeking working without
 * exposing the API origin to the browser.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/music/[songId]/audio">,
) {
  const { songId } = await context.params;
  const range = request.headers.get("range") ?? undefined;

  const upstream = await watermelonAudio(
    songId,
    range,
    request.headers.get("cookie") ?? undefined,
  );

  if (!upstream) {
    return NextResponse.json(
      { error: "Audio is unavailable right now." },
      { status: 502 },
    );
  }

  const headers = new Headers();
  for (const name of RELAYED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
