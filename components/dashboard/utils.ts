export function formatTime(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const TONES = ["a", "b", "c", "d", "e", "f"] as const;

/**
 * Deterministic colour tone for a song id. Deterministic so server and client
 * renders agree (no hydration mismatch) and each track keeps a stable look.
 */
export function toneFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return TONES[hash % TONES.length];
}