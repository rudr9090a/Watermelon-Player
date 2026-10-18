import type { ComponentType } from "react";
import { Library, Play, ShieldCheck, type IconProps } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import styles from "./Features.module.css";

type Feature = {
  icon: ComponentType<IconProps>;
  title: string;
  text: string;
  badge: string;
  tone: "core" | "progress" | "planned";
};

const features: Feature[] = [
  {
    icon: Library,
    title: "Your whole library, organised",
    text: "Albums, artists and playlists pulled straight from the files on your server, so everything lives in one place instead of across three apps.",
    badge: "Core",
    tone: "core",
  },
  {
    icon: Play,
    title: "Playback that just works",
    text: "A focused browser player built for desktop and mobile: queue up a record, hit play, and get on with your day.",
    badge: "In progress",
    tone: "progress",
  },
  {
    icon: ShieldCheck,
    title: "Self-hosted by design",
    text: "Watermelon runs on your own hardware with a deliberately small footprint. Your library stays yours — no ads, no tracking, no subscription.",
    badge: "Core",
    tone: "core",
  },
];

export function Features() {
  return (
    <section id="features" className={styles.section}>
      <Container>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Why Watermelon</p>
          <h2 className={styles.title}>Built for people with a server and a library</h2>
        </header>

        <ul className={styles.grid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.title} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.icon}>
                    <Icon size={22} />
                  </span>
                  <span className={`${styles.badge} ${styles[feature.tone]}`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.text}</p>
              </li>
            );
          })}
        </ul>

        <p className={styles.note}>
          Watermelon is under active development. Badges show what already works in
          the backend today and what is still being built.
        </p>
      </Container>
    </section>
  );
}
