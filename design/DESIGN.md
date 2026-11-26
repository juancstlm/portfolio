# DESIGN: juancastillom.com

> The style contract. Written after the port of prototype D passed QA; read it at the START of every later edit. New work that contradicts this file is wrong even if it looks good in isolation. Update the file deliberately when the system itself changes; never drift it silently.

## Identity
- **The one feeling:** momentum. A person who makes real things, and has for years.
- **Signature / peak:** "Every commit": a pinned, full-bleed plot of every day Juan committed since 2018, one hairline per day, coloured by project. Scroll moves a cursor through time 1:1; the readout (month, running total, active projects) is computed for the exact scroll position. At "Something new" the lights go out as a hard edge sweeping right to left, the camera closes in on that project's weeks under the line "Fate, Lightly Seeded", then the paper wipes back for the nine-year total. Secondary signature: the hero sentence with the real app icons set inline. Do not add a second spectacle anywhere.
- **Register:** direct (one cinematic peak on `/`); `/apps` and 404 are calm, build-register pages with no scroll scene.

## Tokens (verbatim from `app/globals.css`)
```css
:root {
  --page: oklch(0.975 0.004 165);   /* lit paper, chroma ~0: not cream, not a dark terminal */
  --ink: oklch(0.23 0.02 165);
  --ink-2: oklch(0.42 0.015 165);   /* secondary text, still >= 4.5:1 on --page */
  --line: oklch(0.23 0.02 165 / 0.14);
  --mint: oklch(0.80 0.13 165);     /* availability dot, autocross class wins. Never decorative */
  --green: oklch(0.45 0.09 165);    /* focus ring */
  --btn-bg: var(--ink);
  --btn-fg: var(--page);
  --shadow: oklch(0.23 0.02 165 / 0.45);
  --display: var(--font-display), "Helvetica Neue", Arial, sans-serif;  /* Funnel Display */
  --text: var(--font-text), "Helvetica Neue", Arial, sans-serif;        /* Atkinson Hyperlegible Next */
  --gutter: clamp(20px, 4vw, 64px);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
[data-theme="dark"] {
  --page: oklch(0.19 0.01 165);
  --ink: oklch(0.95 0.006 165);
  --ink-2: oklch(0.76 0.012 165);
  --line: oklch(0.95 0.006 165 / 0.14);
  --green: oklch(0.80 0.12 165);
  --shadow: oklch(0 0 0 / 0.6);
}
```
- Peak-only colours (`components/commit-peak.css`, `lib/commit-peak.ts`): the dark beat's paper `oklch(0.19 0.01 165)` (`oklch(0.11 0.008 165)` on the dark theme), lit lines `oklch(0.97 0.004 165)`, grey `oklch(0.37 0.006 165)`, light labels `oklch(0.97 0 0 / 0.5)`.
- Project line colours, each sampled from the app's own icon/UI: WSIGTE `#e04020`, Atlas `#20a868`, ADS `#7fa79c` (dark `#8fb5aa`), OneRM `#1fa898` (dark `#3cc7b6`), CalAutoX `#ff6b35`, Something new = `--ink`, this site = `--ink-2`, other projects `oklch(0.8 0.006 165)` (dark `oklch(0.5 0.008 165)`).
- Radii: app icons 22.5% of their size; phone screens 13% of their width; web screens 12px; pills 999px; peak cards 6px.
- Layout: 12 columns, 24px gutters, `--gutter` side padding. Body 17px / 1.55.

## Typography
- **Display:** Funnel Display (variable; 500 for the readout month, 600 for every heading, label and year, 700 for the running total). Letter-spacing tightens with size: -0.01em at 19px, -0.03em for section heads, -0.032em hero, -0.04em "Say hi", -0.045em the readout number. Never below -0.045em.
  - Hero: `clamp(2.5rem, 5.6vw, 5.75rem)` / 1.04, `text-wrap: balance`, inline icons at 0.84em.
  - Section heads: `clamp(2rem, 3.2vw, 3rem)` / 1.02. OneRM: `clamp(2.2rem, 3.6vw, 3.4rem)`. Say hi: `clamp(3rem, 8vw, 6rem)`.
  - Readout number: `clamp(4rem, 8.4vw, 7.6rem)`, tabular figures, rendered directly (never tweened).
- **Text:** Atkinson Hyperlegible Next 400/600. 17px body, 0.95rem metadata in `--ink-2`, 12–13.5px plot labels. Measure 34–60ch.
- **Numerals:** Funnel Display tabular (`font-variant-numeric: tabular-nums`). No monospace anywhere.
- Pairing axis: a geometric display face against a humanist, legibility-first text face (COMMIT-SHEET-C). Inter, Space Grotesk and every mono face are out. No new fonts.

## Color rules
- Commitment tier: restrained everywhere except inside the plot, which is full-palette. Around the plot it is ink on paper.
- Mint means "available" or "won"; it is never decoration. Project colours appear only in the plot, its legend and the active-project dots.
- Forbidden: gradients, glow, glassmorphism, warm/cream neutrals, a dark default theme, colour floods behind sections.

