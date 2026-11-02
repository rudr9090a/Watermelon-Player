import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/server/watermelon";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/get_song_data/[songId]">,
) {
  const { songId } = await context.params;
  const upstream = await fetch(`${getApiBaseUrl()}/api/get_song_data/${encodeURIComponent(songId)}`, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  const payload = await upstream.text();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
