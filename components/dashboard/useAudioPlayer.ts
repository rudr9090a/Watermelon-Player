"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { audioUrl, type Song } from "@/lib/api";
import {
  isNativePlayer,
  nativeBridge,
  sendNativeQueue,
  subscribeNativeQueue,
  subscribeNativeState,
  type NativePlaybackState,
  type NativeTrack,
} from "@/lib/nativePlayer";

export type AudioPlayer = {
  audioRef: RefObject<HTMLAudioElement | null>;
  current: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
  select: (song: Song) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  stop: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  shuffle: boolean;
  repeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

/**
 * Owns a single HTMLAudioElement and all of its playback state. One hook
 * instance is shared by the dashboard, so switching tracks never creates a
 * second simultaneous player. Playback state is derived from the element's
 * own events rather than being updated during render.
 */
export function useAudioPlayer(songs: Song[]): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nativeMode = useState(() => isNativePlayer())[0];
  const nativeQueue = useRef<Song[]>([]);
  const nativeTracks = useRef<NativeTrack[]>([]);
  const nativeState = useRef<NativePlaybackState | null>(null);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [error, setError] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const playSong = useCallback((song: Song) => {
    if (nativeMode) {
      const index = songs.findIndex((candidate) => candidate.id === song.id);
      const queue = index >= 0 ? songs : [song, ...songs];
      const startIndex = index >= 0 ? index : 0;
      nativeQueue.current = queue;
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      setIsBuffering(true);
      setCurrent(song);
      sendNativeQueue(queue, startIndex);
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(true);
    setCurrent(song);
    audio.src = audioUrl(song.id);
    audio.load();
    const promise = audio.play();
    if (promise) {
      promise.catch(() => {
        // Autoplay can be blocked; the element's events drive the UI state.
      });
    }
  }, [nativeMode, songs]);

  const toggle = useCallback(() => {
    if (nativeMode) {
      if (current) nativeBridge()?.toggle();
      return;
    }
    const audio = audioRef.current;
    if (!audio || !current) {
      return;
    }
    if (audio.paused) {
      const promise = audio.play();
      if (promise) {
        promise.catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [current, nativeMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.code !== "Space" || isEditing || target?.closest("button")) {
        return;
      }

      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const select = useCallback(
    (song: Song) => {
      if (current?.id === song.id) {
        toggle();
      } else {
        playSong(song);
      }
    },
    [current, playSong, toggle],
  );

  const advance = useCallback(
    (delta: number) => {
      if (!current) {
        return;
      }
      if (nativeMode) {
        if (delta > 0) nativeBridge()?.next();
        else nativeBridge()?.prev();
        return;
      }
      const index = songs.findIndex((song) => song.id === current.id);
      if (index === -1) {
        return;
      }
      const target = shuffle && delta > 0
        ? songs[Math.floor(Math.random() * songs.length)]
        : songs[index + delta];
      if (target) {
        playSong(target);
      }
    },
    [current, nativeMode, songs, playSong, shuffle],
  );

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => advance(-1), [advance]);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => {
      const next = !value;
      if (nativeMode) nativeBridge()?.setShuffle(next);
      return next;
    });
  }, [nativeMode]);
  const toggleRepeat = useCallback(() => {
    setRepeat((value) => {
      const next = !value;
      if (nativeMode) nativeBridge()?.setRepeat(next);
      return next;
    });
  }, [nativeMode]);

  const seek = useCallback((seconds: number) => {
    if (nativeMode) {
      nativeBridge()?.seek(Math.max(0, seconds * 1000));
      setCurrentTime(seconds);
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, [nativeMode]);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    if (nativeMode) {
      nativeBridge()?.setVolume(value);
      return;
    }
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }, [nativeMode]);

  const stop = useCallback(() => {
    if (nativeMode) {
      nativeBridge()?.stop();
      setCurrent(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying(false);
    setIsBuffering(false);
  }, [nativeMode]);

  useEffect(() => {
    if (nativeMode) return;
    return stop;
  }, [nativeMode, stop]);

  useEffect(() => {
    if (!nativeMode) return;

    const applyState = (state: NativePlaybackState) => {
      nativeState.current = state;
      const song = nativeQueue.current.find((candidate) => candidate.id === state.currentId);
      const track = nativeTracks.current.find((candidate) => candidate.id === state.currentId);
      if (state.currentId) {
        setCurrent(song ?? (track ? {
          id: track.id,
          filename: `${track.id}.mp3`,
          title: track.title,
          format: "MP3",
          artist: track.artist,
          album: track.album,
          duration: track.durationMs ? track.durationMs / 1000 : undefined,
          thumbnail: track.artUrl,
        } : {
          id: state.currentId,
          filename: `${state.currentId}.mp3`,
          title: state.currentId,
          format: "MP3",
        }));
      } else {
        setCurrent(null);
      }
      setCurrentTime(Math.max(0, state.positionMs) / 1000);
      setDuration(Math.max(0, state.durationMs) / 1000);
      setIsPlaying(state.status === "playing");
      setIsBuffering(state.status === "buffering");
      setError(state.status === "error" ? (state.error ?? "This track could not be played.") : null);
      setShuffle(state.shuffle);
      setRepeat(state.repeat);
    };

    const unsubscribeState = subscribeNativeState(applyState);
    const unsubscribeQueue = subscribeNativeQueue((tracks) => {
      nativeTracks.current = tracks;
      if (nativeState.current) applyState(nativeState.current);
    });
    const bridge = nativeBridge();
    bridge?.requestState();
    bridge?.requestQueue();
    bridge?.setVolume(volume);
    return () => {
      unsubscribeState();
      unsubscribeQueue();
    };
  }, [nativeMode]);

  // Attach the listeners once per `advance` identity (i.e. per track change).
  useEffect(() => {
    if (nativeMode) return;
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleDuration = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      if (repeat && audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      } else {
        advance(1);
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setError(
        "This track couldn't be played. The file may be missing or an unsupported format.",
      );
    };

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("durationchange", handleDuration);
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("durationchange", handleDuration);
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [advance, nativeMode, repeat]);

  useEffect(() => {
    if (!nativeMode && audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [nativeMode, volume]);

  const currentIndex = current
    ? songs.findIndex((song) => song.id === current.id)
    : -1;

  return {
    audioRef,
    current,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    error,
    select,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    stop,
    hasNext: nativeMode ? Boolean(nativeState.current?.hasNext) : currentIndex >= 0 && currentIndex < songs.length - 1,
    hasPrev: nativeMode ? Boolean(nativeState.current?.hasPrev) : currentIndex > 0,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  };
}
