"use client";

import Link from "next/link";
import siteData from "@/data/site-data.json";
import SectionHeader from "./SectionHeader";
import Icon from "./Icon";
import { track } from "@/lib/track";
import styles from "./AppsGrid.module.css";

export default function AppsGrid() {
  return (
    <section id="apps" className={styles.section}>
      <SectionHeader
        label="Apps"
        title="Things I've shipped"
        subtitle="A short list of personal projects"
      />
      <div className={styles.grid}>
        {siteData.apps.map((app) => (
          <Link
            key={app.id}
            href={`/apps#${app.id}`}
            className={styles.card}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardIdent}>
                {app.icon ? (
                  <img
                    src={app.icon}
                    alt=""
                    className={styles.icon}
                  />
                ) : (
                  <div
                    className={styles.iconPlaceholder}
                    style={{ background: app.tint }}
                  >
                    {app.name[0]}
                  </div>
                )}
                <div>
                  <div className={styles.appName}>{app.name}</div>
                  <div className={styles.appTag}>{app.tag}</div>
                </div>
              </div>
              <span
                className={styles.yearBadge}
                style={{
                  color: app.statusKind === "live" ? "var(--accent)" : "var(--mute)",
                  borderColor:
                    app.statusKind === "live" ? "var(--accent)" : "var(--line)",
                }}
              >
                {app.year}
              </span>
            </div>
            <p className={styles.blurb}>{app.blurb}</p>
            <div className={styles.cardBottom}>
              {app.link ? (
                <button
                  className={styles.liveLink}
                  onClick={(e) => {
                    e.preventDefault();
                    track("app_link_click", {
                      app: app.id,
                      source: "home_grid",
                    });
                    window.open(app.link, "_blank", "noopener,noreferrer");
                  }}
                >
                  {app.status} <Icon name="external" size={10} />
                </button>
              ) : (
                <span>{app.status}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
