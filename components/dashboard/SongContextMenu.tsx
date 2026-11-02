"use client";

import { useEffect } from "react";
import type { Playlist, Song } from "@/lib/api";
import styles from "./SongContextMenu.module.css";

export function SongContextMenu({
  song,
  x,
  y,
  playlists,
  playlistId,
  onAdd,
  onRemove,
  onClose,
}: {
  song: Song;
  x: number;
  y: number;
  playlists: Playlist[];
  playlistId?: string;
  onAdd: (playlistId: string, songId: string) => void;
  onRemove?: (playlistId: string, songId: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  return (
    <div
      className={styles.menu}
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
      role="menu"
    >
      <p className={styles.heading}>{onRemove ? "Playlist options" : "Add to playlist"}</p>
      {onRemove ? (
        <button type="button" role="menuitem" onClick={() => { if (playlistId) onRemove(playlistId, song.id); onClose(); }}>
          Remove from playlist
        </button>
      ) : playlists.length ? playlists.map((playlist) => (
        <button
          key={playlist.id}
          type="button"
          role="menuitem"
          onClick={() => {
            onAdd(playlist.id, song.id);
            onClose();
          }}
        >
          {playlist.name}
        </button>
      )) : <p className={styles.empty}>Create a playlist first.</p>}
    </div>
  );
}
