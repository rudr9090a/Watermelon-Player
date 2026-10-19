"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { downloadAlbum } from "@/lib/api";
import styles from "./DownloadAlbum.module.css";

export function DownloadAlbum({ onComplete }: { onComplete: () => void }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await downloadAlbum(url.trim());
      setUrl("");
      setMessage("Download started. It will appear in your library when ready.");
      window.setTimeout(onComplete, 5000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="album-url">Download from YouTube</label>
      <div className={styles.fields}>
        <input
          id="album-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a YouTube video or playlist URL"
          disabled={busy}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? "Downloading..." : "Download"}
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
