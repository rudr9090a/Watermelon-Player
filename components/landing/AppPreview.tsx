import {
  Heart,
  Home,
  Library,
  Play,
  Plus,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from "@/components/icons";
import styles from "./AppPreview.module.css";

const albums = [
  { title: "Midnight Frequencies", meta: "24 tracks", tone: "a" },
  { title: "Neon Rain", meta: "12 tracks", tone: "b" },
  { title: "Slow Static", meta: "18 tracks", tone: "c" },
  { title: "Paper Boats", meta: "9 tracks", tone: "d" },
  { title: "Low Orbit", meta: "15 tracks", tone: "e" },
  { title: "Golden Hour", meta: "20 tracks", tone: "f" },
] as const;

const playlists = ["Focus", "Late night", "Driving", "Sunday"];

/**
 * A purely decorative, backend-free mock of the Watermelon web player.
 * It is exposed to assistive tech as a single image so the simulated UI
 * controls are not announced as interactive elements.
 */
export function AppPreview() {
  return (
    <div
      className={styles.frame}
      role="img"
      aria-label="Preview of the Watermelon web player: a sidebar with navigation, an album grid titled Your library, and a now-playing bar."
    >
      <div className={styles.windowBar}>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className={styles.badge}>Interface preview</span>
      </div>

      <div className={styles.app}>
        <aside className={styles.sidebar}>
          <div className={styles.sideBrand}>
            <img className={styles.brandLogo} src="/images/logo.png" alt="" />
            <span>watermelon</span>
          </div>

          <nav className={styles.sideNav}>
            <span className={styles.sideItemActive}>
              <Home size={16} />
              Home
            </span>
            <span className={styles.sideItem}>
              <Search size={16} />
              Search
            </span>
            <span className={styles.sideItem}>
              <Library size={16} />
              Library
            </span>
            <span className={styles.sideItem}>
              <Heart size={16} />
              Liked songs
            </span>
          </nav>

          <div className={styles.playlists}>
            <p className={styles.sideLabel}>Playlists</p>
            <ul>
              {playlists.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className={styles.content}>
          <div className={styles.contentHead}>
            <div>
              <p className={styles.greeting}>Good evening</p>
              <h3 className={styles.contentTitle}>Your library</h3>
            </div>
            <span className={styles.addButton}>
              <Plus size={15} />
              Add music
            </span>
          </div>

          <div className={styles.grid}>
            {albums.map((album) => (
              <div key={album.title} className={styles.card}>
                <div className={`${styles.cover} ${styles[`cover${album.tone.toUpperCase()}`]}`}>
                  <span className={styles.coverPlay}>
                    <Play size={15} />
                  </span>
                </div>
                <p className={styles.cardTitle}>{album.title}</p>
                <p className={styles.cardMeta}>{album.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.player}>
        <div className={styles.nowPlaying}>
          <span className={`${styles.nowCover} ${styles.coverD}`} />
          <div className={styles.nowMeta}>
            <p className={styles.nowTitle}>Midnight Frequencies</p>
            <p className={styles.nowArtist}>Your library</p>
          </div>
          <Heart size={16} className={styles.nowHeart} />
        </div>

        <div className={styles.controls}>
          <div className={styles.buttons}>
            <Shuffle size={15} />
            <SkipBack size={18} />
            <span className={styles.playButton}>
              <Play size={16} />
            </span>
            <SkipForward size={18} />
            <Repeat size={15} />
          </div>
          <div className={styles.progress}>
            <span className={styles.time}>1:24</span>
            <span className={styles.track}>
              <i />
            </span>
            <span className={styles.time}>4:02</span>
          </div>
        </div>

        <div className={styles.volume}>
          <Volume size={16} />
          <span className={styles.volumeTrack}>
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}
