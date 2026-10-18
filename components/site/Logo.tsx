import Link from "next/link";
import styles from "./Logo.module.css";

export function Logo({ href = "/", accent = false }: { href?: string; accent?: boolean }) {
  return (
    <Link href={href} className={styles.logo} aria-label="Watermelon — home">
      <span className={styles.mark} aria-hidden="true">
        <img src="/images/logo.png" alt="" />
      </span>
      <span className={[styles.word, accent ? styles.accent : ""].filter(Boolean).join(" ")}>
      watermelon
        <span className={styles.dot}>.</span>
      </span>
    </Link>
  );
}
