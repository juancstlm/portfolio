# PROTOTYPE BRIEF: three peaks for juancastillom.com

Repo worktree: `/Users/juanc/workspace/portfolio-redesign` (branch `redesign`). Read `design/STORYBOARD.md` and `design/COMMIT-SHEET.md` first: they hold the facts, palette, type and motion budget. This brief adds what changed after the owner's feedback.

## What the owner said
- Loved: the hero sentence with real app icons set inline ("that was cool"). The gallery-label bio under it is approved.
- Font: Funnel Display (display) + Atkinson Hyperlegible Next (text). Picked by the owner. Do not change.
- Rejected axis: "too plain, not enough wow", and a static mockup was too hard to judge. Every prototype must move and be a real WOW. One peak only per page.
- He measures UI feel against native iOS (his own Swift apps). He called a JS reorder and an odometer number animation "subpar" in the past. Motion must feel physically right: iOS-like springs/curves, no jitter, no lag behind the scroll, no cheap tweening of numbers.
- Unannounced project: shown only as "Something new" / "Fate, Lightly Seeded". Never name or describe it.
- No link to Long Dog Racing. No ezBudget.

## Facts (do not invent any others)
Apps, newest first, in `prototypes/shared/data.json` (captions, links, years, UI colours, screen paths). Work history and contact are already in the shared shell.

## Shared files (READ ONLY for children)
- `prototypes/shared/template.html`: the page. The hero (with `img.ic[data-app]` icons you can hook into), the featured OneRM section, then `{{PEAK_HTML}}`, then work, contact and footer. It loads `../shared/base.css`, `peak.css`, gsap + ScrollTrigger (3.15, globals `gsap`, `ScrollTrigger`), `../shared/base.js`, then `peak.js`.
- `prototypes/shared/base.css`: tokens (`--page --ink --ink-2 --line --mint --green --display --text --gutter --ease-out`), light + dark (`[data-theme="dark"]` on `<html>`; a `themechange` event fires on toggle).
- `prototypes/shared/media/`: webp screens. Phone screens are bare 1170w captures with dark square corners: clip with `border-radius` ≥ 12.5% of rendered width. Web screens: calautox-1 (1440×900, dark UI), wsigte-1 (1280×800, cream UI), ads (1662×1245, a composite of components on a light background).
- `prototypes/build.mjs`: `node prototypes/build.mjs <id>` writes `prototypes/<id>/index.html` from the template + your `peak.html`. Never edit `index.html` by hand.

## Your files (the only ones you may create or edit)
`prototypes/<id>/peak.html`, `peak.css`, `peak.js`, plus any extra assets inside `prototypes/<id>/`. Prefix all your classes/ids with `<id>-` so nothing collides with the shared CSS. Do not touch `shared/`, `design/`, other prototypes, `app/`, `components/` or git. Do not commit.

## Rules
- Peak = one scroll-driven scene (GSAP ScrollTrigger, native scroll; no Lenis/smooth-scroll lib). Pin with ScrollTrigger. Animate `transform` and `opacity` only (one written exception allowed per prototype, e.g. `clip-path` on a single element, with a code comment saying why).
- No `window.addEventListener('scroll')`. No `transition: all`. No `scale(0)` entrances. No gradient text, no glassmorphism cards, no eyebrow kickers, no purple-blue gradients, no marquee, no device-frame mockups with fake bezels (a clean rounded screen is fine).
- Content must be visible without JS: write the peak's HTML so that, with JS off, every app shows as a readable block (year, name, caption, link, one screen). JS then upgrades it into the pinned scene.
- `prefers-reduced-motion: reduce` = a gentler cut: no pin/scrub, opacity-only reveals, same content.
- Mobile (390×844): the peak must work by touch scroll. Shorten pin lengths (~0.6×). Make sure nothing widens the page horizontally (`overflow-x` clean at 390).
- Copy: use the captions in data.json verbatim. Any extra line you write: plain, specific, no "seamless/elevate/unleash", no em-dash chains, no line ending on a vague "it". Keep it minimal.
- Performance: one ScrollTrigger timeline (or a small number) owning the scene, `will-change` only on the animated layers, lazy decode screens (`loading="lazy"` except the first). Images are already optimized.
- Theme: the peak must look right in both light and dark page themes (stage colours can stay the same in both; the cuts in and out of the peak must not flash).

## QA you must do before reporting (real output, not claims)
1. `node prototypes/build.mjs <id>` and serve with `python3 -m http.server <port>` from `prototypes/` (your port below). Open `http://localhost:<port>/<id>/`.
2. Zero console errors (check with Playwright: `page.on('console')` / `pageerror`).
3. Capture viewport frames at several scroll positions through the peak (desktop 1440×900 and mobile 390×844, deviceScaleFactor 1) with Playwright from the project root (`playwright` is installed there; write the script to `tools/` with your id in the filename and save frames to `design/shots/proto-<id>-*.png`). Tile them with ffmpeg if useful. LOOK at every frame with vision and fix what's broken (overlaps, blank frames, clipped text, wrong colour flashes, horizontal overflow).
4. Scroll back up through the peak and confirm it reverses cleanly.
5. `node tools/auteur/slopscan.mjs prototypes/<id>` exits 0.
6. Check `document.documentElement.scrollWidth === 390` at mobile.

## Report back
- What you built (3–6 lines), the scroll length, the timeline structure.
- Paths of 4–8 representative frames (desktop + mobile).
- Known weaknesses, honestly.
- Confirm you touched only `prototypes/<id>/` and `tools/*<id>*` and `design/shots/proto-<id>-*`.

## Ports and screenshot prefixes
| id | peak | port | shots prefix |
|---|---|---|---|
| a | App launch | 4101 | design/shots/proto-a- |
| b | Rewind, live | 4102 | design/shots/proto-b- |
| c | Home screen | 4103 | design/shots/proto-c- |
