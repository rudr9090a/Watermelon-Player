"use client";

import { ArrowRight, Pause, Play } from "@/components/icons";
import type { Playlist, Song } from "@/lib/api";
import { useState } from "react";
import { SongContextMenu } from "./SongContextMenu";
import { EmptyLibrary } from "./states";
import { toneFor } from "./utils";
import tones from "./tones.module.css";
import styles from "./HomeView.module.css";

type HomeViewProps = {
  songs: Song[];
  currentId: string | null;
  isPlaying: boolean;
  onSelect: (song: Song) => void;
  onBrowse: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onSongVisible?: (songId: string) => void;
  likedSongs?: Song[];
};

export function HomeView({
  songs,
  currentId,
  isPlaying,
  onSelect,
  onBrowse,
  playlists,
  onAddToPlaylist,
  onSongVisible,
  likedSongs = [],
}: HomeViewProps) {
  const [context, setContext] = useState<{ song: Song; x: number; y: number } | null>(null);
  const trackLabel = songs.length === 1 ? "track" : "tracks";

  return (
    <div className={styles.home}>
      <header className={styles.head}>
        <h1 className={styles.title}>Your library</h1>
        <p className={styles.sub}>
          {songs.length === 0
            ? "No tracks yet."
            : `${songs.length} ${trackLabel} ready to play.`}
        </p>
      </header>

      {songs.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <button type="button" className={styles.browse} onClick={onBrowse}>
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          <ul className={styles.grid}>
            {songs.slice(0, 8).map((song) => {
              const active = song.id === currentId;
              const playingThis = active && isPlaying;
              return (
                <li key={song.id}>
                  <button
                  type="button"
                  ref={(node) => {
                    if (!node || !onSongVisible) return;
                    const observer = new IntersectionObserver(([entry]) => {
                      if (entry.isIntersecting) { onSongVisible(song.id); observer.disconnect(); }
                    }, { rootMargin: "240px" });
                    observer.observe(node);
                  }}
                    className={styles.card}
                    onClick={() => onSelect(song)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setContext({ song, x: event.clientX, y: event.clientY });
                    }}
                    aria-label={`${playingThis ? "Pause" : "Play"} ${song.title}`}
                  >
                    <span
                      className={[styles.art, tones[`art${toneFor(song.id).toUpperCase()}`]]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {song.thumbnail ? (
                        <img
                          className={styles.thumbnail}
                          src={`/api/get_song_thumbnail/${encodeURIComponent(song.id)}`}
                          alt=""
                        />
                      ) : null}
                      <span className={styles.playBadge} aria-hidden="true">
                        {playingThis ? <Pause size={16} /> : <Play size={16} />}
                      </span>
                    </span>
                    <span className={styles.cardTitle} title={song.title}>
                      {song.title}
                    </span>
                    <span className={styles.cardMeta}>{song.format || "Audio"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {likedSongs.length > 0 ? (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.title}>Liked Songs</h2>
              </div>
              <ul className={styles.grid}>
                {likedSongs.slice(0, 8).map((song) => {
                  const active = song.id === currentId;
                  const playingThis = active && isPlaying;
                  return (
                    <li key={`liked-${song.id}`}>
                      <button
                        type="button"
                        className={styles.card}
                        onClick={() => onSelect(song)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          setContext({ song, x: event.clientX, y: event.clientY });
                        }}
                        aria-label={`${playingThis ? "Pause" : "Play"} ${song.title}`}
                      >
                        <span className={[styles.art, tones[`art${toneFor(song.id).toUpperCase()}`]].filter(Boolean).join(" ")}>
                          {song.thumbnail ? <img className={styles.thumbnail} src={`/api/get_song_thumbnail/${encodeURIComponent(song.id)}`} alt="" /> : null}
                          <span className={styles.playBadge} aria-hidden="true">{playingThis ? <Pause size={16} /> : <Play size={16} />}</span>
                        </span>
                        <span className={styles.cardTitle} title={song.title}>{song.title}</span>
                        <span className={styles.cardMeta}>{song.artist || "Liked song"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </section>
      )}
      {context ? <SongContextMenu {...context} playlists={playlists} onAdd={onAddToPlaylist} onClose={() => setContext(null)} /> : null}
    </div>
  );
}
