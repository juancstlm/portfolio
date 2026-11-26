// Frames through the production home page and its peak, shot at the same scroll positions on the approved
// prototype, plus /apps full page. Writes design/shots/build-{site|proto}-<w>-<frame>.png, a side-by-side
// design/shots/build-cmp-<w>-<frame>.png, and prints a pixel diff per frame (share of pixels that differ by more
// than 24/765 summed RGB, and the mean absolute difference).
// Usage: node tools/build-frames.mjs [site=http://localhost:4200/] [proto=http://localhost:4110/d/] [--theme=dark]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const SITE = args[0] || "http://localhost:4200/";
const PROTO = args[1] || "http://localhost:4110/d/";
const theme = (process.argv.find((a) => a.startsWith("--theme=")) || "").split("=")[1] || "light";
const T = theme === "dark" ? "-dark" : "";
const OUT = "design/shots";
mkdirSync(OUT, { recursive: true });
const VPS = {
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const DATES = ["2019-07-01", "2023-03-01", "2025-07-20", "2026-06-20", "2026-10-20"];

const browser = await chromium.launch();
async function shootAll(url, who, w) {
  const ctx = await browser.newContext(VPS[w]);
  await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(1600);
  const info = await page.evaluate((ds) => {
    const d = window.__dpeak, top = (s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY);
    return { start: d.st.start, end: d.st.end, TEND: d.TEND, Z0: d.Z0, Z1: d.Z1, pN: d.pN, U0: d.U0, U1: d.U1, WI: d.WIPE_IN,
      p: Object.fromEntries(ds.map((x) => [x, d.progAt(x)])), feat: top(".feat"), work: top(".work"), hi: top(".hi"), H: document.documentElement.scrollHeight };
  }, DATES);
  const at = (p) => Math.round(info.start + p * (info.end - info.start));
  const frames = [
    ["h1-top", 0],
    ["h2-feat", info.feat - 40, 1300],
    ["p00-enter", info.start - 450],
    ["p01-start", at(0.004)],
    ["p02-2019", at(info.p["2019-07-01"])],
    ["p03-tesla", at(info.p["2023-03-01"])],
    ["p04-onerm", at(info.p["2025-07-20"])],
    ["p05-calautox", at(info.p["2026-06-20"])],
    ["p06-oct", at(info.p["2026-10-20"])],
    ["p07-wipe-in-50", at(info.pN + 0.5 * info.WI)],
    ["p08-beat-lit", at(info.pN + 0.05)],
    ["p09-beat-hold", at((info.TEND + info.Z0) / 2)],
    ["p10-paper-back-50", at(info.U0 + 0.5 * (info.U1 - info.U0))],
    ["p11-end", at(1)],
    ["h3-work", info.work - 60],
    ["h4-hi", info.hi - 40],
    ["h5-foot", info.H],
  ];
  for (const [name, y, wait] of frames) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(wait || 380);
    await page.screenshot({ path: `${OUT}/build-${who}-${w}${T}-${name}.png` });
  }
  await ctx.close();
  return { frames: frames.map((f) => f[0]), errors, start: info.start, end: info.end };
}

for (const w of [1440, 390]) {
  const s = await shootAll(SITE, "site", w);
  const p = await shootAll(PROTO, "proto", w);
  console.log(`${w}${T}: pin site ${s.start}..${s.end} (${s.end - s.start}px), proto ${p.start}..${p.end} (${p.end - p.start}px); errors site ${s.errors.length} proto ${p.errors.length}`);
  const py = `
import sys
from PIL import Image, ImageChops
a, b, out = sys.argv[1:4]
A = Image.open(a).convert("RGB"); B = Image.open(b).convert("RGB")
if A.size != B.size: B = B.resize(A.size)
d = ImageChops.difference(A, B)
px = d.load(); W, H = d.size; n = 0; tot = 0
for y in range(0, H, 2):
  for x in range(0, W, 2):
    r, g, bb = px[x, y]; s = r + g + bb; tot += s
    if s > 24: n += 1
cnt = (H // 2 + H % 2) * (W // 2 + W % 2)
sheet = Image.new("RGB", (W * 2 + 16, H), (255, 0, 160)); sheet.paste(B, (0, 0)); sheet.paste(A, (W + 16, 0)); sheet.save(out)
print(f"{100 * n / cnt:.2f}% px differ, mean |d| {tot / cnt / 3:.2f}")
`;
  for (const f of s.frames) {
    const a = `${OUT}/build-site-${w}${T}-${f}.png`, b = `${OUT}/build-proto-${w}${T}-${f}.png`, c = `${OUT}/build-cmp-${w}${T}-${f}.png`;
    const r = execFileSync("python3", ["-c", py, a, b, c]).toString().trim();
    console.log(`  ${f.padEnd(18)} ${r}`);
  }
}

// /apps full page
for (const w of [1440, 390]) {
  const ctx = await browser.newContext(VPS[w]);
  await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const page = await ctx.newPage();
  await page.goto(new URL("apps/", SITE).href, { waitUntil: "load" });
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/build-apps-${w}${T}.png`, fullPage: true });
  console.log(`${OUT}/build-apps-${w}${T}.png`);
  await ctx.close();
}
await browser.close();
