import siteData from "@/data/site-data.json";

export default function Footer() {
  return (
    <footer className="foot">
      <span>{siteData.footer.copyright}</span>
      <span>{siteData.footer.tagline}</span>
    </footer>
  );
}
