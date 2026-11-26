# juancastillom.com

Juan Castillo's personal site. Next.js 16 (App Router), React 19 and TypeScript, exported as static files to `out/` and deployed by AWS Amplify on push (`amplify.yml`: Node 22 via nvm, `npm ci`, `npx next build`, artifacts in `out/`). Needs Node 20.9 or newer. There is no server code.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm run typecheck  # tsc --noEmit
npm run data       # refresh data/history.json + the no-JS plot (Juan's Mac only, see "Data pipeline")
```

## Routes

| Route | Source | What it is |
|---|---|---|
| `/` | `app/page.tsx` | Top edge, hero sentence with inline app icons + gallery label, featured OneRM (annotated screen), the "Every commit" peak, work ledger, Say hi, footer |
| `/apps/` | `app/apps/page.tsx` | One section per app, newest first, each with `id="<app id>"` so `/apps#onerm`-style links land. "Something new" first, type only. No scroll scene |
| `/OneRM/privacy/` | `public/OneRM/privacy/index.html` | Static redirect stub to the privacy page on onerm.dev. Leave it alone |
| 404 | `app/not-found.tsx` | One line and a link home (exported as `404.html`) |

`next.config.ts` sets `output: "export"` and `trailingSlash: true`.

## Layout of the code

```
app/
  layout.tsx           fonts (next/font: Funnel Display -> --font-display, Atkinson Hyperlegible Next -> --font-text),
                       metadata, the inline theme script, every stylesheet (imported once, in order)
  globals.css          tokens (light + [data-theme="dark"]), reset, top edge, button, footer
  home.css             hero, featured OneRM, work ledger, Say hi
  page.tsx             the home page
  apps/page.tsx        /apps   (apps/apps.css)
  not-found.tsx        404     (not-found.css)
components/
  Top.tsx              name -> "/", Apps link (nav_apps_click), ThemeToggle
  ThemeToggle.tsx      flips data-theme, stores it, dispatches "themechange"
  HomeMotion.tsx       hero load entrance (after client navigation) + OneRM hairline draw (IntersectionObserver)
  CommitPeak.tsx       the peak: server-rendered readable fallback + mounts lib/commit-peak.ts
  commit-peak.css      the peak's styles (d-* classes)
  TrackedLink.tsx      outbound link that fires one analytics event
  Footer.tsx, Analytics.tsx
lib/
  commit-peak.ts       the peak's scene: canvas + overlay labels as a pure function of scroll progress
  gsap.ts              gsap + ScrollTrigger, registered once on the client
  history.ts           types and helpers for data/history.json
  theme-script.ts      the <head> script (stored theme + js-ready before first paint)
  track.ts, session.ts analytics
data/
  site-data.json       single source for copy and app facts (label rows, work, links, apps)
  history.json         daily commits + milestones + public stats (generated, see below)
scripts/
  build-history.py     writes data/history.json
  build-plot.mjs       writes public/images/every-commit.svg (the no-JS plot)
  screenshot.sh        captures a site screenshot with headless Chrome (convert to webp before use)
public/images/         app icons and screens (webp/svg), every-commit.svg
tools/
  build-*.mjs          QA for the production build (below)
  auteur/              design QA tooling (slopscan, snap, ...); needs playwright
design/                briefs, storyboard, commit sheets, DESIGN.md (the style contract), mockups
```

All styles are plain global CSS imported once from `app/layout.tsx`. Route-level imports would make link prefetching preload the other route's stylesheet and trip Chrome's "preloaded but not used" warning.

## Theme

`lib/theme-script.ts` runs inline in `<head>` before first paint: it applies `localStorage.theme` to `<html data-theme>` (light by default), adds `js-ready` (the hero and OneRM entrances key off it, so without JS everything is simply visible) and starts the hero entrance two frames after the document is parsed. `ThemeToggle` flips the attribute, persists it and dispatches a `themechange` event that the peak listens to so it can repaint its canvas.

## The "Every commit" peak

`components/CommitPeak.tsx` renders two things on the server:

