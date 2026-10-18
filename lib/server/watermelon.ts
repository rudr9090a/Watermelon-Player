/**
 * Server-side client for the Watermelon FastAPI backend.
 *
 * This module must only be imported from Route Handlers or other server code.
 * It never runs in the browser, so no backend credentials or tokens are ever
 * exposed to the client bundle.
 *
 * Contract notes (verified against the FastAPI backend and `data/`):
 *   POST /api/auth/login     { username, password } -> 200 { success, session, aoi }
 *                            401 { detail } on failure. `session` is
 *                            "<token>=<username>"; the backend does NOT set a
 *                            cookie, so the bridge below splits it and sets the
 *                            `session` / `username` cookies the backend expects.
 *   POST /api/auth/new_user  { username, password } -> 200 { result, aoi }
 *                            500 { detail } on failure (including duplicates).
 *   POST /api/auth/logout    reads `session` + `username` cookies.
 *
 * The base URL is server-only. It defaults to the private local FastAPI
 * listener used by the Next.js reverse proxy.
 */

const DEFAULT_API_URL = "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 15_000;

export function getApiBaseUrl(): string {
  const raw =
    process.env.FASTAPI_INTERNAL_URL ??
    DEFAULT_API_URL;
  return raw.replace(/\/+$/, "");
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractDetail(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail.trim();
    }
  }
  return fallback;
}

export type LoginResult =
  | { ok: true; sessionToken: string; username: string }
  | { ok: false; status: number };

export async function watermelonLogin(input: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, status: 0 };
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const payload = await readJson(response);
  const session =
    payload && typeof payload === "object"
      ? (payload as { session?: unknown }).session
      : undefined;

  if (typeof session !== "string" || !session.includes("=")) {
    return { ok: false, status: 502 };
  }

  const separator = session.indexOf("=");
  const sessionToken = session.slice(0, separator);
  const username = session.slice(separator + 1);

  if (!sessionToken) {
    return { ok: false, status: 502 };
  }

  return { ok: true, sessionToken, username };
}

export type SignupResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function watermelonSignup(input: {
  username: string;
  password: string;
}): Promise<SignupResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/new_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Could not reach the Watermelon server. Please try again.",
    };
  }

  const payload = await readJson(response);

  if (!response.ok) {
    // The backend returns 500 for user-actionable failures such as a duplicate
    // username. Surface it as a 400 so the client can show the message inline.
    const status = response.status >= 500 ? 400 : response.status;
    return {
      ok: false,
      status,
      message: extractDetail(payload, "Could not create the account."),
    };
  }

  return { ok: true };
}

export type DashboardResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: number; message: string };

/**
 * GET /api/dashboard — verified shape:
 *   { "session_validity": true, "aoi": "<status string>", "songs": ["a.mp3", ...] }
 * Requires `session` + `username` cookies. 400 = malformed cookies,
 * 401 = invalid session.
 */
export async function watermelonDashboard(cookies: {
  session: string;
  username: string;
}): Promise<DashboardResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/dashboard`, {
      headers: {
        Cookie: `session=${cookies.session}; username=${cookies.username}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Could not reach the Watermelon server.",
    };
  }

  const payload = await readJson(response);

  if (!response.ok) {
    // The backend returns 400 when the cookies are missing/malformed. Treat it
    // as "not signed in" so the dashboard shows the unauthenticated state.
    const status = response.status === 400 ? 401 : response.status;
    return {
      ok: false,
      status,
      message: extractDetail(payload, "Your session is no longer valid."),
    };
  }

  const data =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return { ok: true, data };
}

/**
 * GET /api/music/{song_id}/audio. The backend returns the MP3 with
 * `Accept-Ranges: bytes`, so a Range request yields a 206 Partial Content that
 * native `<audio>` playback and seeking rely on. Returns the raw upstream
 * response so the route handler can relay status, headers and the stream.
 *
 * No request timeout here: aborting would break an in-progress stream.
 */
export async function watermelonAudio(
  songId: string,
  range?: string,
): Promise<Response | null> {
  const headers: Record<string, string> = {};
  if (range) {
    headers.Range = range;
  }

  try {
    return await fetch(
      `${getApiBaseUrl()}/api/music/${encodeURIComponent(songId)}/audio`,
      { headers, cache: "no-store" },
    );
  } catch {
    return null;
  }
}

export async function watermelonLogout(cookies: {
  session?: string;
  username?: string;
}): Promise<boolean> {
  const header = [
    cookies.session ? `session=${cookies.session}` : null,
    cookies.username ? `username=${cookies.username}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  if (!header) {
    return false;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: header },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}
