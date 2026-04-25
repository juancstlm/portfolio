import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <span className={styles.code}>404</span>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.subtitle}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been
          moved.
        </p>
        <Link href="/" className={styles.link}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
