// Analytics wiring check against the production build: stubs window.umami, blocks outbound navigation, clicks every
// tracked control and prints the events. Usage: node tools/build-events.mjs [base=http://localhost:4200]
import { chromium } from "playwright";
const BASE = process.argv[2] || "http://localhost:4200";
const b = await chromium.launch();
let fails = 0;
async function ctxWith(opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await ctx.addInitScript(() => {
    window.__ev = [];
    window.umami = { track: (n, d) => window.__ev.push([n, d || null]) };
    // outbound links: keep the page (React's handlers still run; only the navigation is cancelled)
    addEventListener("click", (e) => { const a = e.target.closest?.("a"); if (a && !a.href.startsWith(location.origin)) e.preventDefault(); }, true);
  });
  return ctx;
}
const expect = (got, want, label) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(ok ? "  ok  " : "  FAIL", label, JSON.stringify(got));
};
const take = (page) => page.evaluate(() => window.__ev.splice(0));

{
  const ctx = await ctxWith();
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(800);
  expect(await take(page), [["session_start", { entry: "home" }]], "session_start on /");
  await page.click(".feat .btn"); expect(await take(page), [["app_link_click", { app: "onerm", source: "home_featured" }]], "featured button");
  for (const [label, handle] of [["Email", "email"], ["GitHub", "@juancstlm"], ["LinkedIn", "in/juancstlm"]]) {
    await page.click(`.hi a:has-text("${label}")`);
    expect(await take(page), [["contact_click", { label, handle }]], `contact ${label}`);
  }
  // a live peak card with a link: WSIGTE's first commit (cursor just past it)
  await page.evaluate(() => { const d = window.__dpeak; scrollTo(0, Math.round(d.st.start + d.progAt("2019-06-25") * (d.st.end - d.st.start))); });
  await page.waitForTimeout(500);
  await page.click('.d-paper .d-card[data-app="wsigte"] a');
  expect(await take(page), [["app_link_click", { app: "wsigte", source: "home_peak" }]], "peak card link");
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.click("header.top a.top-link"); await page.waitForURL("**/apps/"); await page.waitForTimeout(500);
  expect(await take(page), [["nav_apps_click", null]], "Apps link (client navigation, no second session_start)");
  const ids = await page.$$eval(".ap-link", (as) => as.map((a) => a.closest("section").id));
  const got = [];
  for (const id of ids) { await page.click(`#${id} .ap-link`); got.push(...(await take(page))); }
  expect(got.map((e) => e[1].app + ":" + e[1].source), ids.map((id) => id + ":apps_page"), `apps page links (${ids.length})`);
  await ctx.close();
}
{
  // reduced motion: the readable milestone list is visible and its links are tracked too
  const ctx = await ctxWith({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/apps/", { waitUntil: "load" }); await page.waitForTimeout(600);
  expect(await take(page), [["session_start", { entry: "apps" }]], "session_start on /apps/");
  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(600); await take(page);
  await page.click('.d-miles li[data-app="calautox"] a');
  expect(await take(page), [["app_link_click", { app: "calautox", source: "home_peak" }]], "readable milestone link (reduced motion)");
  await ctx.close();
}
await b.close();
console.log(fails ? `FAILURES: ${fails}` : "all events ok");
process.exit(fails ? 1 : 0);
