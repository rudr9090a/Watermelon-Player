/**
 * Client-side API layer.
 *
 * The browser never talks to the FastAPI backend directly for authenticated
 * JSON. It calls the same-origin Route Handlers under `/api/*`, which proxy to
 * the configured Watermelon server and manage the session cookies. That keeps the
 * session token out of JavaScript and avoids cross-origin cookie/CORS issues.
 *
 * All functions reject with an {@link ApiError} carrying a safe, user-facing
 * message. Passwords and tokens are never logged or persisted here.
 */

export type Credentials = {
  username: string;
  password: string;
};

export type ApiErrorCode =
  | "validation"
  | "auth"
  | "unauthenticated"
  | "server"
  | "network";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode, status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function readJsonSafe(response: Response): Promise<unknown> {
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

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as { error?: unknown; detail?: unknown };
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error.trim();
    }
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail.trim();
    }
  }
  return fallback;
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Check your connection and try again.",
      "network",
    );
  }

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const message = errorMessage(
      payload,
      "Something went wrong. Please try again.",
    );
    const code: ApiErrorCode =
      response.status >= 500
        ? "server"
        : response.status === 401
          ? "auth"
          : "validation";

    throw new ApiError(message, code, response.status);
  }

  return payload;
}

export async function login(credentials: Credentials): Promise<void> {
  await postJson("/api/auth/login", credentials);
}

export async function signup(credentials: Credentials): Promise<void> {
  await postJson("/api/auth/signup", credentials);
}

export async function logout(): Promise<void> {
  await postJson("/api/auth/logout", {});
}

export async function getLikedSongs(username: string): Promise<Set<string>> {
  const response = await fetch(`/api/${encodeURIComponent(username)}/get_liked_songs`, {
    credentials: "include",
    cache: "no-store",
  });
  const payload = (await readJsonSafe(response)) as { liked_song_list?: unknown } | null;
  if (!response.ok) {
    throw new ApiError("Couldn't load your liked songs.", "server", response.status);
  }
  const result = payload?.liked_song_list;
  const songs = Array.isArray(result) && Array.isArray(result[1]) ? result[1] : [];
  return new Set(songs.filter((song): song is string => typeof song === "string"));
}

export async function setLikedSong(
  username: string,
  songId: string,
  liked: boolean,
): Promise<void> {
  const response = await fetch(
    `/api/${encodeURIComponent(username)}/${liked ? "like_song" : "unlike_song"}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, songid: songId }),
    },
  );
  if (!response.ok) {
    throw new ApiError("Couldn't update liked songs.", "server", response.status);
  }
}

/* --------------------------------------------------------------------------
 * Library
 *
 * Contract verified against the FastAPI backend + `data/musicmanager.py`:
 *   GET /api/dashboard ->
 *     { "session_validity": true, "aoi": "Session key is valid", "songs": [...] }
 *
 * `aoi` is a status string (not account data) and `songs` is an array of file
 * names such as "z3OKd5b2Rlw.mp3". The audio endpoint expects the file name
 * WITHOUT its extension, so a `Song` carries both the derived id and the
 * original filename.
 * ------------------------------------------------------------------------ */

export type Song = {
  /** File name without extension — the id the audio endpoint expects. */
  id: string;
  /** Original file name exactly as returned by the dashboard. */
  filename: string;
  /** Display title. The backend exposes no metadata, so this is the id. */
  title: string;
  /** Upper-case extension, e.g. "MP3". Derived from the file name. */
  format: string;
};

export type Dashboard = {
  sessionValidity: boolean;
  /** Status message from the backend (the `aoi` field is a string here). */
  aoi: string;
  /** Signed-in username supplied by the frontend bridge from the cookie. */
  username: string | null;
  songs: Song[];
};

export function toSong(filename: string): Song {
  const dot = filename.lastIndexOf(".");
  const id = dot > 0 ? filename.slice(0, dot) : filename;
  const format = dot > 0 ? filename.slice(dot + 1).toUpperCase() : "";
  return { id, filename, title: id, format };
}

export function audioUrl(songId: string): string {
  return `/api/music/${encodeURIComponent(songId)}/audio`;
}

export async function getDashboard(signal?: AbortSignal): Promise<Dashboard> {
  let response: Response;
  try {
    response = await fetch("/api/dashboard", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Couldn't reach the server. Check your connection and try again.",
      "network",
    );
  }

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new ApiError(
        errorMessage(payload, "Your session has expired. Please sign in again."),
        "unauthenticated",
        response.status,
      );
    }
    throw new ApiError(
      errorMessage(payload, "Couldn't load your library. Please try again."),
      response.status >= 500 ? "server" : "validation",
      response.status,
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new ApiError("Unexpected response from the server.", "server", 502);
  }

  const raw = payload as {
    session_validity?: unknown;
    aoi?: unknown;
    songs?: unknown;
    account?: unknown;
  };

  const songs = Array.isArray(raw.songs)
    ? raw.songs.filter((value): value is string => typeof value === "string").map(toSong)
    : [];

  const accountName =
    raw.account && typeof raw.account === "object"
      ? (raw.account as { username?: unknown }).username
      : undefined;

  return {
    sessionValidity: raw.session_validity === true,
    aoi: typeof raw.aoi === "string" ? raw.aoi : "",
    username: typeof accountName === "string" ? accountName : null,
    songs,
  };
}
