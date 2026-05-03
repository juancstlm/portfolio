"use client";

import Link from "next/link";
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
        <a href="#featured">Projects</a>
        <Link href="/apps">Apps</Link>
        <a href="#work">Work</a>
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
