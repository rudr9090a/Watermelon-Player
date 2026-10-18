"use client";

import { Close, Home, Library, LogOut } from "@/components/icons";
import { Logo } from "@/components/site/Logo";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./Sidebar.module.css";

export type DashboardView = "home" | "library";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  username: string | null;
  onSignOut: () => void;
  signingOut: boolean;
};

export function Sidebar({
  open,
  onClose,
  view,
  onViewChange,
  username,
  onSignOut,
  signingOut,
}: SidebarProps) {
  const initial = username ? username.charAt(0).toUpperCase() : "S";

  const items: { id: DashboardView; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Library },
  ];

  return (
    <aside
      id="dashboard-nav"
      className={[styles.sidebar, open && styles.open].filter(Boolean).join(" ")}
      aria-label="Dashboard navigation"
    >
      <div className={styles.top}>
        <Logo href="/dashboard" />
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close navigation"
        >
          <Close size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={[styles.navItem, active && styles.active]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onViewChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.account}>
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
        <div className={styles.accountMeta}>
          <p className={styles.accountName}>{username ?? "Signed in"}</p>
          <p className={styles.accountSub}>Self-hosted library</p>
        </div>
        <button
          type="button"
          className={styles.signOut}
          onClick={onSignOut}
          disabled={signingOut}
          aria-label="Sign out"
          title="Sign out"
        >
          {signingOut ? <Spinner /> : <LogOut size={18} />}
        </button>
      </div>
    </aside>
  );
}