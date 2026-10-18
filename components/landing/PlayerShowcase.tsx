import { Container } from "@/components/ui/Container";
import { AppPreview } from "./AppPreview";
import styles from "./PlayerShowcase.module.css";

export function PlayerShowcase() {
  return (
    <section id="player" className={styles.section}>
      <Container>
        <header className={styles.header}>
          <p className={styles.eyebrow}>The player</p>
          <h2 className={styles.title}>A player that stays out of the way</h2>
          <p className={styles.lead}>
            Your albums, artists and playlists in one calm place, with the
            controls exactly where you expect them. Shown here with sample
            library data.
          </p>
        </header>

        <AppPreview />
      </Container>
    </section>
  );
}