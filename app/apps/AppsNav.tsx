"use client";

import { useTheme } from "@/components/ThemeProvider";
import Icon from "@/components/Icon";
import styles from "./AppsNav.module.css";

export default function AppsNav() {
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.nav}>
      <a href="/" className={styles.back}>
        ← juancastillom.com
      </a>
      <div className={styles.right}>
        <span className={styles.route}>/apps</span>
        <button
          className={styles.themeToggle}
          onClick={toggle}
          aria-label="Toggle theme"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={14} />
        </button>
      </div>
    </div>
  );
}
