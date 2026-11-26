import { Fragment } from "react";
import siteData from "@/data/site-data.json";
import Top from "@/components/Top";
import Footer from "@/components/Footer";
import CommitPeak from "@/components/CommitPeak";
import HomeMotion from "@/components/HomeMotion";
import TrackedLink from "@/components/TrackedLink";

const ONERM_STORE = siteData.apps.find((a) => a.id === "onerm")!.link!;

// OneRM notes: --t is the UI point's height on the screen (0..1), --f how far into the screen the hairline reaches.
const NOTES = [
  { text: "Every logged set feeds an estimated max, charted over time.", t: 0.239, f: 0.114 },
  { text: "Weight and reps step in plate-sized jumps.", t: 0.599, f: 0.08 },
  { text: "Each past session keeps the best max it produced.", t: 0.821, f: 0.055 },
];

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export default function Home() {
  return (
    <>
      <Top />
      <main>
        <section className="hero" id="top">
          <h1>
            <span className="ln" data-rise style={{ "--i": 0 } as Vars}>
              I make apps for the{" "}
              <span className="nw">
                gym{" "}
                <img className="ic" data-app="onerm" src="/images/projects/onerm-icon.webp" alt="OneRM" width={256} height={256} decoding="async" />
                <img className="ic" data-app="atlas" src="/images/projects/atlas-icon.webp" alt="Atlas" width={256} height={256} decoding="async" />,
              </span>
            </span>{" "}
            <span className="ln" data-rise style={{ "--i": 1 } as Vars}>
              the race{" "}
              <span className="nw">
                track{" "}
                <img className="ic cax" data-app="calautox" src="/images/projects/calautox-icon.svg" alt="CalAutoX" width={512} height={512} decoding="async" />
              </span>
            </span>{" "}
            <span className="ln" data-rise style={{ "--i": 2 } as Vars}>
              and dinner{" "}
              <span className="nw">
                plans{" "}
                <img className="ic" data-app="wsigte" src="/images/projects/wsigte-icon.webp" alt="WSIGTE" width={256} height={256} decoding="async" />.
              </span>
            </span>
          </h1>
          <div className="label" data-rise style={{ "--i": 4 } as Vars}>
            <dl>
              {siteData.label.map((r) => (
                <Fragment key={r.term}>
                  <dt>{r.term}</dt>
                  <dd>{r.detail}</dd>
                </Fragment>
              ))}
            </dl>
            <p className="avail">
              <i></i>
              {siteData.availability}
            </p>
          </div>
        </section>

        <section className="feat" id="onerm">
          <div className="copy">
            <h2>
              <img src="/images/projects/onerm-icon.webp" alt="" width={256} height={256} loading="lazy" decoding="async" />
              OneRM
            </h2>
            <p className="sub">
              A workout logger that works out your one-rep max from the sets you already log. Free on the App Store, with no ads, no subscriptions and no trackers.
            </p>
            <p className="meta">Designed and built solo. React Native, Expo, WatermelonDB.</p>
            <TrackedLink className="btn" href={ONERM_STORE} event="app_link_click" data={{ app: "onerm", source: "home_featured" }}>
              Get it on the App Store
            </TrackedLink>
            <ul className="notes-list">
              {NOTES.map((n) => (
                <li key={n.t}>{n.text}</li>
              ))}
            </ul>
          </div>
          <div className="stage">
            {NOTES.map((n, i) => (
              <Fragment key={n.t}>
                <p className="note" style={{ "--t": n.t } as Vars}>
                  {n.text}
                </p>
                <span className="rule" style={{ "--t": n.t, "--f": n.f, "--i": i } as Vars}></span>
              </Fragment>
            ))}
            <div className="screen">
              <img src="/images/projects/onerm1.webp" alt="OneRM exercise screen with a one-rep max history chart" width={1170} height={2541} loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <CommitPeak />

        <section className="work" id="work">
          <h2>Where I&apos;ve worked</h2>
          <div className="rows">
            {siteData.work.map((w) => (
              <div className="row" key={w.company}>
                <div className="when">{w.period}</div>
                <div>
                  <b>{w.company}</b> <span className="role">· {w.role}</span>
                  <p>{w.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hi" id="hi">
          <h2>Say hi</h2>
          <p>{siteData.availability}</p>
          <ul>
            {siteData.links.map((l) => (
              <li key={l.label}>
                <TrackedLink href={l.href} event="contact_click" data={{ label: l.label, handle: l.handle }}>
                  {l.label}
                  {l.show ? <> <span>{l.show}</span></> : null}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
      <HomeMotion />
    </>
  );
}
