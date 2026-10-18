import { ArrowRight } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import styles from "./Hero.module.css";

const chips = ["Self-hosted", "Ad-free", "No subscription", "Your files"];

export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.inner}>
          <span className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            Self-hosted music server
          </span>

          <h1 className={styles.title}>
            Your music. Your server.
            <br />
            <span className="gradientText">No ads, ever.</span>
          </h1>

          <p className={styles.lead}>
            Watermelon keeps your collection on hardware you control and streams it
            to any browser. No subscriptions, no tracking, nothing standing
            between you and your files.
          </p>

          <div className={styles.cta}>
            <ButtonLink href="/signup" size="lg">
              Create your account
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              Open your library
            </ButtonLink>
          </div>

          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip} className={styles.chip}>
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
