"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "@/components/icons";
import { Logo } from "@/components/site/Logo";
import {
  ApiError,
  getDashboard,
  logout,
  type Dashboard,
} from "@/lib/api";
import { useAudioPlayer } from "./useAudioPlayer";
import { Sidebar, type DashboardView } from "./Sidebar";
import { HomeView } from "./HomeView";
import { Library } from "./Library";
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
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const songs = dashboard?.songs ?? [];
  const player = useAudioPlayer(songs);

  useEffect(() => {
    const controller = new AbortController();

    getDashboard(controller.signal)
      .then((data) => {
        setDashboard(data);
        setStatus("ready");
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
          ) : (
            <Library
              songs={songs}
              currentId={player.current?.id ?? null}
              isPlaying={player.isPlaying}
              onSelect={player.select}
            />
          )}
        </main>
      </div>

      <Player player={player} />
    </div>
  );
}
