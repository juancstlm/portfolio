import siteData from "@/data/site-data.json";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>&copy; {new Date().getFullYear()} {siteData.footer.copyright.replace(/^\d{4}\s*/, "")}</span>
      <span>{siteData.footer.tagline}</span>
    </footer>
  );
}
