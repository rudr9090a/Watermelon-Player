import { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/server/watermelon";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/get_song_thumbnail/[filename]">,
) {
  const { filename } = await context.params;
  const upstream = await fetch(
    `${getApiBaseUrl()}/api/get_song_thumbnail/${encodeURIComponent(filename)}`,
    {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    },
  );

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "image/png",
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
}
