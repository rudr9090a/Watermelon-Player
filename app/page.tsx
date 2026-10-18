import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import styles from "./landing.module.css";

export default function Home() {
  return (
    <main className={styles.site}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <header className={styles.header}>
          <Logo accent />
          <Link href="/login" className={styles.menu}>
            <span>MENU</span>
            <span className={styles.menuIcon} aria-hidden="true">
              <i />
              <i />
            </span>
          </Link>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1>Your library.<br /><em>Under your control.</em></h1>
            <p className={styles.intro}>
              A precise, self-hosted music system for people who want their
              collection available everywhere without handing it over.
            </p>
            <div className={styles.actions}>
              <Link href="/signup" className={styles.primaryAction}>START YOUR SERVER <span>↗</span></Link>
              <Link href="#statement" className={styles.secondaryAction}>KEEP GOING <span>↓</span></Link>
            </div>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <span>01 — 03</span>
          <span>LOCAL FIRST / ALWAYS</span>
        </div>
      </section>

      <section id="statement" className={styles.statement}>
        <h2>Music should feel<br /><em>like it belongs to you.</em></h2>
        <Link href="/signup" className={styles.primaryAction}>DEPLOY WATERMELON <span>↗</span></Link>
      </section>

      <footer className={styles.footer}>
        <Logo />
        <span>PRIVATE MUSIC / OPEN HORIZONS</span>
        <span>© 2026 WATERMELON</span>
      </footer>
    </main>
  );
}
