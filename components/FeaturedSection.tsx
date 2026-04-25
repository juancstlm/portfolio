import siteData from "@/data/site-data.json";
import SectionHeader from "./SectionHeader";
import ScreenshotStack from "./ScreenshotStack";
import Icon from "./Icon";
import styles from "./FeaturedSection.module.css";

export default function FeaturedSection() {
  const app = siteData.apps.find((a) => a.featured);
  if (!app) return null;

  const details = app.featuredDetails;

  return (
    <section id="featured" className={styles.section}>
      <SectionHeader
        label="Featured"
        title={app.name}
        subtitle={`${app.tag} · iOS · ${app.year}`}
      />
      <div className={styles.grid}>
        <div>
          <p className={styles.description}>{app.description}</p>
          {details && (
            <ul className={styles.meta}>
              {(
                [
                  ["Role", details.role],
                  ["Stack", details.stack],
                  ["Status", details.status],
                ] as const
              ).map(([k, v]) => (
                <li key={k} className={styles.metaRow}>
                  <span className={styles.metaKey}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          )}
          {app.link && (
            <a href={app.link} className={styles.cta}>
              View on {app.linkLabel} <Icon name="arrow" size={14} />
            </a>
          )}
        </div>
        {app.images.length > 0 ? (
          <ScreenshotStack images={app.images} />
        ) : (
          <div className={styles.iconShowcase} style={{ "--tint": app.tint } as React.CSSProperties}>
            {app.icon && (
              <img src={app.icon} alt={app.name} className={styles.largeIcon} />
            )}
            <span className={styles.iconLabel}>{app.status}</span>
          </div>
        )}
      </div>
    </section>
  );
}
