"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Search } from "@/components/icons";
import type { Song } from "@/lib/api";
import { EmptyLibrary } from "./states";
import { toneFor } from "./utils";
import tones from "./tones.module.css";
import styles from "./Library.module.css";

type LibraryProps = {
  songs: Song[];
  title?: string;
  currentId: string | null;
  isPlaying: boolean;
  onSelect: (song: Song) => void;
};

function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function Library({ songs, title = "Library", currentId, isPlaying, onSelect }: LibraryProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return songs;
    }
    return songs.filter((song) => song.title.toLowerCase().includes(needle));
  }, [songs, query]);

  const trackLabel = songs.length === 1 ? "track" : "tracks";

  return (
    <div className={styles.library}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>{title}</p>
          <h1 className={styles.title}>All tracks</h1>
          <p className={styles.sub}>
            {songs.length} {trackLabel}
          </p>
        </div>

        <div className={styles.search}>
          <Search size={17} className={styles.searchIcon} />
          <input
            id="library-search"
            type="search"
            className={styles.searchInput}
            placeholder="Search your library"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search your library"
            autoComplete="off"
          />
        </div>
      </header>

      {songs.length === 0 ? (
        <EmptyLibrary />
      ) : filtered.length === 0 ? (
        <p className={styles.noResults}>
          No tracks match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((song, index) => {
            const active = song.id === currentId;
            const playingThis = active && isPlaying;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className={[styles.row, active && styles.rowActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelect(song)}
                  aria-label={`${playingThis ? "Pause" : "Play"} ${song.title}`}
                >
                  <span className={styles.index}>
                    {playingThis ? <Equalizer /> : index + 1}
                  </span>
                  <span
                    className={[styles.art, tones[`art${toneFor(song.id).toUpperCase()}`]]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  >
                    {song.thumbnail ? (
                      <img
                        className={styles.thumbnail}
                        src={`/api/get_song_thumbnail/${encodeURIComponent(song.id)}`}
                        alt=""
                      />
                    ) : null}
                  </span>
                  <span className={styles.main}>
                    <span className={styles.rowTitle} title={song.title}>
                      {song.title}
                    </span>
                    <span className={styles.rowMeta}>
                      {song.format || "Audio"} · Local file
                    </span>
                  </span>
                  <span className={styles.rowPlay} aria-hidden="true">
                    {playingThis ? <Pause size={16} /> : <Play size={16} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
