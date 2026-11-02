"use client";

import { Heart, Home, Library, Music, Plus } from "@/components/icons";
import type { DashboardView } from "./Sidebar";
import styles from "./MobileNav.module.css";

type MobileNavProps = {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
};

const items: { id: DashboardView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "library", label: "Library", icon: Library },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "playlists", label: "Playlists", icon: Music },
];

export function MobileNav({ view, onViewChange }: MobileNavProps) {
  const addActive = view === "add";

  return (
    <nav className={styles.nav} aria-label="Primary">
      {items.slice(0, 2).map((item) => renderItem(item, view, onViewChange))}

      <button
        type="button"
        className={[styles.item, styles.add, addActive && styles.addActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onViewChange("add")}
        aria-label="Add a song"
        aria-current={addActive ? "page" : undefined}
      >
        <span className={styles.addIcon} aria-hidden="true">
          <Plus size={20} />
        </span>
        <span>Add</span>
      </button>

      {items.slice(2).map((item) => renderItem(item, view, onViewChange))}
    </nav>
  );
}

function renderItem(
  item: { id: DashboardView; label: string; icon: typeof Home },
  view: DashboardView,
  onViewChange: (view: DashboardView) => void,
) {
  const Icon = item.icon;
  const active =
    view === item.id ||
    (item.id === "playlists" && view.startsWith("playlist:"));

  return (
    <button
      key={item.id}
      type="button"
      className={[styles.item, active && styles.active].filter(Boolean).join(" ")}
      onClick={() => onViewChange(item.id)}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={20} />
      <span>{item.label}</span>
    </button>
  );
}
