"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "@/components/icons";
import {
  ApiError,
  getLikedSongs,
  getPlaylists,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  renamePlaylist,
  deletePlaylist,
  startPlaylistImport,
  getPlaylistImport,
  getDashboard,
  getSongMetadata,
  toSong,
  logout,
  setLikedSong,
  type Dashboard,
  type Playlist,
} from "@/lib/api";
import { AddSongView } from "./AddSongView";
import { useAudioPlayer } from "./useAudioPlayer";
import { Sidebar, type DashboardView } from "./Sidebar";
import { HomeView } from "./HomeView";
import { Library } from "./Library";
import { MobileNav } from "./MobileNav";
import { PlaylistsView } from "./PlaylistsView";
import { Player } from "./Player";
import {
  ErrorState,
  LoadingState,
  UnauthenticatedState,
} from "./states";
import styles from "./DashboardApp.module.css";

type Status = "loading" | "ready" | "error" | "unauthenticated";

export function DashboardApp() {
  const [status, setStatus] = useState<Status>("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<DashboardView>("home");
  const [signingOut, setSigningOut] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [metadataLoading, setMetadataLoading] = useState<Set<string>>(new Set());

  const hydrateSong = useCallback(async (songId: string) => {
    if (dashboard?.songs.some((song) => song.id === songId && song.title !== song.id) || metadataLoading.has(songId)) return;
    setMetadataLoading((previous) => new Set(previous).add(songId));
    try {
      const metadata = await getSongMetadata(songId);
      if (metadata) setDashboard((previous) => previous ? { ...previous, songs: previous.songs.map((song) => song.id === songId ? toSong(song.filename, metadata) : song) } : previous);
    } finally {
      setMetadataLoading((previous) => { const next = new Set(previous); next.delete(songId); return next; });
    }
  }, [dashboard, metadataLoading]);

  const songs = dashboard?.songs ?? [];
  const likedSongs = songs.filter((song) => likedSongIds.has(song.id));
  const normalizedQuery = libraryQuery.trim().toLowerCase();
  const searchedSongs = normalizedQuery
    ? songs.filter((song) => [song.title, song.artist, song.album, song.id].some((value) => value?.toLowerCase().includes(normalizedQuery)))
    : songs;
  const selectedPlaylistId = view.startsWith("playlist:") ? view.slice(9) : null;
  const selectedPlaylist = selectedPlaylistId
    ? playlists.find((playlist) => playlist.id === selectedPlaylistId)
    : null;
  const selectedPlaylistSongs = selectedPlaylist
    ? songs.filter((song) => selectedPlaylist.songs.some((item) => item.id === song.id))
    : [];
  const queue = view === "liked" ? likedSongs : selectedPlaylist ? selectedPlaylistSongs : songs;
  const player = useAudioPlayer(queue);

  useEffect(() => {
    const controller = new AbortController();

    getDashboard(controller.signal)
      .then((data) => {
        setDashboard(data);
        setStatus("ready");
        if (data.username) {
          return Promise.all([getLikedSongs(data.username), getPlaylists()]).then(([liked, loadedPlaylists]) => {
            setLikedSongIds(liked);
            setPlaylists(loadedPlaylists);
          });
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (error instanceof ApiError && error.code === "unauthenticated") {
          setMessage(error.message);
          setStatus("unauthenticated");
          return;
        }
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Something went wrong while loading your library.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadToken]);

  const retry = useCallback(() => {
    setStatus("loading");
    setReloadToken((token) => token + 1);
  }, []);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    player.stop();
    try {
      await logout();
    } catch {
      // The bridge clears cookies regardless; proceed to the login page.
    }
    // A hard navigation clears any preserved client form state from the
    // dashboard route and guarantees a fresh login form after sign-out.
    window.location.replace("/login");
  }, [player]);

  const handleViewChange = useCallback((next: DashboardView) => {
    setView(next);
  }, []);

  const handleSongAdded = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  async function handleCreatePlaylist(name: string) {
    const playlist = await createPlaylist(name);
    setPlaylists((previous) => [...previous, playlist]);
    setView(`playlist:${playlist.id}`);
  }

  async function handleRenamePlaylist(playlistId: string, name: string) {
    const updated = await renamePlaylist(playlistId, name);
    setPlaylists((previous) => previous.map((playlist) => playlist.id === updated.id ? updated : playlist));
  }

  async function handleDeletePlaylist(playlistId: string) {
    await deletePlaylist(playlistId);
    setPlaylists((previous) => previous.filter((playlist) => playlist.id !== playlistId));
    if (view === `playlist:${playlistId}`) setView("library");
  }

  async function handleAddToPlaylist(playlistId: string, songId: string) {
    const updated = await addSongToPlaylist(playlistId, songId);
    setPlaylists((previous) => previous.map((playlist) => playlist.id === updated.id ? updated : playlist));
  }

  async function handleRemoveFromPlaylist(playlistId: string, songId: string) {
    const updated = await removeSongFromPlaylist(playlistId, songId);
    setPlaylists((previous) => previous.map((playlist) => playlist.id === updated.id ? updated : playlist));
  }

  async function handleImportPlaylist(playlistId: string, url: string) {
    const importId = await startPlaylistImport(playlistId, url);
    for (;;) {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      const job = await getPlaylistImport(importId);
      if (job.status === "failed") throw new Error(job.error || "Playlist import failed.");
      if (job.status === "completed") {
        setStatus("loading");
        setReloadToken((token) => token + 1);
        return;
      }
    }
  }

  async function toggleLike() {
    const song = player.current;
    const username = dashboard?.username;
    if (!song || !username) {
      return;
    }
    const liked = likedSongIds.has(song.id);
    setLikedSongIds((previous) => {
      const next = new Set(previous);
      if (liked) next.delete(song.id);
      else next.add(song.id);
      return next;
    });
    try {
      await setLikedSong(username, song.id, !liked);
    } catch {
      setLikedSongIds((previous) => {
        const next = new Set(previous);
        if (liked) next.add(song.id);
        else next.delete(song.id);
        return next;
      });
    }
  }

  if (status === "unauthenticated") {
    return <UnauthenticatedState message={message} />;
  }

  return (
    <div className={styles.app} data-dashboard-root>
      <Sidebar
        view={view}
        onViewChange={handleViewChange}
        username={dashboard?.username ?? null}
        onSignOut={handleSignOut}
        signingOut={signingOut}
        playlists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
      />

      <div className={styles.content}>
        <main className={styles.main}>
          {status === "ready" && view !== "add" ? (
            <div className={styles.searchRow}>
              <form className={styles.globalSearch} onSubmit={(event) => event.preventDefault()}>
                <Search size={18} className={styles.globalSearchIcon} />
                <input
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                  placeholder="Search your entire library"
                  aria-label="Search your entire library"
                  type="search"
                />
              </form>
            </div>
          ) : null}
          {status === "loading" ? (
            <LoadingState />
          ) : status === "error" ? (
            <ErrorState message={message} onRetry={retry} />
          ) : view === "home" ? (
            <HomeView
              songs={searchedSongs}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
              onBrowse={() => setView("library")}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onSongVisible={hydrateSong}
              likedSongs={likedSongs}
            />
          ) : view === "library" ? (
            <Library
              songs={songs}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
              onSongVisible={hydrateSong}
            />
          ) : view === "add" ? (
            <AddSongView onAdded={handleSongAdded} />
          ) : view === "playlists" ? (
            <PlaylistsView
              playlists={playlists}
              onOpen={(playlistId) => setView(`playlist:${playlistId}`)}
              onCreate={handleCreatePlaylist}
              onRename={handleRenamePlaylist}
              onDelete={handleDeletePlaylist}
            />
          ) : selectedPlaylist ? (
            <Library
              title={selectedPlaylist.name}
              songs={selectedPlaylistSongs}
              playlistId={selectedPlaylist.id}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
               onSelect={player.select}
               onSongVisible={hydrateSong}
               onPlayAll={() => selectedPlaylistSongs[0] && player.select(selectedPlaylistSongs[0])}
               onImport={(url) => handleImportPlaylist(selectedPlaylist.id, url)}
              onShuffleAll={() => {
                const song = selectedPlaylistSongs[Math.floor(Math.random() * selectedPlaylistSongs.length)];
                if (song) player.select(song);
              }}
            />
          ) : (
            <Library
              title="Liked Songs"
              songs={likedSongs}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onPlayAll={() => likedSongs[0] && player.select(likedSongs[0])}
              onShuffleAll={() => {
                const song = likedSongs[Math.floor(Math.random() * likedSongs.length)];
                if (song) player.select(song);
              }}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
              onSongVisible={hydrateSong}
            />
          )}
        </main>
      </div>

      <Player
        player={player}
        liked={player.current ? likedSongIds.has(player.current.id) : false}
        onToggleLike={toggleLike}
      />

      <MobileNav view={view} onViewChange={handleViewChange} />
    </div>
  );
}
