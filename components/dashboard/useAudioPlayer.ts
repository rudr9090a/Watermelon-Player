"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { audioUrl, type Song } from "@/lib/api";

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
};

/**
 * Owns a single HTMLAudioElement and all of its playback state. One hook
 * instance is shared by the dashboard, so switching tracks never creates a
 * second simultaneous player. Playback state is derived from the element's
 * own events rather than being updated during render.
 */
export function useAudioPlayer(songs: Song[]): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [error, setError] = useState<string | null>(null);

  const playSong = useCallback((song: Song) => {
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
  }, []);

  const toggle = useCallback(() => {
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
  }, [current]);

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
      const index = songs.findIndex((song) => song.id === current.id);
      if (index === -1) {
        return;
      }
      const target = songs[index + delta];
      if (target) {
        playSong(target);
      }
    },
    [current, songs, playSong],
  );

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => advance(-1), [advance]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  useEffect(() => stop, [stop]);

  // Attach the listeners once per `advance` identity (i.e. per track change).
  useEffect(() => {
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
      advance(1);
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
  }, [advance]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    hasNext: currentIndex >= 0 && currentIndex < songs.length - 1,
    hasPrev: currentIndex > 0,
  };
}
