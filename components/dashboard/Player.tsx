"use client";

import {
  Heart,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from "@/components/icons";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { AudioPlayer } from "./useAudioPlayer";
import { formatTime, toneFor } from "./utils";
import tones from "./tones.module.css";
import styles from "./Player.module.css";

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  label: string;
  valueText?: string;
  disabled?: boolean;
};

function Slider({
  value,
  min,
  max,
  step,
  onValueChange,
  label,
  valueText,
  disabled,
}: SliderProps) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className={styles.slider}>
      <div className={styles.sliderTrack} aria-hidden="true">
        <div className={styles.sliderFill} style={{ width: `${percent}%` }} />
      </div>
      <input
        type="range"
        className={styles.sliderInput}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        aria-label={label}
        aria-valuetext={valueText}
        disabled={disabled}
      />
    </div>
  );
}

export function Player({ player }: { player: AudioPlayer }) {
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(false);
  const {
    audioRef,
    current,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    error,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    hasNext,
    hasPrev,
  } = player;

  const hasTrack = current !== null;
  const canSeek = hasTrack && duration > 0;
  const position = canSeek ? Math.min(currentTime, duration) : 0;
  const artClass = current
    ? tones[`art${toneFor(current.id).toUpperCase()}`]
    : styles.artIdle;

  return (
    <div className={styles.player}>
      <audio ref={audioRef} preload="metadata" />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.now}>
        <span className={[styles.art, artClass].filter(Boolean).join(" ")} aria-hidden="true">
          <Music size={18} />
        </span>
        <div className={styles.nowMeta}>
          {current ? (
            <>
              <p className={styles.nowTitle} title={current.title}>
                {current.title}
              </p>
              <p className={styles.nowSub}>
                {current.format ? `${current.format} · ` : ""}Your library
              </p>
            </>
          ) : (
            <>
              <p className={styles.nowTitle}>Nothing playing</p>
              <p className={styles.nowSub}>Select a track from your library</p>
            </>
          )}
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.controls}>
          <button
            type="button"
            className={[styles.control, shuffle ? styles.activeControl : ""].join(" ")}
            onClick={() => setShuffle((value) => !value)}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
          >
            <Shuffle size={16} />
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={prev}
            disabled={!hasPrev}
            aria-label="Previous track"
          >
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={toggle}
            disabled={!hasTrack}
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-busy={isBuffering || undefined}
          >
            {isBuffering ? (
              <Spinner />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={next}
            disabled={!hasNext}
            aria-label="Next track"
          >
            <SkipForward size={18} />
          </button>
          <button
            type="button"
            className={[styles.control, repeat ? styles.activeControl : ""].join(" ")}
            onClick={() => setRepeat((value) => !value)}
            aria-label="Toggle repeat"
            aria-pressed={repeat}
          >
            <Repeat size={16} />
          </button>
        </div>

        <div className={styles.progress}>
          <span className={styles.time}>{formatTime(position)}</span>
          <Slider
            value={position}
            min={0}
            max={canSeek ? duration : 1}
            step={0.1}
            onValueChange={seek}
            label="Seek"
            valueText={`${formatTime(position)} of ${
              canSeek ? formatTime(duration) : "unknown duration"
            }`}
            disabled={!canSeek}
          />
          <span className={styles.time}>
            {canSeek ? formatTime(duration) : "--:--"}
          </span>
        </div>
      </div>

      <div className={styles.volume}>
        <button
          type="button"
          className={[styles.likeButton, liked ? styles.liked : ""].join(" ")}
          onClick={() => setLiked((value) => !value)}
          aria-label={liked ? "Unlike track" : "Like track"}
          aria-pressed={liked}
          disabled={!hasTrack}
        >
          <Heart size={17} />
        </button>
        <Volume size={17} />
        <Slider
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={setVolume}
          label="Volume"
          valueText={`${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
}
