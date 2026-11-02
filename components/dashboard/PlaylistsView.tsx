"use client";

import { useState } from "react";
import { Music, Plus } from "@/components/icons";
import type { Playlist } from "@/lib/api";
import styles from "./PlaylistsView.module.css";

type PlaylistsViewProps = {
  playlists: Playlist[];
  onOpen: (playlistId: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (playlistId: string, name: string) => Promise<void>;
  onDelete: (playlistId: string) => Promise<void>;
};

export function PlaylistsView({
  playlists,
  onOpen,
  onCreate,
  onRename,
  onDelete,
}: PlaylistsViewProps) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className={styles.view}>
      <header className={styles.head}>
        <h1 className={styles.title}>Playlists</h1>
        <p className={styles.sub}>
          {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
        </p>
      </header>

      <form
        className={styles.create}
        onSubmit={async (event) => {
          event.preventDefault();
          const value = name.trim();
          if (!value || busy) return;
          setBusy(true);
          try {
            await onCreate(value);
            setName("");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New playlist name"
          aria-label="New playlist name"
        />
        <button type="submit" disabled={busy || !name.trim()}>
          <Plus size={16} />
          Add
        </button>
      </form>

      {playlists.length === 0 ? (
        <div className={styles.empty}>
          <Music size={26} />
          <p>No playlists yet. Create one above.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {playlists.map((playlist) => (
            <li key={playlist.id} className={styles.row}>
              <button
                type="button"
                className={styles.open}
                onClick={() => onOpen(playlist.id)}
              >
                <span className={styles.art} aria-hidden="true">
                  <Music size={18} />
                </span>
                <span className={styles.meta}>
                  <span className={styles.name}>{playlist.name}</span>
                  <span className={styles.count}>
                    {playlist.songs.length}{" "}
                    {playlist.songs.length === 1 ? "track" : "tracks"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={styles.action}
                aria-label={`Rename ${playlist.name}`}
                onClick={async () => {
                  const next = window.prompt("Rename playlist", playlist.name)?.trim();
                  if (next && next !== playlist.name) {
                    await onRename(playlist.id, next);
                  }
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className={styles.actionDanger}
                aria-label={`Delete ${playlist.name}`}
                onClick={async () => {
                  if (window.confirm(`Delete "${playlist.name}"?`)) {
                    await onDelete(playlist.id);
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
