// Perf parity: the production peak vs the approved prototype, same machine, same run. Times the per-frame render
// (canvas + DOM writes) at 600 positions across the peak, then scrolls the real page ~12px per frame through the
// pin and reports rAF frame intervals. GPU raster in new headless mode, DPR 2.
// Usage: node tools/build-perf.mjs [site=http://localhost:4200/] [proto=http://localhost:4110/d/]
import { chromium } from "playwright";
const SITE = process.argv[2] || "http://localhost:4200/";
const PROTO = process.argv[3] || "http://localhost:4110/d/";
const b = await chromium.launch({ channel: "chromium", args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
for (const [name, vp] of [["1440", { width: 1440, height: 900 }], ["390", { width: 390, height: 844 }]]) {
  for (const [who, url] of [["proto", PROTO], ["site", SITE]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
    await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      const d = window.__dpeak, st = d.st;
      scrollTo(0, st.start + 10); await new Promise((r) => setTimeout(r, 200));
      const ts = [];
      for (let i = 0; i <= 600; i++) { const t0 = performance.now(); d.render(i / 600 + 1e-7); ts.push(performance.now() - t0); }
      ts.sort((a, b) => a - b);
      const gaps = []; let last = performance.now();
      await new Promise((res) => {
        let y = st.start;
        const step = () => { const now = performance.now(); gaps.push(now - last); last = now; y += 12; scrollTo(0, y); if (y < st.end) requestAnimationFrame(step); else res(); };
        requestAnimationFrame(step);
      });
      gaps.shift(); gaps.sort((a, b) => a - b);
      const q = (a, f) => +a[Math.floor(a.length * f)].toFixed(2);
      return { render_ms: { p50: q(ts, 0.5), p95: q(ts, 0.95), max: q(ts, 0.999) }, frame_ms: { p50: q(gaps, 0.5), p95: q(gaps, 0.95), max: q(gaps, 0.999) }, over20ms: gaps.filter((g) => g > 20).length, frames: gaps.length };
    });
    console.log(name.padEnd(5), who.padEnd(6), JSON.stringify(r));
    await p.close();
  }
}
await b.close();
