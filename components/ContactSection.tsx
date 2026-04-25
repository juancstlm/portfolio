import siteData from "@/data/site-data.json";
import SectionHeader from "./SectionHeader";
import Icon from "./Icon";
import type { IconName } from "./Icon";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <SectionHeader label="Contact" title="Say hi" />
      <div className={styles.links}>
        {siteData.links.map((l) => (
          <a key={l.label} href={l.href} className={styles.link}>
            <Icon name={l.icon as IconName} size={14} />
            {l.handle}
            <Icon name="external" size={12} />
          </a>
        ))}
      </div>
    </section>
  );
}
