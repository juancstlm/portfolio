import siteData from "@/data/site-data.json";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {siteData.availableForWork && (
        <div className={styles.available}>
          <span className={styles.pulse} />
          {siteData.availableText}
        </div>
      )}
      <h1 className={styles.heading}>
        I&rsquo;m <span className={styles.highlight}>Juan</span> Castillo, a
        California-based maker building apps and racing cars on the weekend.
      </h1>
    </section>
  );
}
