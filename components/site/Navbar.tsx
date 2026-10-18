import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Logo />
        </div>
      </Container>
    </header>
  );
}
