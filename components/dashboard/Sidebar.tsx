"use client";

import { useState } from "react";
import { Heart, Home, Library, LogOut, Plus } from "@/components/icons";
import { Logo } from "@/components/site/Logo";
import { Spinner } from "@/components/ui/Spinner";
import type { Playlist } from "@/lib/api";
import styles from "./Sidebar.module.css";

export type DashboardView =
  | "home"
  | "library"
  | "liked"
  | "playlists"
  | "add"
  | `playlist:${string}`;

type SidebarProps = {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  username: string | null;
  onSignOut: () => void;
  signingOut: boolean;
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => Promise<void>;
  onRenamePlaylist: (playlistId: string, name: string) => Promise<void>;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
};

export function Sidebar({
  view,
  onViewChange,
  username,
  onSignOut,
  signingOut,
  playlists,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
}: SidebarProps) {
  const [playlistName, setPlaylistName] = useState("");
  const initial = username ? username.charAt(0).toUpperCase() : "S";

  const items: { id: DashboardView; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Library },
    { id: "liked", label: "Liked Songs", icon: Heart },
  ];

  return (
    <aside
      id="dashboard-nav"
      className={styles.sidebar}
      aria-label="Dashboard navigation"
    >
      <div className={styles.top}>
        <Logo href="/dashboard" />
      </div>

      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={[styles.navItem, active && styles.active]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onViewChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className={[styles.addSong, view === "add" && styles.addSongActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onViewChange("add")}
        aria-current={view === "add" ? "page" : undefined}
      >
        <Plus size={18} />
        <span>Add song</span>
      </button>

      <div className={styles.playlists}>
        <p className={styles.playlistLabel}>PLAYLISTS</p>
        {playlists.map((playlist) => (
          <div key={playlist.id} className={styles.playlistRow}>
            <button type="button" className={[styles.playlistItem, view === `playlist:${playlist.id}` && styles.active].filter(Boolean).join(" ")} onClick={() => onViewChange(`playlist:${playlist.id}`)}>
              {playlist.name}
            </button>
            <button type="button" className={styles.playlistAction} onClick={async () => { const name = window.prompt("Rename playlist", playlist.name)?.trim(); if (name && name !== playlist.name) await onRenamePlaylist(playlist.id, name); }} aria-label={`Rename ${playlist.name}`}>R</button>
            <button type="button" className={styles.playlistAction} onClick={async () => { if (window.confirm(`Delete "${playlist.name}"?`)) await onDeletePlaylist(playlist.id); }} aria-label={`Delete ${playlist.name}`}>×</button>
          </div>
        ))}
        <form
          className={styles.playlistCreate}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!playlistName.trim()) return;
            await onCreatePlaylist(playlistName.trim());
            setPlaylistName("");
          }}
        >
          <input value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="+ New playlist" aria-label="New playlist name" />
        </form>
      </div>

      <div className={styles.account}>
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
        <div className={styles.accountMeta}>
          <p className={styles.accountName}>{username ?? "Signed in"}</p>
          <p className={styles.accountSub}>Self-hosted library</p>
        </div>
        <button
          type="button"
          className={styles.signOut}
          onClick={onSignOut}
          disabled={signingOut}
          aria-label="Sign out"
          title="Sign out"
        >
          {signingOut ? <Spinner /> : <LogOut size={18} />}
        </button>
      </div>
    </aside>
  );
}
