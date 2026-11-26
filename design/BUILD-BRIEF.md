# BUILD BRIEF: ship the redesign into the Next.js site

Worktree: `/Users/juanc/workspace/portfolio-redesign`, branch `redesign` (a git worktree of `~/workspace/portfolio`; never touch the `portfolio` checkout or `master`). Read `CLAUDE.md` and `README.md` (architecture), `design/STORYBOARD.md`, `design/COMMIT-SHEET-C.md` (the chosen direction), and the approved prototype: `prototypes/shared/{template.html,base.css,base.js,data.json,history.json}` + `prototypes/d/{peak.html,peak.css,peak.js,plot.svg}` (view it: `cd prototypes && python3 -m http.server 4100`, open `/d/`). Also `tools/build-history.py`.

The owner approved prototype D ("Every commit") after many rounds. The job is a faithful port into the real site, not a redesign. Every visual and motion decision in the prototype is approved: keep it pixel- and feel-identical (same tokens, type, copy, timings, scroll lengths, wipe, secret beat). If something must change for Next.js, keep the result the same.

## Target
- Next.js 15 static export (`output: "export"`, `trailingSlash: true`), deployed by AWS Amplify from `amplify.yml` (`npx next build`, artifacts `out/`). Keep that working. No server code.
- Routes:
  - `/` = the prototype page: top (name + Apps link + theme toggle), hero (sentence with inline icons + gallery label), featured OneRM (annotated screen, hairlines), the "Every commit" peak, work ledger, Say hi, footer.
  - `/apps/` = redesigned in the same system (it was the old index page). One section per app, newest first, each with `id="<app id>"` so old `/apps#onerm` style links still land: icon, name, year, caption, one screen (phone screens rounded, web screens rounded rect), the link. The secret game is the first entry: "Something new" / "Fate, Lightly Seeded", no screen, no link. No ezBudget. Layout: editorial, not a card grid (bans in the auteur rules: no identical card grids, no eyebrow kickers). Keep it calm: no scroll peak on this page.
  - `/OneRM/privacy/` stays as the static redirect stub in `public/OneRM/privacy/index.html` (already there; don't touch).
  - 404 page restyled to the new tokens (keep it tiny).
- Top edge: name top-left (links to `/`), and on the right a plain "Apps" text link (fires `nav_apps_click`) next to the theme toggle. No bar, no background.

## Implementation rules
- Fonts via `next/font/google`: `Funnel_Display` (variable, weights 400–800) and `Atkinson_Hyperlegible_Next` (400, 600), exposed as CSS variables that feed `--display` / `--text`. Remove the Google Fonts `<link>` and Inter Tight / JetBrains Mono.
- GSAP + ScrollTrigger from npm (`gsap` is already a devDependency: move it to `dependencies`). Register ScrollTrigger once on the client.
- Port `prototypes/d/peak.js` into a client component (e.g. `components/CommitPeak.tsx` + a plain TS module for the drawing/timeline logic). Init in `useEffect`, and clean up fully on unmount (kill ScrollTriggers, remove ticker callbacks, ResizeObservers, listeners), so client navigation `/` → `/apps` → `/` works with no duplicates or leaks. Keep the no-JS fallback markup server-rendered (static plot.svg, per-year table, milestone list) exactly like the prototype, and the reduced-motion cut.
- History data: move `prototypes/shared/history.json` to `data/history.json`, import it at build time (no fetch). Move `tools/build-history.py` to `scripts/build-history.py`, writing `data/history.json`, and add `"data": "python3 scripts/build-history.py"` to package.json. It reads the owner's local repos, so it runs on his Mac before a deploy, never on Amplify; document that in the README. Also move/regenerate the static fallback `plot.svg` from the same data (port `tools/gen-proto-d-svg.mjs` to `scripts/`, run as part of `npm run data`, output into `public/`).
- App data: one source of truth in `data/site-data.json`: merge in the captions/years/links/colours/screen paths from `prototypes/shared/data.json`, drop ezBudget, fix OneRM's stale "In development" status, drop any `privacy` field. Keep the owner's email only in the contact `mailto:` href; never render the address as text anywhere.
- Media: move the optimized webp/svg files from `prototypes/shared/media/` into `public/images/projects/` (replace the old PNG screenshots the site no longer uses; delete unused images). Use plain `<img>` with width/height, `loading="lazy"` except above-the-fold, `decoding="async"`.
- Styles: CSS Modules or plain global CSS files, your choice, but keep the prototype's class structure where that keeps the port faithful. Tokens in `app/globals.css`. Theme: keep `ThemeProvider` behaviour (persisted, no flash: inline script in `<head>` sets `data-theme` before paint), but use the prototype's `[data-theme="dark"]` tokens.
- Analytics (`lib/track.ts`, README table): keep `session_start`; `nav_apps_click` on the Apps link; `contact_click` on Say hi links (`label`, `handle`; for Email, handle = "email"); `app_link_click` on every outbound app link (`app` id, `source`: `home_featured` | `home_peak` | `apps_page`). Update the README's event table to match.
- Metadata: title "Juan Castillo", description from the hero sentence (plain, no vendor names). Keep favicon.
- Delete the old components the new pages don't use (Hero, FeaturedSection, AppsGrid, WorkSection, ScreenshotStack, SectionHeader, Nav, Icon if unused, etc.). Delete `prototypes/`, all `tools/*proto*` scripts, `tools/peek.mjs`, `tools/verify-protos.mjs`, and `design/shots/` contents are gitignored already. Keep `tools/auteur/` and `design/` (briefs, sheets, mockups). Remove `playwright` from devDependencies only if nothing kept uses it (tools/auteur needs it: keep it).
- Copy: use the prototype's copy verbatim. The work ledger line for Agile Six is "The appointments part of VA.gov, front end and back end." Never name the secret game; its only words are "Something new" and "Fate, Lightly Seeded". No vendor/infrastructure names in public copy.
- README: rewrite for the new architecture (routes, data pipeline + `npm run data`, components, analytics table, design docs in `design/`). Per CLAUDE.md, it is the source of truth.
- Fill `design/DESIGN.md` from the auteur template (`~/.hermes/skills/creative/auteur/templates/DESIGN.md`): the real tokens, type, motion vocabulary, section openings, this project's bans (incl. the rejected directions and the secret-game copy rule), and the editing protocol.

## QA (real output only)
1. `npx tsc --noEmit` and `npx next build` succeed; `out/` contains `/`, `/apps/`, `/OneRM/privacy/`, `/404.html`.
2. Serve `out/` statically (`python3 -m http.server 4200 -d out`) and run Playwright from the project root against the production build: zero console errors on `/` and `/apps/`, light and dark; `scrollWidth` equals the viewport at 390 and 1440; client navigation `/` → `/apps/` → `/` leaves exactly one pinned ScrollTrigger and no errors.
3. Shoot frames through the whole home page and through the peak (cursor travel, wipe-in mid, beat hold, paper-back mid, end) at 1440×900 and 390×844, plus `/apps/` full page at both, and LOOK at every frame. Compare the peak frames against the prototype at the same scroll fractions (run the prototype server too) and fix any visual difference.
4. Reduced-motion and JS-disabled runs of `/` render readable content.
5. `node tools/auteur/slopscan.mjs app components` exits 0.
6. Grep `out/` for the email address as visible text (only inside `href="mailto:`), and for any name or description of the unannounced project: must be absent.
7. Lighthouse-style sanity: LCP element is hero text, CLS ~0 (check with a PerformanceObserver in Playwright).

Commit on `redesign` in a few logical commits (port, /apps, cleanup, docs). Do not push, do not merge, do not touch `master`. Report: what you built, QA results with numbers, 6–10 frame paths (design/shots/build-*), anything you could not keep identical and why.
