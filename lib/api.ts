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

export async function requestSignupOtp(credentials: Credentials): Promise<void> {
  await postJson("/api/auth/signup", credentials);
}

export async function signup(credentials: Credentials, otp: string): Promise<void> {
  await postJson("/api/auth/signup/verify", { ...credentials, otp });
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

export async function downloadAlbum(url: string): Promise<void> {
  const response = await fetch("/api/downloadalbumyt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const payload = await readJsonSafe(response);
    throw new ApiError(errorMessage(payload, "Couldn't download the album."), "server", response.status);
  }
}

/* --------------------------------------------------------------------------
 * Add song (YouTube Music via Storter's yt-dlp bridge)
 * ------------------------------------------------------------------------ */

export type SongSearchResult = {
  video_id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
};

export type AddSongJob = {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  song?: {
    video_id: string;
    filename: string;
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
    thumbnail?: string;
  } | null;
  error?: string | null;
};

export async function searchSongs(
  query: string,
  limit = 8,
  signal?: AbortSignal,
): Promise<SongSearchResult[]> {
  const response = await fetch(
    `/api/search_songs?q=${encodeURIComponent(query)}&limit=${limit}`,
    { credentials: "include", cache: "no-store", signal },
  );
  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new ApiError(
      errorMessage(payload, "Couldn't search for songs."),
      response.status >= 500 ? "server" : "validation",
      response.status,
    );
  }
  const results =
    payload && typeof payload === "object"
      ? (payload as { results?: unknown }).results
      : undefined;
  return Array.isArray(results) ? (results as SongSearchResult[]) : [];
}

export async function startAddSong(target: {
  url?: string;
  videoId?: string;
  query?: string;
}): Promise<{ jobId: string; status: string }> {
  const response = await fetch("/api/add_song", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      url: target.url,
      video_id: target.videoId,
      query: target.query,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new ApiError(
      errorMessage(payload, "Couldn't add that song."),
      response.status >= 500 ? "server" : "validation",
      response.status,
    );
  }
  const record =
    payload && typeof payload === "object"
      ? (payload as { job_id?: unknown; status?: unknown })
      : {};
  if (typeof record.job_id !== "string") {
    throw new ApiError("Unexpected response from the server.", "server", 502);
  }
  return {
    jobId: record.job_id,
    status: typeof record.status === "string" ? record.status : "queued",
  };
}

export async function getAddSongJob(jobId: string): Promise<AddSongJob> {
  const response = await fetch(`/api/add_song/${encodeURIComponent(jobId)}`, {
    credentials: "include",
    cache: "no-store",
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new ApiError(
      errorMessage(payload, "Couldn't check the download status."),
      response.status >= 500 ? "server" : "validation",
      response.status,
    );
  }
  return payload as AddSongJob;
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
  artist?: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: { id: string }[];
};

async function playlistRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: "include", cache: "no-store" });
  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw new ApiError(errorMessage(payload, "Playlist request failed."), "server", response.status);
  }
  return payload as T;
}

export async function getPlaylists(): Promise<Playlist[]> {
  const payload = await playlistRequest<{ playlists?: unknown }>("/api/playlists");
  return Array.isArray(payload.playlists) ? payload.playlists as Playlist[] : [];
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const payload = await playlistRequest<{ playlist: Playlist }>("/api/playlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return payload.playlist;
}

export async function renamePlaylist(playlistId: string, name: string): Promise<Playlist> {
  const payload = await playlistRequest<{ playlist: Playlist }>(`/api/playlists/${encodeURIComponent(playlistId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return payload.playlist;
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  await playlistRequest(`/api/playlists/${encodeURIComponent(playlistId)}`, { method: "DELETE" });
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist> {
  const payload = await playlistRequest<{ playlist: Playlist }>(`/api/playlists/${encodeURIComponent(playlistId)}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songid: songId }),
  });
  return payload.playlist;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist> {
  const payload = await playlistRequest<{ playlist: Playlist }>(`/api/playlists/${encodeURIComponent(playlistId)}/songs/${encodeURIComponent(songId)}`, {
    method: "DELETE",
  });
  return payload.playlist;
}

export type PlaylistImportStatus = {
  import_id: string;
  playlist_id: string;
  status: "queued" | "running" | "completed" | "failed";
  total: number;
  processed: number;
  added: number;
  skipped: number;
  error: string | null;
};

