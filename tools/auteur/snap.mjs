// Quick mockup screenshots at desktop / mobile / ultra-wide.
// Usage: node tools/snap.mjs <file-or-url> <outprefix>   (copy into the project so `playwright` resolves)
import { chromium } from 'playwright';
import path from 'node:path';
const [target, out] = process.argv.slice(2);
if (!target || !out) { console.error('usage: node snap.mjs <file-or-url> <outprefix>'); process.exit(1); }
const url = /^https?:/.test(target) ? target : 'file://' + path.resolve(target);
const browser = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile'], [2200, 1100, 'wide']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'mobile' ? 2 : 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400); // web fonts + layout settle
  const file = `${out}-${tag}.png`;
  await page.screenshot({ path: file, fullPage: tag !== 'wide' }); // desktop + mobile full page, so below-fold sections get reviewed too
  console.log(file);
  await page.close();
}
await browser.close();
