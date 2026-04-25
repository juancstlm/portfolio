"use client";

import { useState } from "react";
import siteData from "@/data/site-data.json";
import SectionHeader from "./SectionHeader";
import Icon from "./Icon";
import styles from "./WorkSection.module.css";

export default function WorkSection() {
  const [expanded, setExpanded] = useState(false);
  const jobs = siteData.work;
  const visible = expanded ? jobs : jobs.slice(0, 2);
  const remaining = jobs.length - 2;

  return (
    <section id="work" className={styles.section}>
      <SectionHeader
        label="Work"
        title="Where I've worked"
        subtitle="Professional history, most recent first"
      />
      <div className={styles.list}>
        {visible.map((job, i) => (
          <div
            key={job.company + i}
            className={styles.row}
            style={{
              borderBottom:
                i === visible.length - 1
                  ? "1px solid var(--line)"
                  : "none",
            }}
          >
            <div className={styles.period}>
              <span
                className={styles.periodText}
                style={{
                  color: job.current ? "var(--accent)" : "var(--mute)",
                }}
              >
                {job.current && <span className={styles.currentDot} />}
                {job.period}
              </span>
              <span className={styles.location}>{job.location}</span>
            </div>
            <div className={styles.details}>
              <div className={styles.role}>{job.role}</div>
              <div className={styles.company}>{job.company}</div>
              <p className={styles.summary}>{job.summary}</p>
              <div className={styles.stack}>
                {job.stack.map((s) => (
                  <span key={s} className={styles.tag}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.counter}>
              {String(jobs.length - i).padStart(2, "0")} /{" "}
              {String(jobs.length).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {remaining > 0 && (
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded
              ? "Show less"
              : `Show ${remaining} more role${remaining === 1 ? "" : "s"}`}
            <span
              className={styles.expandArrow}
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
              }}
            >
              ↓
            </span>
          </button>
        )}
        <a
          href="https://www.linkedin.com/in/juancstlm"
          className={styles.linkedinLink}
        >
          <Icon name="linkedin" size={13} /> Full history on LinkedIn →
        </a>
      </div>
    </section>
  );
}
