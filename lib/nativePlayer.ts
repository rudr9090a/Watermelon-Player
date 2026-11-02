import { audioUrl, type Song } from "./api";

export type NativePlaybackState = {
  currentId: string | null;
  positionMs: number;
  durationMs: number;
  status: "idle" | "ready" | "buffering" | "playing" | "paused" | "ended" | "error";
  error: string | null;
  shuffle: boolean;
  repeat: boolean;
  hasNext: boolean;
  hasPrev: boolean;
};

export type NativeTrack = {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  durationMs?: number;
  audioUrl: string;
  artUrl?: string;
};

type NativeBridge = {
  setQueue(payload: string): void;
  playIndex(index: number): void;
  play(): void;
  pause(): void;
  toggle(): void;
  next(): void;
  prev(): void;
  seek(positionMs: number): void;
  setVolume(volume: number): void;
  setShuffle(enabled: boolean): void;
  setRepeat(enabled: boolean): void;
  stop(): void;
  requestState(): void;
  requestQueue(): void;
};

declare global {
  interface Window {
    AndroidPlayer?: NativeBridge;
    __watermelonNative?: boolean;
    __watermelonNativeState?: (payload: string) => void;
    __watermelonNativeQueue?: (payload: string) => void;
  }
}

export function nativeBridge(): NativeBridge | null {
  if (typeof window === "undefined") return null;
  return window.AndroidPlayer ?? null;
}

export function isNativePlayer(): boolean {
  return nativeBridge() !== null;
}

export function toNativeTracks(songs: Song[]): NativeTrack[] {
  const origin = window.location.origin;
  return songs.map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    durationMs: typeof song.duration === "number" ? Math.round(song.duration * 1000) : undefined,
    audioUrl: new URL(audioUrl(song.id), origin).toString(),
    artUrl: song.thumbnail
      ? new URL(`/api/get_song_thumbnail/${encodeURIComponent(song.id)}`, origin).toString()
      : undefined,
  }));
}

export function sendNativeQueue(songs: Song[], startIndex: number): void {
  nativeBridge()?.setQueue(JSON.stringify({
    queue: toNativeTracks(songs),
    startIndex,
    play: true,
  }));
}

export function subscribeNativeState(listener: (state: NativePlaybackState) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const previous = window.__watermelonNativeState;
  window.__watermelonNativeState = (payload) => {
    previous?.(payload);
    try {
      listener(JSON.parse(payload) as NativePlaybackState);
    } catch {
      // Ignore malformed state from a stale or incompatible native shell.
    }
  };
  return () => {
    if (window.__watermelonNativeState) window.__watermelonNativeState = previous;
  };
}

export function subscribeNativeQueue(listener: (tracks: NativeTrack[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const previous = window.__watermelonNativeQueue;
  window.__watermelonNativeQueue = (payload) => {
    previous?.(payload);
    try {
      const parsed = JSON.parse(payload) as { queue?: NativeTrack[] };
      listener(Array.isArray(parsed.queue) ? parsed.queue : []);
    } catch {
      // Ignore malformed queue data from a stale or incompatible native shell.
    }
  };
  return () => {
    if (window.__watermelonNativeQueue) window.__watermelonNativeQueue = previous;
  };
}
