"use client";

import { useTheme } from "./ThemeProvider";
import Icon from "./Icon";
import styles from "./Nav.module.css";

export default function Nav() {
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.dot} />
        juancastillom.com
      </div>
      <nav className={styles.links}>
        <a href="#work">Work</a>
        <a href="#featured">Projects</a>
        <a href="/apps">Apps</a>
        <a href="#contact">Contact</a>
        <button
          className={styles.themeToggle}
          onClick={toggle}
          aria-label="Toggle theme"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={14} />
        </button>
      </nav>
    </div>
  );
}