- `.d-stage` (hidden): the live scene's shell. On mount, `lib/commit-peak.ts` unhides it, builds the overlay labels, clones the paper layer into the dark layer, and pins the stage with one ScrollTrigger (800vh on desktop, 480vh under 760px). A `gsap.ticker` callback reads `scrollY` and redraws only when it changes. Every number shown is computed for the current scroll position; nothing is tweened.
- `.d-static`: the readable version (heading, `every-commit.svg`, commits per year, milestone list). It is what you see without JS, it stays in the DOM for screen readers in the live scene, and the milestone list shows under the reduced-motion end state.

`mountCommitPeak()` returns a cleanup that kills the ScrollTrigger (reverting the pin spacer), removes the ticker callback and listeners, removes the cloned layer and restores the server markup, so `/` -> `/apps/` -> `/` never leaves a second pin. With `prefers-reduced-motion: reduce` there is no pin: the end state is drawn once above the milestone list. `window.__dpeak` exposes the trigger and timeline constants for the QA scripts.

## Data pipeline

```bash
npm run data       # python3 scripts/build-history.py && node scripts/build-plot.mjs
```

`scripts/build-history.py` reads Juan's local git repos in `~/workspace` (author "Juan Castillo", all branches, deduped by hash), the App Store lookup API, the npm registry and a cached autocross profile, and writes `data/history.json` (`HISTORY_OUT=<path>` writes elsewhere for a dry run). Because it needs the local repos, **run it on Juan's Mac before a deploy and commit the result; it never runs on Amplify.** `scripts/build-plot.mjs` then regenerates `public/images/every-commit.svg` from the same file. The pages import `data/history.json` at build time (no fetch), so the fallback's totals, the per-year table and the live scene always agree.

Project keys in the history: `wsigte`, `atlas`, `ads`, `onerm`, `calautox`, `site` (this site), `other` (unnamed side projects, never named on the site) and `next` (the unannounced project). Its only public words are "Something new" and "Fate, Lightly Seeded".

The repo names counted as `next` are not in this public repo: they live in the gitignored `scripts/history-sources.local.json` (`{"next": ["<repo>", ...]}`), and `build-history.py` stops if that file is missing. Never commit those names, or anything that describes the unannounced project.

App facts (names, years, captions, links, store-line templates, icon/screen paths and sizes) live in `data/site-data.json`. The milestone captions in the peak come from there and from `history.json`'s store stats. The contact email exists only as the `mailto:` href; it is never rendered as text.

## Analytics

Umami, loaded only in production (`NODE_ENV !== "development"`) and only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, so local development never reports events. Set it in `.env.local` and in the Amplify environment; use separate website IDs for production and previews.

```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-website-id
```

| Event | When | Properties |
|-------|------|------------|
| `session_start` | First load of a session | `entry` (`home` \| `apps` \| `other`), plus any `utm_*` params |
| `nav_apps_click` | Click on the "Apps" link in the top edge | none |
| `contact_click` | Click on a link in "Say hi" | `label` (`Email` \| `GitHub` \| `LinkedIn`), `handle` (`email` \| `@juancstlm` \| `in/juancstlm`) |
| `app_link_click` | Any outbound app link | `app` (site id: `calautox`, `onerm`, `atlas-design-system`, `atlas`, `wsigte`), `source` (`home_featured` \| `home_peak` \| `apps_page`) |

Events go through `lib/track.ts`, which queues calls until the Umami script is ready and drops them after 10 s if it never loads. `home_peak` covers both the live milestone cards and the readable milestone list.

## QA

Serve the build and run the scripts from the project root:

```bash
npx next build && python3 -m http.server 4200 -d out
npx tsc --noEmit
node tools/build-qa.mjs       # console errors, overflow at 390/1440, nav pin count, LCP/CLS, reduced motion, no JS
node tools/build-events.mjs   # every analytics event and its properties
node tools/build-frames.mjs   # frames through home + peak (and /apps full page) into design/shots/build-*
node tools/auteur/slopscan.mjs app components
```

`build-frames.mjs` and `build-perf.mjs` compare against the approved prototype served at `http://localhost:4110/d/`: extract it with `git archive 6a54644 prototypes | tar -x -C <scratch>` and run `python3 -m http.server 4110 -d <scratch>/prototypes`. Screenshots go to `design/shots/` (gitignored).

## Design docs

`design/DESIGN.md` is the style contract: tokens, type, motion vocabulary, section openings, bans and the rejected directions. Read it before changing anything visual. The rest of `design/` records how the design was reached (storyboard, commit sheets, briefs, round boards).
