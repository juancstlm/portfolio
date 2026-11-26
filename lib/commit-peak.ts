// "Every commit": a pinned, full-bleed plot of every day Juan committed since 2018 (data/history.json).
// Scroll moves a cursor through time at 1:1: the whole scene is a pure function of scroll progress p, drawn once per
// frame from gsap.ticker into one DPR-aware canvas (lines snapped to whole device pixels) plus a few DOM labels that
// only move by transform/opacity. Nothing is tweened: every number shown is computed for the current position.
//
// Scales: x gives every calendar year the same width; y is the square root of commits that day.
// Camera: the plot's right edge stays on the end of 2026. Once the cursor passes 62% of the width the left edge
// closes in, so time zooms toward today while the cursor holds its place, and the 2026 wall gets the room it needs.
// Ending: as the cursor reaches the "Something new" milestone the lights go out as a hard edge sweeping right to
// left. Everything right of the edge is the dark side: other projects grey, that project's lines lit, labels in a
// quiet light ink, the readout replaced by its one line. Nothing cross-fades, so a paused frame is always clean paper
// on one side and clean dark on the other. The camera then closes in on its weeks, holds, and on the pull-back to
// all nine years the paper returns as a wipe from the left.
//
// Ported 1:1 from the approved prototype (prototypes/d/peak.js). Differences are only what React needs: the data is
// imported at build time instead of fetched, and mountCommitPeak() returns a cleanup that kills the ScrollTrigger,
// removes the ticker callback and listeners and restores the server-rendered markup, so client navigation never
// leaves a duplicate pin behind.
import { gsap, ScrollTrigger } from "./gsap";
import { ORDER, type History, type ProjectKey } from "./history";

type El = HTMLElement & { __twin?: El; __o?: number; __v?: boolean };

declare global {
  interface Window {
    __dpeak?: Record<string, unknown>;
  }
}

