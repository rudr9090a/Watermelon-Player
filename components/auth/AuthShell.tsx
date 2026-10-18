import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const points = [
  "Your library stays on your own hardware.",
  "No ads, no tracking, no subscription.",
  "Works from any modern browser.",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.aside}>
        <span className={styles.asideGlow} aria-hidden="true" />

        <div className={styles.asideInner}>
          <Link href="/" className={styles.brand} aria-label="Watermelon — home">
            <span className={styles.brandMark} aria-hidden="true">
              <img className={styles.brandLogo} src="/images/logo.png" alt="" />
            </span>
              <span className={styles.brandWord}>watermelon<span className={styles.brandDot}>.</span></span>
          </Link>

          <div className={styles.asideCopy}>
            <h2 className={styles.asideTitle}>
              Your music.
              <br />
              Your server.
            </h2>
            <p className={styles.asideText}>
              A quiet, ad-free home for the library you already own.
            </p>
          </div>

          <ul className={styles.asideList}>
            {points.map((point) => (
              <li key={point} className={styles.asideItem}>
                <span className={styles.asideTick} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.covers} aria-hidden="true">
          <span className={`${styles.coverTile} ${styles.coverA}`} />
          <span className={`${styles.coverTile} ${styles.coverB}`} />
          <span className={`${styles.coverTile} ${styles.coverC}`} />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className={styles.card}>
            <header className={styles.cardHead}>
              <h1 className={styles.title}>{title}</h1>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </header>
            {children}
          </div>

          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
