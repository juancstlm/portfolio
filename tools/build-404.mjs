// Shoots the 404 page from the production build at 1440 and 390. Usage: node tools/build-404.mjs [base]
import { chromium } from "playwright";
const BASE = process.argv[2] || "http://localhost:4200";
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(BASE + "/404.html", { waitUntil: "load" }); await p.waitForTimeout(600);
  await p.screenshot({ path: `design/shots/build-404-${w}.png` });
  console.log(`design/shots/build-404-${w}.png`, "errors", errs.length, "scrollWidth", await p.evaluate(() => document.documentElement.scrollWidth));
  await p.close();
}
await b.close();
