"use client";

import { useEffect } from "react";

/**
 * The home page's two small entrances (both enhancements: the content is visible without JS).
 * Hero: on a full load the inline head script adds `.in` two frames after parse; after a client navigation back
 * to "/" this does the same. OneRM: the hairlines draw once the section is a quarter in view.
 */
export default function HomeMotion() {
  useEffect(() => {
    let r1 = 0, r2 = 0;
    const hero = document.querySelector(".hero");
    if (hero && !hero.classList.contains("in")) {
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => hero.classList.add("in"));
      });
    }
    const feat = document.querySelector(".feat");
    let io: IntersectionObserver | null = null;
    if (feat) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              feat.classList.add("in");
              io?.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(feat);
    }
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      io?.disconnect();
    };
  }, []);
  return null;
}
