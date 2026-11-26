"use client";

import { useEffect, useRef } from "react";
import historyJson from "@/data/history.json";
import siteData from "@/data/site-data.json";
import { mountCommitPeak } from "@/lib/commit-peak";
import { fmt, monthYear, yearTotals, Y0, type History } from "@/lib/history";
import { track } from "@/lib/track";

const H = historyJson as unknown as History;

type App = (typeof siteData.apps)[number];
const appByHistory = new Map<string, App>(siteData.apps.map((a) => [a.history, a]));

/** Readable copy for each milestone: an app's caption, or its store line on a store launch; the link on its last one. */
function milestoneCopy(i: number) {
  const m = H.milestones[i];
  const app = appByHistory.get(m.app);
  const isLast = !H.milestones.slice(i + 1).some((n) => n.app === m.app);
  let cap = app?.caption ?? "";
  if (/on the App Store$/.test(m.label) && app?.storeLine) {
    const s = H.stats[m.app as "onerm" | "atlas"];
    cap = app.storeLine
      .replace("{version}", s.version)
      .replace("{rating}", s.rating.toFixed(1))
      .replace("{ratings}", String(s.ratings));
  }
  const link = isLast && app?.link ? { href: app.link, label: app.linkLabel ?? "" } : null;
  return { m, app, cap, link };
}

const YEAR_NOTES: Record<number, string> = { 2022: "Full-time at Tesla." };

export default function CommitPeak() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountCommitPeak(ref.current, H);
  }, []);

  // one listener for every outbound link in the peak: the live cards (built by lib/commit-peak.ts) and the readable list
  const onClick = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest?.("a");
    const holder = a?.closest<HTMLElement>("[data-app]");
    if (!a || !holder) return;
    const app = appByHistory.get(holder.dataset.app || "");
    if (app) track("app_link_click", { app: app.id, source: "home_peak" });
  };

  const years = yearTotals(H);

  return (
    <section className="d-peak" id="commits" aria-labelledby="d-h" ref={ref} onClick={onClick}>
      {/* Live scene: built by lib/commit-peak.ts. Decorative (aria-hidden); the readable version is .d-static below. */}
      <div className="d-stage" hidden>
        {/* The ending's dark arrives as a wipe. Three layers share one edge E (all moved by transform only): .d-dim (the
            dark paper, under the canvas), .d-paper (ink labels, clipped to the left of E) and .d-dark (a light-ink copy of
            the labels, clipped to the right of E; cloned at mount) */}
        <div className="d-dim" aria-hidden="true"></div>
        <i className="d-svh" aria-hidden="true"></i>
        <canvas className="d-cv" aria-hidden="true"></canvas>
        <div className="d-paper d-clip" aria-hidden="true">
          <div className="d-pin">
            <div className="d-over"></div>
            <div className="d-read">
              <div className="d-stats">
                <p className="d-title">Every commit</p>
                <p className="d-date">{monthYear(H.first)}</p>
                <p className="d-total">
                  <span className="d-num">1</span> <span className="d-unit">commit since 2018</span>
                </p>
                <p className="d-active"></p>
              </div>
              <div className="d-secret">
                <p className="d-s-label">Something new</p>
                <p className="d-s-line">Fate, Lightly Seeded</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Readable version: visible without JS and with reduced motion; kept for screen readers in the live scene. */}
      <div className="d-static">
        <h2 className="d-h" id="d-h">Every commit since 2018</h2>
        <p className="d-sum">
          {fmt(H.total)} commits, one line per day I committed. Each year gets the same width; a taller line means more commits that day.
        </p>
        <figure className="d-fig">
          <img
            src="/images/every-commit.svg"
            alt="A plot of daily commits from 2018 to 2026. Short, sparse lines through 2021, almost nothing in 2022 and 2023, then a dense wall of tall lines through 2026."
            width={1200}
            height={400}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="d-lists">
          <table className="d-years">
            <caption>Commits per year</caption>
            <tbody>
              {years.map((n, i) => (
                <tr key={i}>
                  <th scope="row">{Y0 + i}</th>
                  <td>
                    {fmt(n)}
                    {YEAR_NOTES[Y0 + i] ? <> <span>{YEAR_NOTES[Y0 + i]}</span></> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ol className="d-miles">
            {H.milestones.map((_, i) => {
              const { m, cap, link } = milestoneCopy(i);
              const secret = m.app === "next";
              return (
                <li key={i} data-app={m.app}>
                  <time dateTime={m.d}>{monthYear(m.d)}</time>
                  <b>{m.label}</b>
                  <p className={secret ? "d-fate" : undefined}>{cap}</p>
                  {link && !secret ? <a href={link.href}>{link.label}</a> : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
