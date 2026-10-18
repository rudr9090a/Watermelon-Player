import { ArrowRight } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import styles from "./CallToAction.module.css";

export function CallToAction() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.panel}>
          <span className={styles.glow} aria-hidden="true" />
          <h2 className={styles.title}>Bring your music home</h2>
          <p className={styles.lead}>
            Create an account on your Watermelon server and start listening from any
            browser. Set-up takes a minute.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/signup" size="lg">
              Create your account
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              Log in
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
