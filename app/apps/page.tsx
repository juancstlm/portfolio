import type { Metadata } from "next";
import siteData from "@/data/site-data.json";
import Top from "@/components/Top";
import Footer from "@/components/Footer";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Apps · Juan Castillo",
  description: "Everything I've shipped, newest first.",
};

// One section per app, newest first, each with id="<app id>" so old /apps#<id> links still land.
export default function AppsPage() {
  const firstShot = siteData.apps.findIndex((a) => a.screen);
  return (
    <>
      <Top current="apps" />
      <main className="apps">
        <h1 className="apps-h">Everything I&apos;ve shipped, newest first.</h1>
        {siteData.apps.map((app, i) => (
          <section key={app.id} id={app.id} className={`ap ap-${app.kind}`} aria-labelledby={`${app.id}-name`}>
            <p className="ap-year">{app.year}</p>
            <div className="ap-copy">
              <h2 id={`${app.id}-name`}>
                {app.icon ? (
                  <img
                    className={app.icon.bg ? "ap-ic ap-cax" : "ap-ic"}
                    src={app.icon.src}
                    alt=""
                    width={app.icon.width}
                    height={app.icon.height}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="ap-ic ap-dot" aria-hidden="true"></span>
                )}
                {app.name}
              </h2>
              <p className={app.secret ? "ap-cap ap-fate" : "ap-cap"}>{app.caption}</p>
              {app.link && app.linkLabel ? (
                <TrackedLink className="ap-link" href={app.link} event="app_link_click" data={{ app: app.id, source: "apps_page" }}>
                  {app.linkLabel}
                </TrackedLink>
              ) : null}
            </div>
            {app.screen ? (
              <figure className="ap-shot">
                <img
                  src={app.screen.src}
                  alt={app.screen.alt}
                  width={app.screen.width}
                  height={app.screen.height}
                  loading={i === firstShot ? "eager" : "lazy"}
                  decoding="async"
                />
              </figure>
            ) : null}
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
