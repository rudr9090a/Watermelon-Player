import Link from "next/link";
import { Github } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "#player", label: "Player" },
      { href: "#features", label: "Features" },
      { href: "#self-hosted", label: "Self-hosting" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <Logo />
            <p className={styles.tagline}>
              A lightweight, ad-free music server you run on your own hardware.
              Your files, your rules.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} className={styles.column} aria-label={column.title}>
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link className={styles.link} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav className={styles.column} aria-label="Project">
            <h2 className={styles.columnTitle}>Project</h2>
            <ul className={styles.list}>
              <li>
                <a
                  className={styles.link}
                  href="https://github.com/rudr9090a"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.fine}>© Watermelon · self-hosted music</p>
          <p className={styles.fine}>Built in the open for people with a server and a library.</p>
        </div>
      </Container>
    </footer>
  );
}
