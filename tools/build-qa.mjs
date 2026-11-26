// QA for the production build (serve out/ first: python3 -m http.server 4200 -d out).
// Checks: console errors + page errors on / and /apps/ (light + dark, 390 + 1440), scrollWidth == viewport (also
// mid-peak), client navigation / -> /apps/ -> / (twice, plus browser back) leaves exactly one pinned ScrollTrigger,
// LCP element + CLS from PerformanceObserver, reduced-motion and JS-disabled runs render readable content.
// Usage: node tools/build-qa.mjs [base=http://localhost:4200]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:4200";
const SHOTS = "design/shots";
mkdirSync(SHOTS, { recursive: true });
const VPS = {
  1440: { viewport: { width: 1440, height: 900 } },
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
let fails = 0;
const fail = (msg) => { fails++; console.log("  FAIL", msg); };
const ok = (msg) => console.log("  ok  ", msg);
const browser = await chromium.launch();

async function open(w, { theme = "light", rm = false, js = true } = {}) {
  const ctx = await browser.newContext({ ...VPS[w], reducedMotion: rm ? "reduce" : "no-preference", javaScriptEnabled: js });
  await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  // LCP + CLS observers, installed before any page script
  await ctx.addInitScript(() => {
    window.__perf = { cls: 0, shifts: [], lcp: null };
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__perf.cls += e.value; window.__perf.shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources?.map((s) => s.node?.className || s.node?.nodeName).join("|") }); } }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); const n = e.element; window.__perf.lcp = { t: Math.round(e.startTime), size: e.size, tag: n?.tagName, cls: n?.className, text: (n?.textContent || "").trim().slice(0, 50), url: e.url, inHero: !!n?.closest?.(".hero") }; }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  return { ctx, page, errors };
}
const settle = (page, ms = 400) => page.waitForTimeout(ms);
const sw = (page) => page.evaluate(() => document.documentElement.scrollWidth);

// 1. console errors + overflow, both routes, both themes, both widths
console.log("1. console errors + scrollWidth");
for (const w of [1440, 390]) for (const theme of ["light", "dark"]) for (const route of ["/", "/apps/"]) {
  const { ctx, page, errors } = await open(w, { theme });
  await page.goto(BASE + route, { waitUntil: "load" });
  await settle(page, 1200);
  const widths = [await sw(page)];
  if (route === "/") {
    // walk the whole page, including through the pinned peak
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(H / 14)) { await page.evaluate((v) => scrollTo(0, v), y); await settle(page, 120); widths.push(await sw(page)); }
  }
  const themeNow = await page.evaluate(() => document.documentElement.dataset.theme || "light");
  const maxW = Math.max(...widths);
  const tag = `${route} ${w} ${theme}`;
  if (errors.length) fail(`${tag}: ${errors.length} console errors: ${errors.join(" | ")}`);
  else if (maxW !== w) fail(`${tag}: scrollWidth ${maxW} != ${w}`);
  else if (themeNow !== theme) fail(`${tag}: theme ${themeNow}`);
  else ok(`${tag}: 0 console errors, scrollWidth ${maxW} over ${widths.length} positions`);
  await ctx.close();
}

// 2. client navigation: exactly one pinned trigger, no duplicates, no errors
console.log("2. client navigation / -> /apps/ -> /");
for (const w of [1440, 390]) {
  const { ctx, page, errors } = await open(w);
  await page.goto(BASE + "/", { waitUntil: "load" });
  await settle(page, 1200);
  const state = () => page.evaluate(() => ({
    path: location.pathname,
    pinned: window.__dpeak ? window.__dpeak.pinned() : 0,
    triggers: window.__dpeak ? window.__dpeak.triggers() : 0,
    spacers: document.querySelectorAll(".pin-spacer").length,
    darks: document.querySelectorAll(".d-dark").length,
    overKids: document.querySelector(".d-paper .d-over")?.children.length ?? 0,
    peaks: document.querySelectorAll(".d-peak").length,
  }));
  const first = await state();
  const seq = [first];
  // scroll into the peak first so the pin is active when we leave
  await page.evaluate(() => scrollTo(0, window.__dpeak.st.start + 800)); await settle(page, 300);
  for (let round = 0; round < 2; round++) {
    await page.click("header.top a.top-link");
    await page.waitForURL("**/apps/"); await settle(page, 600);
    seq.push(await state());
    await page.click("header.top a.name");
    await page.waitForURL((u) => new URL(u).pathname === "/"); await settle(page, 900);
    seq.push(await state());
  }
  await page.goBack(); await page.waitForURL("**/apps/"); await settle(page, 600); seq.push(await state());
  await page.goBack(); await page.waitForURL((u) => new URL(u).pathname === "/"); await settle(page, 900); seq.push(await state());
  // the peak still scrubs after the round trips: the edge reaches 0 in the beat
  await page.evaluate(() => { const d = window.__dpeak; scrollTo(0, Math.round(d.st.start + ((d.TEND + d.Z0) / 2) * (d.st.end - d.st.start))); });
  await settle(page, 400);
  const edge = await page.evaluate(() => window.__dpeak.edge);
  const homes = seq.filter((s) => s.path === "/"), apps = seq.filter((s) => s.path === "/apps/");
  const homeOk = homes.every((s) => s.pinned === 1 && s.triggers === 1 && s.spacers === 1 && s.darks === 1 && s.peaks === 1 && s.overKids === first.overKids);
  const appsOk = apps.every((s) => s.pinned === 0 && s.spacers === 0 && s.peaks === 0);
  console.log("   ", w, JSON.stringify(seq));
  if (!homeOk || !appsOk) fail(`${w}: navigation state`);
  else if (edge !== 0) fail(`${w}: peak not scrubbing after navigation (edge ${edge})`);
  else if (errors.length) fail(`${w}: errors ${errors.join(" | ")}`);
  else ok(`${w}: ${homes.length} home visits each with exactly 1 pinned trigger (1 total, 1 spacer, 1 dark layer, ${first.overKids} overlay labels); /apps has 0; beat edge 0 after round trips; 0 errors`);
  await ctx.close();
}

