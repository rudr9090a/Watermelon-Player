"use client";

import { ArrowRight, Pause, Play } from "@/components/icons";
import type { Song } from "@/lib/api";
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
};

export function HomeView({
  songs,
  currentId,
  isPlaying,
  onSelect,
  onBrowse,
}: HomeViewProps) {
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
                    className={styles.card}
                    onClick={() => onSelect(song)}
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
        </section>
      )}
    </div>
  );
}
