"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Plus, Search } from "@/components/icons";
import {
  getAddSongJob,
  primeSongMetadata,
  searchSongs,
  startAddSong,
  type AddSongJob,
  type SongSearchResult,
} from "@/lib/api";
import styles from "./AddSongView.module.css";

type AddSongViewProps = {
  onAdded: () => void;
};

const URL_RE =
  /^https?:\/\/(?:(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?|shorts\/|embed\/)|youtu\.be\/)/i;

function isUrl(value: string): boolean {
  return URL_RE.test(value.trim());
}

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "";
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function AddSongView({ onAdded }: AddSongViewProps) {
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<AddSongJob | null>(null);
  const searchRequest = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const adding =
    jobId !== null && job?.status !== "completed" && job?.status !== "failed";

  const runSearch = useCallback(async (value: string) => {
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;

    setSearching(true);
    setError("");

    try {
      const found = await searchSongs(value, 8, controller.signal);
      if (controller.signal.aborted) return;
      setResults(found);
      setResultsQuery(value);
      if (found.length === 0) setError("No matching songs were found.");
    } catch (caught) {
      if (controller.signal.aborted) return;
      setResults([]);
      setResultsQuery(value);
      setError(caught instanceof Error ? caught.message : "Search failed.");
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => () => searchRequest.current?.abort(), []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const value = input.trim();

    if (value.length < 2 || isUrl(value) || resultsQuery === value) return;

    const timer = window.setTimeout(() => {
      void runSearch(value);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [input, resultsQuery, runSearch]);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const next = await getAddSongJob(jobId);
        if (cancelled) return;
        setJob(next);

        if (next.status === "completed") {
          const song = next.song;
          if (song) {
            primeSongMetadata(song.video_id, {
              video_id: song.video_id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              duration: song.duration,
              thumbnail: song.thumbnail,
            });
            setMessage(`Added "${song.title || "song"}" to your library.`);
          } else {
            setMessage("Song added to your library.");
          }
          searchRequest.current?.abort();
          setSearching(false);
          setInput("");
          setResults([]);
          setResultsQuery("");
          onAdded();
          return;
        }

        if (next.status === "failed") {
          setError(next.error || "The song could not be downloaded.");
          return;
        }

        timer = window.setTimeout(poll, 1500);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Lost track of the download.");
        }
      }
    };

    timer = window.setTimeout(poll, 800);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [jobId, onAdded]);

  async function beginAdd(target: { url?: string; videoId?: string }) {
    if (adding) return;
    setError("");
    setMessage("");
    setJob(null);
    try {
      const { jobId: id } = await startAddSong(target);
      setJobId(id);
      setJob({ job_id: id, status: "queued" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't add that song.");
    }
  }

  async function submit() {
    const value = input.trim();
    if (!value) return;

    if (isUrl(value)) {
      await beginAdd({ url: value });
      return;
    }

    if (results.length > 0 && resultsQuery === value) return;

    await runSearch(value);
  }

  function handleInput(value: string) {
    setInput(value);
    setResults([]);
    setResultsQuery("");
    setError("");
    setMessage("");

    if (value.trim().length < 2 || isUrl(value)) {
      searchRequest.current?.abort();
      setSearching(false);
    }
  }

  const value = input.trim();
  const hasFreshResults = results.length > 0 && resultsQuery === value;

  const statusLabel =
    job?.status === "queued"
      ? "Queued…"
      : job?.status === "running"
        ? "Downloading from YouTube Music…"
        : "";

  return (
    <section className={styles.page} aria-labelledby="add-song-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>YouTube Music</p>
        <h1 id="add-song-title" className={styles.title}>
          Add a song
        </h1>
        <p className={styles.sub}>
          Search for a track or paste a link. It downloads straight into your
          library.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className={styles.field}>
          <Search size={18} className={styles.formIcon} />
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            placeholder="Song name, artist, or YouTube link"
            aria-label="Search for a song"
            disabled={adding}
          />
        </div>
        <button type="submit" disabled={adding || !value}>
          {adding ? "Adding…" : isUrl(value) ? "Add" : "Search"}
        </button>
      </form>

      {statusLabel ? (
        <div className={styles.status} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          {statusLabel}
        </div>
      ) : null}

      {message ? (
        <p className={styles.success} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {searching ? (
        <div className={styles.status} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          Searching…
        </div>
      ) : null}

      {!value && !searching && !message && !error && !statusLabel ? (
        <p className={styles.hint}>
          Start typing to search, or paste a YouTube link.
        </p>
      ) : null}

      {hasFreshResults ? (
        <ul className={styles.results}>
          {results.map((result) => (
            <li key={result.video_id}>
              <button
                type="button"
                className={styles.result}
                onClick={() => void beginAdd({ videoId: result.video_id })}
                disabled={adding}
              >
                <span className={styles.art} aria-hidden="true">
                  {result.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.thumbnail} alt="" loading="lazy" />
                  ) : (
                    <Music size={18} />
                  )}
                </span>
                <span className={styles.meta}>
                  <span className={styles.name}>{result.title}</span>
                  <span className={styles.byline}>
                    {[result.artist, formatDuration(result.duration)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className={styles.addIcon} aria-hidden="true">
                  <Plus size={18} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