## Motion vocabulary
The home page has three families. Do not add a fourth.
1. **Entrance (load only):** hero lines + label rise 14px, unblur 6px → 0, fade in; 700ms `--ease-out`, 60ms stagger (`--i`). Started two frames after parse by the head script.
2. **Line draw:** the three OneRM hairlines `scaleX(0 → 1)`, 600ms `--ease-out`, 80ms stagger, end dots fade in 200ms after 560ms; fires once at 25% visibility.
3. **Scroll-scrub (the peak):** one ScrollTrigger, pinned, `end` = 8 × innerHeight (4.8 × under 760px), `anticipatePin: 1`. Timeline in progress p: travel 0–0.8 (scroll per year ∝ 1/window^1.1), wipe-in 0.03 from the "Something new" milestone, beat hold to 0.875, pull-back 0.875–0.95 with the paper wiping back over 0.905–0.95, hold to 1. The camera holds the cursor at 62% once it starts to zoom (phones: about 2.15 years in view). A day's line grows over the last 26px before the cursor with a critically damped spring (k = 7, no overshoot); milestone icons pop with a 1.25 back-ease. Only transform/opacity on DOM; the canvas is redrawn from the ticker only when `scrollY` changes.
- Hover/press: toggle and pill borders `border-color` 140ms `--ease-out`; `.btn:active` scale 0.97 over 120ms.
- Reduced motion: entrances become a 400ms linear fade; hairlines fade to 0.6; the peak is not pinned and draws its end state once above the milestone list.
- `/apps` and 404 have no motion. Keep them that way.

## Layout patterns
- Grid break: the peak runs edge to edge outside the 12-column grid and fills the pinned viewport, with the readout in a narrow column over the quiet early years. The OneRM screen bleeds off the right edge.
- Section openings in use (rotate among these; no eyebrow kickers):
  - a full sentence as the heading (hero, `/apps` "Everything I've shipped, newest first.");
  - icon + name heading (OneRM, each `/apps` row);
  - a plain section head on the left of a ledger (Where I've worked);
  - one centred word pair (Say hi).
- Components that exist: inline icon in a sentence, gallery label (`dl` rows), hairline notes, ledger rows (date rail + entry, hairline top border), pill links, the `/apps` row (year rail, copy, one screen). Reuse before inventing. No cards, no card grids, no bento.

## Copy voice
- Plain, specific, first person, dry. Example: "I make apps for the gym, the race track and dinner plans."
- Sentence case, short declaratives, full stops on prose. Links name their destination ("Open wsigte.com", "App Store", "npm").
- Never name vendors or infrastructure in public copy. Never render the email address; the Email link is a `mailto:` href only.
- The unannounced project's only words are **"Something new"** and **"Fate, Lightly Seeded"** (Title Case, no full stop). No name, no screen, no link, no hint at its mechanic.

## Project ban additions
- No `auteur-allow` suppressions are in force (`node tools/auteur/slopscan.mjs app components` is clean).
- No tweened or odometer numbers; any number on screen is computed for the current scroll position.
- No scroll listeners; scroll is read in the gsap ticker.
- No second pinned scene on any page; no motion on `/apps`.
- Nothing on the page cross-fades between paper and dark: the beat is a hard-edge wipe.

## Rejected: decisions that already have a history

| What was tried | Why it lost | What is there instead |
|---|---|---|
| Static mockups of the peak | "Too plain, not enough wow", and a pinned scene can't be judged from stills | Working prototypes, the winner ported 1:1 |
| Round 3 screenshot peaks: icon-to-app launch zoom (A), "Rewind" year ruler with a flipping 3D card (B), home-screen grid that taps apps open (C) | Rejected as a set: all three were app screenshots in a long pinned scroll, "still not enough wow" | The data peak; screenshots only in the featured OneRM and on `/apps` |
| Per-app colour floods across the full stage | Read as a slideshow; cross-fades between saturated stages went muddy | Lit paper; colour only in the plot's lines |
| The type-led "Picker" peak (T) | Lost to "Every commit" in round 5 | — |
| A dark "terminal" dashboard, contribution heat-map grid, stat row, language pie | The category reflex and its second-order reflex | A lit, editorial seismograph of real daily commits |
| Fading the beat's dark in by opacity | Paused frames showed grey mud between paper and dark | One hard edge E moves three layers by transform; paper left of E, dark right of it |
| Any other teaser copy for the unannounced project, redaction bars | Gave too much away or read flat | "Something new" / "Fate, Lightly Seeded" |
| A prose bio paragraph | Weaker than facts | The gallery label (Now / Also / Before / Based / Weekends) + one availability line |
| Printing the email address in the contact section | Owner request | "Email" pill with a `mailto:` href |
| Inter Tight + JetBrains Mono (the previous site) | Default AI pairing; mono service labels are a house tell | Funnel Display + Atkinson Hyperlegible Next, no mono |
| An OneRM privacy page on this site | Moved to onerm.dev | Static redirect stub at `/OneRM/privacy/` |
| A card grid on `/apps` | Identical card grids are banned and the page should stay calm | Editorial rows with a year rail, one screen each |

Tuned numbers carry their reasons in the code (`lib/commit-peak.ts`): e.g. `Q = 0.62` is where the cursor holds once the camera moves; `PEN = 26` is the run-up over which a day's line grows; `CARD_MIN = 0.035` keeps close milestone pairs from colliding. Change them only with a reason written next to them.

## Editing protocol
1. Read this file fully before touching anything.
2. New section → pick an existing section-opening pattern, an existing motion family (or none), and existing tokens.
3. After any edit: `npx tsc --noEmit`, `npx next build`, serve `out/`, run `node tools/build-qa.mjs` and `node tools/auteur/slopscan.mjs app components`, and re-shoot the changed viewports (`node tools/build-frames.mjs`). Look at every frame.
4. If the edit genuinely needs a new pattern, update THIS file first: that is a design decision, not a patch.
5. An edit that "fixes" something in the Rejected table is a regression, however reasonable it looks. Argue the row here first, then change the page.
6. Copy goes through `data/site-data.json`; history numbers only through `npm run data`.

## Public repo
This repository is public. Never commit the unannounced project's name, repo names, mechanics or hints anywhere (code, docs, data, commit messages). Its local repo names live in the gitignored `scripts/history-sources.local.json`.