// 3. LCP + CLS (fresh load, no scroll; then the CLS after a slow scroll to the peak is reported separately)
console.log("3. LCP + CLS");
for (const w of [1440, 390]) for (const route of ["/", "/apps/"]) {
  const { ctx, page } = await open(w);
  await page.goto(BASE + route, { waitUntil: "load" });
  await settle(page, 3000);
  const p = await page.evaluate(() => window.__perf);
  const lcpOk = route === "/" ? p.lcp?.inHero && p.lcp.t < 2500 : p.lcp && p.lcp.t < 2500; // home: hero text (sentence or label; which wins varies with the entrance timing); /apps: just fast
  const line = `${route} ${w}: LCP ${p.lcp?.t}ms <${p.lcp?.tag?.toLowerCase()} class="${p.lcp?.cls}"> "${p.lcp?.text}" ${p.lcp?.url || ""}; CLS ${p.cls.toFixed(4)} ${p.shifts.length ? JSON.stringify(p.shifts) : ""}`;
  if (!lcpOk || p.cls > 0.01) fail(line); else ok(line);
  await ctx.close();
}

// 4. reduced motion + JS disabled: readable content
console.log("4. reduced motion + no JS");
for (const w of [1440, 390]) for (const mode of ["rm", "nojs"]) {
  const { ctx, page, errors } = await open(w, { rm: mode === "rm", js: mode !== "nojs" });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await settle(page, 1500);
  const r = await page.evaluate(() => {
    const vis = (el) => { if (!el) return false; const s = getComputedStyle(el), b = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.9 && b.width > 2 && b.height > 2; };
    const sec = document.querySelector(".d-peak");
    return {
      cls: sec.className,
      hero: vis(document.querySelector(".hero h1 .ln")),
      label: vis(document.querySelector(".hero .label")),
      miles: [...document.querySelectorAll(".d-miles li")].filter(vis).length,
      years: [...document.querySelectorAll(".d-years tr")].filter(vis).length,
      fig: vis(document.querySelector(".d-fig img")),
      stage: vis(document.querySelector(".d-stage")),
      work: [...document.querySelectorAll(".row")].filter(vis).length,
      hi: [...document.querySelectorAll(".hi a")].filter(vis).length,
      pinned: document.querySelectorAll(".pin-spacer").length,
      fate: document.querySelector(".d-miles .d-fate")?.textContent,
    };
  });
  const y = await page.evaluate(() => document.querySelector(".d-peak").getBoundingClientRect().top + scrollY);
  for (const [n, dy] of [["a", 0], ["b", 820], ["c", 1640]]) {
    await page.evaluate((v) => scrollTo(0, v), y + dy); await settle(page, 400);
    await page.screenshot({ path: `${SHOTS}/build-${mode}-${w}-${n}.png` });
  }
  const want = mode === "rm" ? r.stage && !r.fig && r.pinned === 0 : !r.stage && r.fig;
  const line = `${mode} ${w}: ${JSON.stringify(r)}`;
  if (!(r.hero && r.label && r.miles === 8 && r.years === 9 && r.work === 4 && r.hi === 3 && want && r.fate === "Fate, Lightly Seeded") || errors.length) fail(line + " " + errors.join(" | "));
  else ok(line);
  await ctx.close();
}

await browser.close();
console.log(fails ? `FAILURES: ${fails}` : "all checks passed");
process.exit(fails ? 1 : 0);
