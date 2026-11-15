import type { Metadata } from "next";
import AppsNav from "@/app/apps/AppsNav";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "OneRM Privacy Policy",
  description: "What data the OneRM app handles and where it goes.",
};

const EMAIL = "privacy@longdog.racing";

export default function OneRMPrivacyPage() {
  return (
    <main className={styles.main}>
      <AppsNav route="/OneRM/privacy" />

      <header className={styles.header}>
        <div className={styles.label}>OneRM · Privacy</div>
        <h1 className={styles.heading}>Privacy policy</h1>
        <p className={styles.date}>Effective November 15, 2026</p>
      </header>

      <article className={styles.body}>
        <p>
          OneRM is a workout logger for iPhone and Android, made by Juan
          Castillo. This page covers what data the app handles.
        </p>

        <h2>Your workouts</h2>
        <p>
          Workouts, sets, exercises and settings are stored on your device.
          There&rsquo;s no account, and I can&rsquo;t see any of it. Backups
          are files you export and keep yourself.
        </p>

        <h2>Apple Health (iPhone)</h2>
        <p>
          If you turn on Apple Health, OneRM saves finished workouts to Health
          and reads workouts from it. This happens on your phone, and Health
          data never reaches me.
        </p>

        <h2>Usage stats</h2>
        <p>
          Usage stats are off unless you turn them on in Settings under Share
          Anonymous Usage Data. If you do, the app sends which screens you
          open, which features you use, how long a workout took, and your
          screen size, grouped under a random ID. They don&rsquo;t include
          your name, email, exercises or weights, and I can&rsquo;t link them
          to you. Turning them off deletes that ID and anything not yet sent.
        </p>

        <h2>Lock screen rest timer (iPhone)</h2>
        <p>
          When a rest timer runs on the lock screen, the app sends my server
          what it needs to update it when the timer ends: a push token for
          your device, the start and end time, and what the timer shows
          (workout and exercise name, weight and reps). The server deletes it
          shortly after the timer ends.
        </p>

        <h2>Feedback</h2>
        <p>
          If you use Send Feedback, I get your message. Your email and device
          details (app version, OS version, phone model) are sent only if you
          add them. I use them to reply and to fix bugs. Feedback is kept
          until you ask me to delete it.
        </p>

        <h2>What I don&rsquo;t do</h2>
        <p>
          OneRM has no ads. I don&rsquo;t track you across other apps or
          websites, and I don&rsquo;t sell or share your data.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, I&rsquo;ll update this page and the date at
          the top.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or deletion requests:{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
      </article>

      <Footer />
    </main>
  );
}
