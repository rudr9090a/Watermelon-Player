import { AlertCircle, Library, ShieldCheck } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";
import styles from "./states.module.css";

export function LoadingState() {
  return (
    <div className={styles.loading} aria-busy="true" aria-live="polite">
      <span className="srOnly">Loading your library…</span>
      <div className={styles.skelHeading} />
      <div className={styles.skelGrid}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={styles.skelCard} />
        ))}
      </div>
      <div className={styles.skelRows}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.skelRow} />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.state} role="alert">
      <span className={styles.stateIcon}>
        <AlertCircle size={26} />
      </span>
      <h2 className={styles.stateTitle}>We couldn&apos;t load your library</h2>
      <p className={styles.stateText}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function UnauthenticatedState({ message }: { message?: string }) {
  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <Logo />
        <span className={styles.stateIcon}>
          <ShieldCheck size={26} />
        </span>
        <h1 className={styles.stateTitle}>Your session has ended</h1>
        <p className={styles.stateText}>
          {message ?? "Sign in to open your library."}
        </p>
        <div className={styles.authActions}>
          <ButtonLink href="/login" size="lg" fullWidth>
            Log in
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" fullWidth>
            Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function EmptyLibrary() {
  return (
    <div className={styles.state}>
      <span className={styles.stateIcon}>
        <Library size={26} />
      </span>
      <h2 className={styles.stateTitle}>Your library is empty</h2>
      <p className={styles.stateText}>
        Add MP3 files to the music folder on your Watermelon server and refresh the
        page — they will appear here automatically.
      </p>
    </div>
  );
}
