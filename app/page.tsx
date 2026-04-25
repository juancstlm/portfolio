import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import AppsGrid from "@/components/AppsGrid";
import WorkSection from "@/components/WorkSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Nav />
      <Hero />
      <FeaturedSection />
      <AppsGrid />
      <WorkSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
