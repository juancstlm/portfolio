"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { track } from "@/lib/track";

/** Top edge: name (home) on the left; the Apps link and the theme toggle on the right. No bar, no background. */
export default function Top({ current }: { current?: "apps" }) {
  return (
    <header className="top">
      <Link className="name" href="/">
        Juan Castillo
      </Link>
      <div className="top-r">
        <Link
          className="top-link"
          href="/apps/"
          aria-current={current === "apps" ? "page" : undefined}
          onClick={() => track("nav_apps_click")}
        >
          Apps
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
