// Writes public/images/every-commit.svg: the static "Every commit" plot shown when JS is off (and the readable
// fallback's figure). Same scales as the live scene: each calendar year the same width, line height = sqrt(commits that day).
// Usage: node scripts/build-plot.mjs   (runs as the second half of `npm run data`)
import { readFileSync, writeFileSync } from "node:fs";

const H = JSON.parse(readFileSync(new URL("../data/history.json", import.meta.url), "utf8"));
const ORDER = ["next", "calautox", "onerm", "ads", "atlas", "wsigte", "site", "other"];
const COL = { wsigte: "#e04020", atlas: "#20a868", ads: "#7fa79c", onerm: "#1fa898", calautox: "#ff6b35", next: "#1c2422", site: "#5a6461", other: "#bfc4c2" };
const Y0 = 2018, YEARS = 9, W = 1200, PADL = 40, PADR = 20, TOP = 30, BASE = 340, HT = BASE - TOP;
const yw = (W - PADL - PADR) / YEARS;
const MAX = Math.sqrt(Math.max(...H.series.map((e) => ORDER.reduce((s, k) => s + (e[k] || 0), 0))));
const frac = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d), a = Date.UTC(y, 0, 1), b = Date.UTC(y + 1, 0, 1);
  return y - Y0 + (t - a) / (b - a);
};
const xs = (f) => PADL + f * yw;
let paths = Object.fromEntries(ORDER.map((k) => [k, ""]));
for (const e of H.series) {
  const tot = ORDER.reduce((s, k) => s + (e[k] || 0), 0);
  const h = (Math.sqrt(tot) / MAX) * HT;
  const x = Math.round(xs(frac(e.d))) + 0.5;
  let y = BASE;
  for (const k of ORDER) {
    if (!e[k]) continue;
    const seg = (h * e[k]) / tot;
    paths[k] += `M${x} ${(y).toFixed(1)}V${(y - seg).toFixed(1)}`;
    y -= seg;
  }
}
let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 400" width="${W}" height="400" font-family="Helvetica Neue, Arial, sans-serif">\n`;
out += `<rect width="${W}" height="400" fill="#f4f7f5"/>\n`;
for (const [n, lab] of [[1, "1"], [10, "10"], [100, "100 commits a day"]]) {
  const y = (BASE - (Math.sqrt(n) / MAX) * HT).toFixed(1);
  out += `<path d="M0 ${y}H${W}" stroke="#2a3330" stroke-opacity=".1"/><text x="${PADL}" y="${y - 5}" font-size="12" fill="#5a6461">${lab}</text>\n`;
}
for (const k of ORDER) out += `<path d="${paths[k]}" stroke="${COL[k]}" stroke-width="1"/>\n`;
out += `<path d="M0 ${BASE + 0.5}H${W}" stroke="#2a3330" stroke-opacity=".35"/>\n`;
const yt = {};
for (const e of H.series) { const y = e.d.slice(0, 4); yt[y] = (yt[y] || 0) + ORDER.reduce((s, k) => s + (e[k] || 0), 0); }
for (let i = 0; i < YEARS; i++) {
  const x = xs(i);
  out += `<path d="M${Math.round(x) + 0.5} ${BASE}v8" stroke="#2a3330" stroke-opacity=".5"/><text x="${x + 4}" y="${BASE + 22}" font-size="14" font-weight="600" fill="#2a3330">${Y0 + i}</text><text x="${x + 4}" y="${BASE + 40}" font-size="12" fill="#5a6461">${(yt[Y0 + i] || 0).toLocaleString("en-US")}</text>\n`;
}
out += `<text x="${xs(5)}" y="${BASE - 70}" font-size="13" fill="#5a6461" text-anchor="middle">Full-time at Tesla.</text>\n`;
out += `</svg>\n`;
writeFileSync(new URL("../public/images/every-commit.svg", import.meta.url), out);
console.log("wrote public/images/every-commit.svg", out.length, "bytes");
