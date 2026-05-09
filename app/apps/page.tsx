import siteData from "@/data/site-data.json";
import AppsNav from "./AppsNav";
import AppLink from "./AppLink";
import ScreenshotStack from "@/components/ScreenshotStack";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function AppsPage() {
  const apps = [...siteData.apps].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <main className={styles.main}>
      <AppsNav />

      <header className={styles.header}>
        <div className={styles.label}>Index · {apps.length} apps</div>
        <h1 className={styles.heading}>Personal apps and tools.</h1>
        <p className={styles.subtitle}>
          Things I&rsquo;ve built for myself that turned out to be useful for
          other people too. Each has its own story below.
        </p>
      </header>

      <div className={styles.appList}>
        {apps.map((app) => (
          <article key={app.id} id={app.id} className={styles.card}>
            <div className={styles.cardInfo}>
              <div className={styles.cardIdent}>
                {app.icon ? (
                  <img src={app.icon} alt="" className={styles.icon} />
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

              <p className={styles.description}>{app.description}</p>

              <div className={styles.techTags}>
                {app.tech.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>

              <div className={styles.cardActions}>
                {app.link ? (
                  <AppLink
                    appId={app.id}
                    href={app.link}
                    label={app.linkLabel}
                    className={styles.cta}
                  />
                ) : (
                  <span className={styles.comingSoon}>{app.linkLabel}</span>
                )}
                <span
                  className={styles.status}
                  style={{
                    color:
                      app.statusKind === "live"
                        ? "var(--accent)"
                        : "var(--mute)",
                  }}
                >
                  ● {app.status}
                </span>
              </div>
            </div>

            <div className={styles.visual}>
              {app.displayMode === "stack" && app.images.length >= 3 ? (
                <ScreenshotStack images={app.images} />
              ) : app.displayMode === "image" && (app.image || app.images.length > 0) ? (
                <img src={app.image || app.images[0]} alt="" />
              ) : (
                <div className={styles.placeholder}>
                  Coming soon
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </main>
  );
}
