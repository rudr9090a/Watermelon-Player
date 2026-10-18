import { Container } from "@/components/ui/Container";
import styles from "./SelfHosted.module.css";

const points = [
  "Small resource footprint — designed to run quietly in the background.",
  "No accounts on someone else's cloud, and no tracking.",
  "Your storage, your backups, your bandwidth.",
];

export function SelfHosted() {
  return (
    <section id="self-hosted" className={styles.section}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Self-hosting</p>
            <h2 className={styles.title}>Runs where you tell it to</h2>
            <p className={styles.lead}>
              Watermelon is a small FastAPI service you install on your machine or
              home server. Point it at your music and it serves your library over
              your own network — nothing leaves home unless you want it to.
            </p>
            <ul className={styles.list}>
              {points.map((point) => (
                <li key={point} className={styles.item}>
                  <span className={styles.tick} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.terminal} aria-hidden="true">
            <div className={styles.termBar}>
              <span />
              <span />
              <span />
            </div>
            <pre className={styles.termBody}>
              <code>
                <span className={styles.cmd}>$ pip install -r requirements.txt</span>
                {"\n"}
                <span className={styles.cmd}>$ python main.py</span>
                {"\n\n"}
                <span className={styles.out}>
                  Uvicorn running on http://127.0.0.1:8000
                </span>
                {"\n"}
                <span className={styles.dim}>Visit /files/login.html to sign in</span>
              </code>
            </pre>
          </div>
        </div>
      </Container>
    </section>
  );
}