export async function startPlaylistImport(playlistId: string, url: string): Promise<string> {
  const payload = await playlistRequest<{ import_id: string }>(`/api/playlists/${encodeURIComponent(playlistId)}/imports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return payload.import_id;
}

export async function getPlaylistImport(importId: string): Promise<PlaylistImportStatus> {
  return playlistRequest<PlaylistImportStatus>(`/api/playlist-imports/${encodeURIComponent(importId)}`);
}

export type Dashboard = {
  sessionValidity: boolean;
  /** Status message from the backend (the `aoi` field is a string here). */
  aoi: string;
  /** Signed-in username supplied by the frontend bridge from the cookie. */
  username: string | null;
  songs: Song[];
};

export function toSong(filename: string, metadata?: Record<string, unknown>): Song {
  const dot = filename.lastIndexOf(".");
  const id = dot > 0 ? filename.slice(0, dot) : filename;
  const format = dot > 0 ? filename.slice(dot + 1).toUpperCase() : "";
  return {
    id,
    filename,
    title: typeof metadata?.title === "string" ? metadata.title : id,
    format: typeof metadata?.audio_format === "string" ? metadata.audio_format.toUpperCase() : format,
    artist: typeof metadata?.artist === "string" ? metadata.artist : undefined,
    album: typeof metadata?.album === "string" ? metadata.album : undefined,
    duration: typeof metadata?.duration === "number" ? metadata.duration : undefined,
    thumbnail: typeof metadata?.thumbnail === "string" ? metadata.thumbnail : undefined,
  };
}

const songMetadataMemory = new Map<string, Record<string, unknown> | undefined>();
const songMetadataInflight = new Map<string, Promise<Record<string, unknown> | undefined>>();

const SONG_METADATA_CACHE_PREFIX = "watermelon:song-metadata:";

/**
 * Read a song's metadata from the on-device (localStorage) cache.
 *
 * This is intentionally synchronous so the dashboard can render cached titles,
 * artists and thumbnails on the very first paint — before any network request.
 * The WebView keeps localStorage across app restarts, so this survives reboots.
 */
export function readCachedSongMetadata(id: string): Record<string, unknown> | undefined {
  const memo = songMetadataMemory.get(id);
  if (memo) return memo;
  if (typeof window === "undefined") return undefined;
  try {
    const cached = window.localStorage.getItem(`${SONG_METADATA_CACHE_PREFIX}${id}`);
    if (!cached) return undefined;
    const parsed = JSON.parse(cached) as unknown;
    if (parsed && typeof parsed === "object") {
      const metadata = parsed as Record<string, unknown>;
      if (typeof metadata.detail === "string" && typeof metadata.title !== "string") {
        // Drop stale "unfinished download" placeholders so they get retried.
        try { window.localStorage.removeItem(`${SONG_METADATA_CACHE_PREFIX}${id}`); } catch { /* ignore */ }
        return undefined;
      }
      songMetadataMemory.set(id, metadata);
      return metadata;
    }
  } catch { /* Ignore unavailable or corrupt browser storage. */ }
  return undefined;
}

/** Store freshly downloaded metadata so the new song renders immediately. */
export function primeSongMetadata(id: string, metadata: Record<string, unknown>): void {
  if (!id || !metadata || typeof metadata !== "object") return;
  songMetadataMemory.set(id, metadata);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${SONG_METADATA_CACHE_PREFIX}${id}`,
      JSON.stringify(metadata),
    );
  } catch { /* Storage is optional. */ }
}

export async function getSongMetadata(id: string): Promise<Record<string, unknown> | undefined> {
  const memo = songMetadataMemory.get(id);
  if (memo) return memo;
  const cached = readCachedSongMetadata(id);
  if (cached) return cached;
  const pending = songMetadataInflight.get(id);
  if (pending) return pending;

  const request = getSongMetadataOnce(id);
  songMetadataInflight.set(id, request);
  try {
    const result = await request;
    songMetadataMemory.set(id, result);
    return result;
  } finally {
    songMetadataInflight.delete(id);
  }
}

async function getSongMetadataOnce(id: string): Promise<Record<string, unknown> | undefined> {
  const cacheKey = `${SONG_METADATA_CACHE_PREFIX}${id}`;
  try {
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as unknown;
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    }
  } catch { /* Ignore unavailable or corrupt browser storage. */ }
  try {
    const response = await fetch(`/api/get_song_data/${encodeURIComponent(id)}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) return undefined;
    const payload = await response.json();
    if (payload && typeof payload === "object") {
      const metadata = payload as Record<string, unknown>;
      // The backend returns `{ "detail": "unfinished downloaded song" }` for
      // incomplete downloads; never cache that, or the song stays nameless.
      if (typeof metadata.detail === "string" && typeof metadata.title !== "string") {
        return undefined;
      }
      try { window.localStorage.setItem(cacheKey, JSON.stringify(metadata)); } catch { /* Storage is optional. */ }
      return metadata;
    }
    return undefined;
  } catch {
    return undefined;
  }
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

  const filenames = Array.isArray(raw.songs)
    ? raw.songs.filter((value): value is string => typeof value === "string")
    : [];
  // Seed every song from the on-device cache so titles/artists/thumbnails show
  // immediately on load instead of flashing raw file ids until metadata loads.
  const songs = filenames.map((filename) => {
    const song = toSong(filename);
    const cached = readCachedSongMetadata(song.id);
    return cached ? toSong(filename, cached) : song;
  });

  const accountName =
    raw.account && typeof raw.account === "object"
      ? (raw.account as { username?: unknown }).username
      : undefined;

  return {
    sessionValidity: true,
    aoi: "",
    username: typeof accountName === "string" ? accountName : null,
    songs,
  };
}
