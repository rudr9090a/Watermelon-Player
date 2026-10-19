"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "@/components/icons";
import { Logo } from "@/components/site/Logo";
import {
  ApiError,
  getLikedSongs,
  getDashboard,
  logout,
  setLikedSong,
  type Dashboard,
} from "@/lib/api";
import { useAudioPlayer } from "./useAudioPlayer";
import { Sidebar, type DashboardView } from "./Sidebar";
import { HomeView } from "./HomeView";
import { Library } from "./Library";
import { Player } from "./Player";
import { DownloadAlbum } from "./DownloadAlbum";
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
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());

  const songs = dashboard?.songs ?? [];
  const likedSongs = songs.filter((song) => likedSongIds.has(song.id));
  const player = useAudioPlayer(songs);

  useEffect(() => {
    const controller = new AbortController();

    getDashboard(controller.signal)
      .then((data) => {
        setDashboard(data);
        setStatus("ready");
        if (data.username) {
          return getLikedSongs(data.username).then(setLikedSongIds);
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

  useEffect(() => {
    if (!navOpen) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navOpen]);

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
    setNavOpen(false);
  }, []);

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
    <div className={styles.app}>
      <header className={styles.mobileHeader}>
        <Logo href="/dashboard" />
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation"
          aria-controls="dashboard-nav"
          aria-expanded={navOpen}
        >
          <Menu size={22} />
        </button>
      </header>

      {navOpen ? (
        <div
          className={styles.backdrop}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        view={view}
        onViewChange={handleViewChange}
        username={dashboard?.username ?? null}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      <div className={styles.content}>
        <main className={styles.main}>
          {status === "ready" ? <DownloadAlbum onComplete={retry} /> : null}
          {status === "loading" ? (
            <LoadingState />
          ) : status === "error" ? (
            <ErrorState message={message} onRetry={retry} />
          ) : view === "home" ? (
            <HomeView
              songs={songs}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
              onBrowse={() => setView("library")}
            />
          ) : view === "library" ? (
            <Library
              songs={songs}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
            />
          ) : (
            <Library
              title="Liked Songs"
              songs={likedSongs}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
            />
          )}
        </main>
      </div>

      <Player
        player={player}
        liked={player.current ? likedSongIds.has(player.current.id) : false}
        onToggleLike={toggleLike}
      />
    </div>
  );
}
