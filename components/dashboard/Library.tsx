"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Search } from "@/components/icons";
import type { Playlist, Song } from "@/lib/api";
import { SongContextMenu } from "./SongContextMenu";
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
  playlists?: Playlist[];
  playlistId?: string;
  onAddToPlaylist?: (playlistId: string, songId: string) => void;
  onRemoveFromPlaylist?: (playlistId: string, songId: string) => void;
  onPlayAll?: () => void;
  onShuffleAll?: () => void;
  onImport?: (url: string) => Promise<void>;
  onSongVisible?: (songId: string) => void;
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

export function Library({ songs, title = "Library", currentId, isPlaying, onSelect, playlists = [], playlistId, onAddToPlaylist, onRemoveFromPlaylist, onPlayAll, onShuffleAll, onImport, onSongVisible }: LibraryProps) {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<{ song: Song; x: number; y: number } | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

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
          {onPlayAll ? (
            <div className={styles.playlistActions}>
              <button type="button" onClick={onPlayAll} disabled={!songs.length} aria-label={`Play ${title}`}><Play size={16} /></button>
              <button type="button" onClick={onShuffleAll} disabled={!songs.length}>Shuffle</button>
            </div>
          ) : null}
          {onImport ? (
            <form className={styles.importForm} onSubmit={async (event) => {
              event.preventDefault();
              if (!importUrl.trim()) return;
              setImporting(true);
              setImportMessage("");
              try {
                await onImport(importUrl.trim());
                setImportUrl("");
                setImportMessage("Import completed.");
              } catch (error) {
                setImportMessage(error instanceof Error ? error.message : "Import failed.");
              } finally {
                setImporting(false);
              }
            }}>
            <input value={importUrl} onChange={(event) => setImportUrl(event.target.value)} placeholder="YouTube playlist URL" disabled={importing} aria-label="YouTube playlist URL" />
            <button type="submit" disabled={importing}>{importing ? "Importing..." : "Import"}</button>
            {importMessage ? <span role="status">{importMessage}</span> : null}
            </form>
          ) : null}
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
                <div
                  ref={(node) => {
                    if (!node || !onSongVisible) return;
                    const observer = new IntersectionObserver(([entry]) => {
                      if (entry.isIntersecting) { onSongVisible(song.id); observer.disconnect(); }
                    }, { rootMargin: "240px" });
                    observer.observe(node);
                  }}
                  role="button"
                  tabIndex={0}
                  className={[styles.row, active && styles.rowActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelect(song)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContext({ song, x: event.clientX, y: event.clientY });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(song);
                  }}
                  aria-label={`${playingThis ? "Pause" : "Play"} ${song.title}`}
                >
                  <span className={styles.index}>
                    {playingThis ? <Equalizer /> : index + 1}
                  </span>
                  <span className={styles.rowPlay} aria-hidden="true">
                    {playingThis ? <Pause size={16} /> : <Play size={16} />}
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {context ? <SongContextMenu {...context} playlistId={playlistId} playlists={playlists} onAdd={onAddToPlaylist ?? (() => {})} onRemove={playlistId ? onRemoveFromPlaylist : undefined} onClose={() => setContext(null)} /> : null}
    </div>
  );
}