export function mountCommitPeak(sec: HTMLElement, H: History): () => void {
  const q = <T extends Element = El>(s: string, root: ParentNode = sec) => root.querySelector(s) as T;
  const stage = q(".d-stage");
  const cv = q<HTMLCanvasElement>(".d-cv");
  const over = q(".d-over");
  const read = q(".d-read");
  const elDate = q(".d-date");
  const elNum = q(".d-num");
  const elUnit = q(".d-unit");
  const elActive = q(".d-active");
  const dimEl = q(".d-dim");
  const paperBox = q(".d-paper"), paperPin = q(".d-pin", paperBox);
  const svh = q(".d-svh");
  const elStats = q(".d-stats"), elSecret = q(".d-secret");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!stage || !cv || !cv.getContext) return () => {}; // keep the readable block

  // upgrade right away so the readable block never flashes; revert if anything fails
  sec.classList.add(reduce ? "d-rm" : "d-live");
  stage.hidden = false;

  let dead = false;
  let st: ScrollTrigger | null = null;
  let tick: (() => void) | null = null;
  let onTheme: (() => void) | null = null;
  let onResize: (() => void) | null = null;
  let darkBox: El | null = null;

  const cleanup = () => {
    dead = true;
    if (tick) gsap.ticker.remove(tick);
    if (st) st.kill(); // reverts the pin spacer
    if (onTheme) document.removeEventListener("themechange", onTheme);
    if (onResize) window.removeEventListener("resize", onResize);
    darkBox?.remove();
    over.replaceChildren();
    // restore the server-rendered state (and drop the write caches kept on those nodes)
    for (const el of [dimEl, paperBox, paperPin, elStats, elSecret, cv] as El[]) {
      el.style.removeProperty("transform"); el.style.removeProperty("opacity"); el.style.removeProperty("visibility");
      delete el.__o; delete el.__v;
    }
    (function unpair(x: El) { delete x.__twin; for (let i = 0; i < x.children.length; i++) unpair(x.children[i] as El); })(paperPin);
    cv.removeAttribute("style"); cv.removeAttribute("width"); cv.removeAttribute("height");
    sec.classList.remove("d-live", "d-rm");
    stage.hidden = true;
    if (window.__dpeak) delete window.__dpeak;
  };

  try {
    init();
  } catch (err) {
    cleanup();
    if (process.env.NODE_ENV !== "production") console.warn("commit peak disabled", err);
  }
  return cleanup;

  function init() {
    // ---------- constants ----------
    const NAME: Record<ProjectKey, string> = { wsigte: "WSIGTE", atlas: "Atlas", ads: "Atlas Design System", onerm: "OneRM", calautox: "CalAutoX", next: "Something new", site: "This site", other: "Other projects" };
    const LEGEND: ProjectKey[] = ["wsigte", "atlas", "ads", "onerm", "calautox", "next", "site", "other"];
    const ICON: Partial<Record<ProjectKey, string>> = { wsigte: "wsigte-icon.webp", atlas: "atlas-icon.webp", ads: "ads-icon.webp", onerm: "onerm-icon.webp", calautox: "calautox-icon.svg" };
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const Y0 = 2018, NY = 9, R = NY, DAY = 864e5;
    const Q = 0.62; // where the cursor holds once the camera starts to move
    const W_PAN = 2.15; // phones: about two years in view
    // p: 0..TEND cursor travel (the lights-out wipe starts inside it, at the "Something new" milestone), TEND..Z0 hold on
    // the lit lines, Z0..Z1 pull-back to all nine years while the paper wipes back, Z1..1 hold on the total
    const TEND = 0.8, Z0 = 0.875, Z1 = 0.95;
    const WIPE_IN = 0.03; // p the lights-out wipe takes, from the milestone
    const U0 = Z0 + 0.03, U1 = Z1; // the paper wipes back in over the second half of the pull-back
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const GAMMA = 1.1; // scroll cost per year ~ 1 / window^GAMMA: the closer to today, the more scroll a day gets

    const utc = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };
    const frac = (iso: string) => { const y = +iso.slice(0, 4), a = Date.UTC(y, 0, 1); return y - Y0 + (utc(iso) - a) / (Date.UTC(y + 1, 0, 1) - a); };
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smin = (x: number, y: number, k: number) => { const h = Math.max(k - Math.abs(x - y), 0); return Math.min(x, y) - (h * h) / (4 * k); };
    const smax = (x: number, y: number, k: number) => -smin(-x, -y, k);
    const K = 7, KN = 1 - (1 + K) * Math.exp(-K);
    const spring = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : (1 - (1 + K * t) * Math.exp(-K * t)) / KN); // critically damped, no overshoot
    const back = (t: number) => { const c1 = 1.25, c3 = c1 + 1, u = t - 1; return 1 + c3 * u * u * u + c1 * u * u; };
    const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // ---------- data ----------
    type Day = { f: number; tot: number; segs: [ProjectKey, number][]; h: number; cut: [ProjectKey, number][] };
    const days: Day[] = H.series.map((e) => {
      let tot = 0; const segs: [ProjectKey, number][] = [];
      for (const k of ORDER) { const n = e[k]; if (n) { tot += n; segs.push([k, n]); } }
      return { f: frac(e.d), tot, segs, h: 0, cut: [] };
    });
    const MAXS = Math.sqrt(Math.max(...days.map((d) => d.tot)));
    for (const d of days) {
      const h = Math.sqrt(d.tot) / MAXS; let acc = 0;
      d.h = h; d.cut = d.segs.map(([k, n]) => [k, ((acc += n) / d.tot) * h]); // cumulative height fractions
    }
    const fFirst = frac(H.first), fLast = frac(H.last);
    const n0 = utc(H.first) / DAY, n1 = utc(H.last) / DAY, ND = n1 - n0 + 1;
    const cum = new Int32Array(ND), mask = new Uint16Array(ND), daily = new Uint16Array(ND);
    for (const e of H.series) {
      const i = utc(e.d) / DAY - n0; let m = 0, t = 0;
      ORDER.forEach((k, b) => { const n = e[k]; if (n) { m |= 1 << b; t += n; } });
      daily[i] = m; cum[i] = t;
    }
    for (let i = 1; i < ND; i++) cum[i] += cum[i - 1];
    for (let i = 0; i < ND; i++) { let m = 0; for (let j = Math.max(0, i - 6); j <= i; j++) m |= daily[j]; mask[i] = m; }
    const yearTot = new Array(NY).fill(0);
    for (const d of days) yearTot[Math.floor(d.f)] += d.tot;
    const fmt = (n: number) => n.toLocaleString("en-US");
    const races = (H.races || []).map((r) => ({ f: frac(r.d), win: r.cls === 1 }));
    const tesla = [frac("2022-03-01"), frac("2024-07-31")];
    const months: { f: number; t: string }[] = [];
    for (let y = 2024; y <= 2026; y++) for (let m = 1; m < 12; m++) months.push({ f: frac(`${y}-${String(m + 1).padStart(2, "0")}-01`), t: MONTHS[m].slice(0, 3) });

    // ---------- camera + pacing (pure functions of cursor time) ----------
    const wDesk = (cf: number) => (R - cf) / (1 - smin(cf / R, Q, 0.1)); // full view, then a zoom pinned to the end of 2026
    let mobile = false;
    function camTravel(cf: number) {
      if (!mobile) { const w = wDesk(cf); return { a: R - w, w }; }
      const w = smin(W_PAN, (R - cf) / (1 - Q), 0.4);
      return { a: smax(cf - Q * w, 0, 0.12), w };
    }
    // scroll -> time: equal scroll for equal on-screen distance (desktop camera on both, so phones keep the same pacing)
    const NT = 2048, tabF = new Float64Array(NT + 1), tabS = new Float64Array(NT + 1);
    (() => {
      let acc = 0; tabF[0] = fFirst;
      for (let i = 1; i <= NT; i++) {
        const f0 = lerp(fFirst, fLast, (i - 1) / NT), f1 = lerp(fFirst, fLast, i / NT);
        acc += (f1 - f0) / Math.pow(wDesk((f0 + f1) / 2), GAMMA);
        tabF[i] = f1; tabS[i] = acc;
      }
      for (let i = 1; i <= NT; i++) tabS[i] /= acc;
    })();
    const lookup = (xs: Float64Array, ys: Float64Array, v: number) => {
      let lo = 0, hi = NT;
      if (v <= xs[0]) return ys[0];
      if (v >= xs[NT]) return ys[NT];
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= v) lo = mid; else hi = mid; }
      return lerp(ys[lo], ys[hi], (v - xs[lo]) / (xs[hi] - xs[lo]));
    };
    const timeAt = (u: number) => lookup(tabS, tabF, u);
    const progAt = (f: number) => lookup(tabF, tabS, f); // travel progress (0..1) at which the cursor reaches time f
    const fN = frac(H.milestones.find((m) => m.app === "next")?.d || "2026-10-27");
    const pN = progAt(fN) * TEND; // the beat starts here
    // beat camera: close in on the last project's weeks (phones ~10px a day, desktop ~20px), cursor still 1:1
    const beatCam = () => mobile ? { a: fN - 2 / 365, b: fLast + 3 / 365 } : { a: fN - 26 / 365, b: fLast + 11 / 365 };

    // milestones: label/caption/link come from the readable list so copy lives in one place
    const lis = [...sec.querySelectorAll(".d-miles li")];
    type Mile = { f: number; app: ProjectKey; label: string; when: string; cap: string; a: HTMLAnchorElement | null; u: number; end: number; slot: number; ds: number; de: number; side: "l" | "r" };
    const miles: Mile[] = H.milestones.map((m, i) => {
      const li = lis[i];
      return { f: frac(m.d), app: m.app, label: m.label, when: li?.querySelector("time")?.textContent || "", cap: li?.querySelector("p")?.textContent || "", a: li?.querySelector("a") || null, u: 0, end: 0, slot: 0, ds: 0, de: 0, side: "r" };
    });
    // card schedule (travel progress): a card shows from its milestone until the next arrives, but at least CARD_MIN;
    // overlapping cards take the other rail slot so close pairs (WSIGTE/Atlas 2019, OneRM 2025) never collide
    const CARD_MIN = 0.035;
    miles.forEach((m, i) => {
      m.u = progAt(m.f);
      const nu = i < miles.length - 1 ? progAt(miles[i + 1].f) : Infinity;
      m.end = Math.max(nu, m.u + CARD_MIN);
      m.slot = i > 0 && m.u < miles[i - 1].end ? 1 - miles[i - 1].slot : 0;
    });
    // phones dock one card at a time under the readout: each starts when the previous one has had its turn
    miles.forEach((m, i) => {
      m.ds = i ? Math.max(m.u, miles[i - 1].de) : m.u;
      m.de = i < miles.length - 1 ? Math.max(progAt(miles[i + 1].f), m.ds + CARD_MIN) : Infinity;
    });

    // ---------- DOM: overlay labels ----------
    const mk = (cls: string, html?: string) => { const el = document.createElement("div") as El; el.className = cls; if (html != null) el.innerHTML = html; over.appendChild(el); return el; };
    const yrEls: El[] = [], ytEls: El[] = [];
    for (let i = 0; i < NY; i++) { yrEls.push(mk("d-yr", String(Y0 + i))); ytEls.push(mk("d-yt", fmt(yearTot[i]))); }
    const moEls = months.map((m) => mk("d-mo", m.t));
    const ticks = ([[1, "1"], [10, "10"], [100, "100 commits a day"]] as const).map(([n, t]) => ({ n, el: mk("d-tick", t) }));
    const gapEl = mk("d-gap", "Full-time at Tesla.");
    const wkEl = mk("d-wk", "Autocross, since 2025");
    const noteEl = mk("d-note");
    const legendEl = mk("d-legend", LEGEND.map((k) => `<span data-k="${k}"><i></i>${NAME[k]}</span>`).join(""));
    const dock = mk("d-dock");
    const mEls = miles.map((m) => {
      const el = mk("d-mk");
      const ic = document.createElement("span") as El;
      ic.className = "d-ic" + (m.app === "calautox" ? " d-cax" : m.app === "next" ? " d-next" : "");
      if (ICON[m.app]) ic.innerHTML = `<img src="/images/projects/${ICON[m.app]}" alt="" decoding="async">`;
      const card = document.createElement("div") as El;
      card.className = "d-card";
      card.innerHTML = "<b></b><time></time><p></p>";
      const dic = ic.cloneNode(true) as El; // the docked card carries its own icon
      dic.className += " d-dic";
      card.prepend(dic);
      card.querySelector("b")!.textContent = m.label;
      card.querySelector("time")!.textContent = m.when;
      card.querySelector("p")!.textContent = m.cap;
      if (m.a) { const a = document.createElement("a"); a.href = m.a.href; a.textContent = m.a.textContent; a.tabIndex = -1; card.appendChild(a); }
      el.append(ic, card);
      card.dataset.app = m.app;
      return { el, ic, card, dx: 0 };
    });

    // ---------- the dark side: a deep copy of the paper layer; every overlay node gets a __twin written alongside ----------
    darkBox = paperBox.cloneNode(true) as El;
    darkBox.className = "d-dark d-clip";
    paperBox.after(darkBox);
    const darkPin = darkBox.querySelector(".d-pin") as El;
    (function pair(x: El, y: El) { x.__twin = y; for (let i = 0; i < x.children.length; i++) pair(x.children[i] as El, y.children[i] as El); })(paperPin, darkPin);
    darkBox.querySelectorAll("a").forEach((a) => (a.tabIndex = -1));
    const both = (el: El, fn: (e: El) => void) => { fn(el); if (el.__twin) fn(el.__twin); };

    // ---------- palette (theme aware; the plot's own colours come from each app's icon/UI) ----------
    let C = {} as Record<ProjectKey, string>, INK = "", INK2 = "", GHOST = 0.09, MINT = "";
    const LIT = "oklch(0.97 0.004 165)"; // the last project's lines in the dark beat: off-white, no glow
    const GREY = "oklch(0.37 0.006 165)"; // everything else in the dark beat
    function palette() {
      const cs = getComputedStyle(document.documentElement);
      const dark = document.documentElement.dataset.theme === "dark";
      INK = cs.getPropertyValue("--ink").trim(); INK2 = cs.getPropertyValue("--ink-2").trim(); MINT = cs.getPropertyValue("--mint").trim();
      GHOST = dark ? 0.14 : 0.09;
      C = {
        wsigte: "#e04020", // WSIGTE icon red
        atlas: "#20a868", // Atlas icon green
        ads: dark ? "#8fb5aa" : "#7fa79c", // ADS: mint-grey, from its icon's pale tile and teal stack
        onerm: dark ? "#3cc7b6" : "#1fa898", // OneRM icon teal, deepened a step for hairlines on paper
        calautox: "#ff6b35", // CalAutoX accent orange
        next: INK, // "Something new": near-black ink (near-white on the dark page)
        site: INK2,
        other: dark ? "oklch(0.5 0.008 165)" : "oklch(0.8 0.006 165)",
      };
      both(legendEl, (l) => l.querySelectorAll<HTMLElement>("span").forEach((s) => s.style.setProperty("--c", C[s.dataset.k as ProjectKey])));
      activeKey = -1;
    }

    // ---------- layout ----------
    let vw = 0, vh = 0, dpr = 1, padL = 0, padR = 0, span = 0, base = 0, top = 0, PH = 0, railY = 0, slotDY = 0, docked = false;
    let ctx!: CanvasRenderingContext2D;
    function layout() {
      vw = stage.clientWidth; vh = Math.min(stage.clientHeight, svh.offsetHeight || stage.clientHeight); // lay out in the small viewport
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      mobile = vw < 760 && !reduce;
      padL = padR = clamp(vw * 0.04, 20, 64);
      span = vw - padL - padR;
      base = Math.round(vh - (vw < 760 ? 196 : 158));
      const narrow = vw < 760;
      if (narrow !== docked) {
        mEls.forEach((e) => { (narrow ? dock : e.el).appendChild(e.card); (narrow ? dock.__twin! : e.el.__twin!).appendChild(e.card.__twin!); both(e.card, (c) => (c.style.transform = "")); });
        docked = narrow; cache.clear();
      }
      both(dock, (d) => (d.style.display = narrow ? "" : "none"));
      if (narrow) {
        const dt = Math.round(read.offsetTop + read.offsetHeight + 10);
        dock.style.top = dt + "px";
        top = dt + Math.max(...mEls.map((e) => e.card.offsetHeight)) + 16;
      } else top = Math.round(vh * 0.15);
      PH = base - top;
      railY = Math.round(base - PH * (narrow ? 0.5 : 0.45));
      slotDY = narrow ? 46 : 120;
      cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
      cv.style.width = cv.width / dpr + "px"; cv.style.height = cv.height / dpr + "px";
      ctx = cv.getContext("2d")!;
      // which side each card opens to: decided by where its marker sits when the cursor reaches it
      miles.forEach((m, i) => {
        const c = camTravel(m.f);
        m.side = (m.f - c.a) / c.w < 0.55 ? "r" : "l";
        both(mEls[i].card, (c) => (c.className = "d-card" + (docked ? "" : " d-" + m.side)));
      });
      const note = "Not to scale: each year is the same width.";
      both(noteEl, (n) => { n.textContent = note; n.style.width = vw < 760 ? span + "px" : "auto"; });
      both(legendEl, (l) => (l.style.display = vw < 760 ? "none" : ""));
      measure();
      cache.clear();
      lastP = -1;
    }
    // widths of DOM labels, read once per layout (never inside the frame, so a frame never forces layout)
    const Wd = new Map<Element, number>();
    let statsR = 400;
    function measure() {
      statsR = read.offsetLeft + read.offsetWidth; // the readout column's right edge (phones: nearly the full width)
      for (const el of [gapEl, wkEl, legendEl, ...yrEls, ...ticks.map((t) => t.el), ...mEls.map((e) => e.card)]) Wd.set(el, el.offsetWidth);
    }
    const wOf = (el: Element) => Wd.get(el) || 0;

    // ---------- transform/opacity writers (only touch the DOM when a value changes) ----------
    const cache = new Map<Element, string>();
    const setT = (el: El, x: number, y: number, extra = "") => { const v = `translate3d(${Math.round(x * 2) / 2}px,${Math.round(y * 2) / 2}px,0)${extra}`; if (cache.get(el) !== v) { cache.set(el, v); both(el, (e) => (e.style.transform = v)); } };
    const setO = (el: El, o: number) => { o = Math.round(o * 100) / 100; if (el.__o !== o) { el.__o = o; both(el, (e) => (e.style.opacity = String(o))); } };
    const setV = (el: El, on: boolean) => { if (el.__v !== on) { el.__v = on; both(el, (e) => (e.style.visibility = on ? "visible" : "hidden")); } };
    const setX = (el: El, x: number) => { const v = `translate3d(${x}px,0,0)`; if (cache.get(el) !== v) { cache.set(el, v); el.style.transform = v; } }; // edge layers (no twins)

    // ---------- readout ----------
    let lastDate = "", lastNum = -1, activeKey = -1;
    function readout(cf: number) {
      const y = Y0 + Math.floor(cf), a = Date.UTC(y, 0, 1), len = (Date.UTC(y + 1, 0, 1) - a) / DAY;
      const dn = clamp(Math.floor(a / DAY + (cf - Math.floor(cf)) * len + 1e-6), n0, n1);
      const i = dn - n0;
      const dt = new Date(dn * DAY);
      const ds = MONTHS[dt.getUTCMonth()] + " " + dt.getUTCFullYear();
      if (ds !== lastDate) { lastDate = ds; elDate.textContent = ds; }
      const n = cum[i];
      if (n !== lastNum) { lastNum = n; elNum.textContent = fmt(n); elUnit.textContent = n === 1 ? "commit since 2018" : "commits since 2018"; }
      const m = mask[i];
      if (m !== activeKey) {
        activeKey = m;
        const ks = LEGEND.filter((k) => m & (1 << ORDER.indexOf(k)));
        elActive.innerHTML = ks.length ? ks.map((k) => `<span style="--c:${C[k]}"><i></i>${NAME[k]}</span>`).join("") : '<span class="d-quiet">No commits this week.</span>';
      }
    }

    // ---------- the frame: everything is a function of p ----------
    let lastP = -1, E = 0;
    function render(p: number) {
      if (p === lastP) return;
      lastP = p;
      const u = clamp(p / TEND, 0, 1);
      const cf = timeAt(u);
      const z = inOut(clamp((p - Z0) / (Z1 - Z0), 0, 1)); // pull-back to all nine years

      // camera: travel camera -> beat close-up on the last project's weeks -> pull-back to all nine years
      const ce = camTravel(cf), bc = beatCam();
      const tb = smooth(clamp((p - pN - 0.012) / 0.045, 0, 1));
      const w1 = Math.exp(lerp(Math.log(ce.w), Math.log(bc.b - bc.a), tb));
      const r1 = lerp(ce.a + ce.w, bc.b, tb);
      const w = Math.exp(lerp(Math.log(w1), Math.log(NY), z));
      const a = lerp(r1, R, z) - w;
      const sc = span / w;
      const X = (f: number) => padL + (f - a) * sc;
      const cx = X(cf);
      const PEN = 26; // a day's line rises over the last 26px before the cursor reaches it, so behind it is full colour
      readout(cf);

      // the edge: dark side is x > E. Lights go out right to left from the milestone; the paper wipes back left to
      // right during the pull-back. One number moves three layers (transform only).
      const wi = smooth(clamp((p - pN) / WIPE_IN, 0, 1)), wo = smooth(clamp((p - U0) / (U1 - U0), 0, 1));
      const Er = p < pN ? vw : p < U0 ? lerp(vw, 0, wi) : lerp(0, vw, wo);
      E = Math.round(clamp(Er, 0, vw) * dpr) / dpr;
      const dark0 = E < vw, paper0 = E > 0;
      // the readout never straddles the edge: the stats leave before the edge reaches them, the dark line arrives
      // once the edge has passed the whole column (and the reverse on the way back), so no word is ever cut in two
      setO(elStats, clamp((E - statsR) / Math.max(8, Math.min(70, vw - statsR)), 0, 1));
      setO(elSecret.__twin!, clamp((padL - E) / padL, 0, 1));
      setX(dimEl, E); setX(darkBox!, E); setX(darkPin, -E); setX(paperBox, E - vw); setX(paperPin, vw - E);
      setV(dimEl, dark0); setV(darkBox!, dark0);

      // canvas: the scene is drawn once per side, each pass clipped to its side of the edge
      const c = ctx, D = dpr, bD = Math.round(base * D), hD = PH * D, h1 = Math.max(1, Math.round(D)), ED = Math.round(E * D);
      const pitch = sc / 365.25; // css px per day
      const lw = Math.max(1, Math.round(clamp(pitch * 0.34, 1, 3) * D)); // hairlines on paper; a little wider once days have room
      const lwD = Math.max(lw, Math.round(Math.min(pitch * (vw < 760 ? 0.8 : 0.55), vw < 760 ? 12 : 11) * D)); // dark side: near-full day slots
      const moA = clamp((sc / 12 - 46) / 24, 0, 1); // month ticks + labels once a month is wide enough to name
      const ga = clamp((cx - X(tesla[0])) / 30, 0, 1);
      const gy = Math.round((base - PH * 0.2) * D);
      const wy = base + (vw < 760 ? 58 : 64);
      const r0 = races.length ? X(races[0].f) : 0;
      const wkX = Math.max(r0 - wOf(wkEl) - 12, padL);
      const wkEnd = wkX + wOf(wkEl) + 10;
      const ca = 1 - clamp((p - TEND) / 0.015, 0, 1);
      const stems = miles.map((m, i) => {
        const last = i === miles.length - 1;
        const y = last && !docked ? lerp(railY - m.slot * slotDY, top + 26, z) : railY - m.slot * slotDY;
        return { m, last, x: X(m.f), y, tIn: clamp((cx - X(m.f) + 24) / 24, 0, 1) };
      });
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      for (const dk of [false, true]) {
        if (dk ? !dark0 : !paper0) continue;
        c.save();
        c.beginPath();
        if (dk) c.rect(ED, 0, cv.width - ED, cv.height); else c.rect(0, 0, ED, cv.height);
        c.clip();
        const AX = dk ? LIT : INK, AK = dk ? 0.75 : 1;
        // axis
        c.fillStyle = AX;
        c.globalAlpha = 0.09 * AK;
        for (const t of ticks) c.fillRect(0, Math.round(bD - (Math.sqrt(t.n) / MAXS) * hD), cv.width, h1);
        c.globalAlpha = 0.32 * AK;
        c.fillRect(0, bD, cv.width, h1);
        c.globalAlpha = 0.45 * AK;
        for (let i = 0; i <= NY; i++) { const x = Math.round(X(i) * D); if (x > -4 && x < cv.width + 4) c.fillRect(x, bD, h1, Math.round(8 * D)); }
        if (moA > 0) {
          c.globalAlpha = 0.3 * moA * AK;
          for (const m of months) { const x = Math.round(X(m.f) * D); if (x > -4 && x < cv.width + 4) c.fillRect(x, bD, h1, Math.round(5 * D)); }
        }
        // Tesla bracket, where the gap is
        if (ga > 0) {
          c.globalAlpha = (dk ? 0.3 : 0.5) * ga; c.fillStyle = dk ? LIT : INK2;
          const xa = Math.round(X(tesla[0]) * D), xb = Math.round(X(tesla[1]) * D);
          c.fillRect(xa, gy, xb - xa, h1); c.fillRect(xa, gy, h1, Math.round(6 * D)); c.fillRect(xb - h1, gy, h1, Math.round(6 * D));
        }
        // days: faint ahead of the cursor, full colour behind it (dark side: grey, the last project lit)
        const W0 = dk ? lwD : lw;
        for (const d of days) {
          const x = X(d.f);
          if (x < -12 || x > vw + 12) continue;
          const xd = Math.round(x * D - W0 / 2);
          const t = spring(clamp((cx - x + PEN) / PEN, 0, 1));
          const ht = Math.round(d.h * hD);
          const done = Math.round(d.h * hD * t);
          if (done < ht) { c.globalAlpha = dk ? 0.13 : GHOST; c.fillStyle = dk ? LIT : INK; c.fillRect(xd, bD - ht, W0, ht - done); }
          if (t <= 0) continue;
          c.globalAlpha = 1;
          let y0 = bD;
          for (const [k, h] of d.cut) {
            const y1 = Math.round(bD - h * hD * t);
            if (y0 > y1) { c.fillStyle = dk ? (k === "next" ? LIT : GREY) : C[k]; c.fillRect(xd, y1, W0, y0 - y1); }
            y0 = y1;
          }
        }
        // autocross weekends: one dot per event, class wins filled mint; the label sticks to the left edge
        for (const r of races) {
          const x = X(r.f); if (x < -6 || x > vw + 6) continue;
          const al = clamp((cx - x + 10) / 10, 0, 1) * clamp((x - wkEnd) / 10, 0, 1) * (dk ? 0.5 : 1); if (al <= 0) continue;
          c.globalAlpha = al; c.beginPath(); c.arc(x * D, wy * D, (r.win ? 3.4 : 2.8) * D, 0, Math.PI * 2);
          if (r.win) { c.fillStyle = MINT; c.fill(); c.lineWidth = D; c.strokeStyle = dk ? LIT : INK; c.globalAlpha = al * 0.5; c.stroke(); }
          else { c.lineWidth = 1.25 * D; c.strokeStyle = dk ? LIT : INK2; c.stroke(); }
        }
        // milestone stems
        for (const s of stems) {
          if (s.tIn <= 0 || s.x < -20 || s.x > vw + 20) continue;
          const xd = Math.round(s.x * D - h1 / 2), yd = Math.round((s.y + 14) * D);
          c.globalAlpha = 0.55 * s.tIn * (dk && !s.last ? 0.35 : 1); c.fillStyle = dk ? (s.last ? LIT : GREY) : C[s.m.app];
          c.fillRect(xd, yd, h1, bD - yd);
        }
        // cursor
        if (ca > 0) {
          const xd = Math.round(cx * D - h1 / 2), yt = Math.round((top - 12) * D);
          c.globalAlpha = 0.85 * ca; c.fillStyle = dk ? LIT : INK;
          c.fillRect(xd, yt, h1, bD - yt + Math.round(12 * D));
          c.beginPath(); c.arc(xd + h1 / 2, bD, 4 * D, 0, Math.PI * 2); c.fill();
        }
        c.restore();
      }
      c.globalAlpha = 1;

      // milestones: icon + card in DOM (the dark copy shows them quieter; cards stay on the paper side)
      stems.forEach(({ m, last, x, y, tIn }, i) => {
        const e = mEls[i];
        let on: number;
        if (docked) on = clamp((u - m.ds) / 0.004, 0, 1) * (1 - clamp((u - m.de) / 0.004 + 1, 0, 1));
        else {
          on = clamp((u - m.u) / 0.005, 0, 1);
          if (!last) on *= 1 - clamp((u - m.end) / 0.005 + 1, 0, 1);
          on *= clamp((x - 34) / 30, 0, 1); // leave once its marker slides off the left edge
        }
        if (last && p >= pN && p < U0) on = 0; // the last card waits for the paper; during the beat the readout carries it
        setT(e.el, x, y);
        const s = tIn <= 0 ? 0.6 : (0.6 + 0.4 * back(tIn)) * lerp(0.62, 1, on);
        const sv = `scale(${s.toFixed(3)})`;
        if (cache.get(e.ic) !== sv) { cache.set(e.ic, sv); both(e.ic, (ic) => (ic.style.transform = sv)); }
        setO(e.ic, tIn);
        if (!docked) {
          let dx = 0; // keep a card inside the viewport
          if (m.side === "l") { const left = x - 22 - wOf(e.card); if (left < 12) dx = 12 - left; }
          else { const right = x + 22 + wOf(e.card); if (right > vw - 12) dx = vw - 12 - right; }
          setT(e.card, dx, 0);
          e.dx = dx;
        }
        // a card is only shown while it sits wholly on the paper side
        const cR = docked ? vw : m.side === "l" ? x - 16 + e.dx : x + 28 + wOf(e.card) + e.dx;
        on *= clamp((E - cR) / 30, 0, 1);
        setO(e.card, on); setV(e.card, on > 0.02);
      });

      // DOM labels. Year labels stick to the left edge while their year is on screen (like a section header).
      const hold = clamp((p - U0) / 0.015, 0, 1); // 2026's total lands with the paper
      let stickR = -1e9;
      for (let i = 0; i < NY; i++) {
        const x0 = X(i) + 5, x1 = X(i + 1) + 5, wy0 = wOf(yrEls[i]);
        const stuck = Math.max(x0, padL), x = Math.min(stuck, x1 - wy0 - 14);
        const keep = 1 - clamp((stuck - x) / (wy0 * 0.7), 0, 1); // fade out as the next year pushes it off
        if (x0 < padL && keep > 0) stickR = x + wy0;
        setT(yrEls[i], x, base + 14);
        setO(yrEls[i], keep);
        setT(ytEls[i], x, base + (vw < 760 ? 32 : 35));
        setO(ytEls[i], keep * (i < NY - 1 ? clamp((cx - X(i + 1)) / 16 + 1, 0, 1) : hold));
      }
      months.forEach((m, i) => {
        const x = X(m.f) + 4, el = moEls[i];
        const al = moA * clamp((x - stickR - 8) / 14, 0, 1) * (x > -30 && x < vw - 30 ? 1 : 0);
        if (al > 0) setT(el, x, base + 14);
        setO(el, al);
      });
      // phones: tick labels sit right (over the faint future) during travel and slide left as the camera pulls back,
      // where the end state's milestone icons cluster on the right
      for (const t of ticks) setT(t.el, vw < 760 ? lerp(vw - padR - wOf(t.el), padL, z) : padL, base - (Math.sqrt(t.n) / MAXS) * PH - 17);
      setT(gapEl, (X(tesla[0]) + X(tesla[1])) / 2 - wOf(gapEl) / 2, gy / D - 24);
      setO(gapEl, ga);
      setT(wkEl, wkX, wy - 7);
      setO(wkEl, races.length ? clamp((cx - r0 + 10) / 10, 0, 1) : 0);
      setT(noteEl, padL, vh - (vw < 760 ? 54 : 46));
      if (vw >= 760) setT(legendEl, vw - padR - wOf(legendEl), vh - 46);
    }

    // ---------- wiring ----------
    let cur = () => 1;
    palette();
    layout();
    onTheme = () => { palette(); lastP = -1; render(cur()); };
    document.addEventListener("themechange", onTheme);

    if (reduce) {
      // no pin, no scrub: the full plot drawn once at its end state, the milestone list below
      const draw = () => { if (dead) return; layout(); render(1); };
      draw();
      onResize = draw;
      window.addEventListener("resize", draw);
      document.fonts?.ready.then(draw);
      return;
    }

    let dirty = true, lastY = -1;
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * (window.innerWidth < 760 ? 4.8 : 8)), // 800vh desktop, 0.6x on phones
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => { if (dead) return; layout(); dirty = true; },
    });
    st = trigger;
    cur = () => clamp((window.scrollY - trigger.start) / Math.max(1, trigger.end - trigger.start), 0, 1);
    // read scroll inside the ticker (never in a scroll handler) so each frame matches the scroll position exactly
    tick = () => {
      const y = window.scrollY;
      if (y === lastY && !dirty) return;
      lastY = y; dirty = false;
      render(cur());
    };
    gsap.ticker.add(tick);
    document.fonts?.ready.then(() => { if (!dead) ScrollTrigger.refresh(); }); // label widths and card heights settle once fonts land
    window.__dpeak = {
      st: trigger, miles, TEND, Z0, Z1, pN, U0, U1, WIPE_IN,
      get edge() { return E; },
      progAt: (iso: string) => progAt(frac(iso)) * TEND,
      render,
      get p() { return cur(); },
      triggers: () => ScrollTrigger.getAll().length,
      pinned: () => ScrollTrigger.getAll().filter((t) => t.vars.pin).length,
    };
  }
}
