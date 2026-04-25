"use client";

import { useState } from "react";
import styles from "./ScreenshotStack.module.css";

const tilts = [-6, 4, -2];
const shiftsDefault = [-30, 0, 30];
const shiftsHover = [-90, 0, 90];
const yDefault = [0, 0, 0];
const yHover = [10, -20, 10];
const zIndexes = [2, 3, 1];

export default function ScreenshotStack({ images }: { images: string[] }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={styles.stack}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={styles.phone}
          style={{
            transform: `translate(-50%, -50%) translate(${hover ? shiftsHover[i] : shiftsDefault[i]}px, ${hover ? yHover[i] : yDefault[i]}px) rotate(${tilts[i]}deg)`,
            zIndex: zIndexes[i],
          }}
        >
          {images[i] ? (
            <img src={images[i]} alt="" />
          ) : (
            <div className={styles.placeholder}>Screenshot</div>
          )}
        </div>
      ))}
    </div>
  );
}
