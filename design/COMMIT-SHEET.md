# COMMIT-SHEET: juancastillom.com, "Rewind"

## 1. Peak
A pinned stage where scrolling rewinds through everything Juan has shipped: a full-bleed year ruler slides from Next back to 2019, a single screen slab swaps app by app and changes shape between phone and browser, and the whole stage takes on each app's own colour.

## 2. Color
Page: true off-white oklch(0.975 0.004 165), tinted a hair toward the brand hue, not cream (chroma ≈ 0, hue outside 40–100). Ink oklch(0.23 0.02 165). Brand: Juan's mint from Atlas and OneRM, oklch(0.80 0.13 165) (#4ad6a3), used as a fill; text-safe deep green oklch(0.45 0.09 165).
Tier: restrained on the page, **drenched** on the peak. Each stop's stage colour comes from the app itself: Next ink oklch(0.24 0.02 165), CalAutoX orange oklch(0.66 0.17 45), OneRM mint oklch(0.80 0.12 168), ADS grey oklch(0.92 0.005 165), Atlas teal oklch(0.40 0.07 175), WSIGTE red oklch(0.55 0.19 32).
Not lavender, not cream, and not the portfolio reflex of near-black with one neon accent: the colours belong to shipped products.
**Background lightness:** page mean L ≈ 0.97; peak stops average L ≈ 0.60; whole-journey target mean L ≈ 0.82 at 1440.

## 3. Type
Display: Funnel Display (600–700), a grotesk with ink traps that reads engineered at large sizes. Text: Atkinson Hyperlegible Next (400/600), humanist, high legibility, real tabular figures for years. Axis: geometric-engineered display × humanist text. Not Inter or Inter Tight (the current site's face and the AI default). Picked by the owner from the round 1 type board (over Gloock + Hanken, Schibsted + Literata, SF Pro).

## 4. Grid break
The featured OneRM screen is larger than its column and bleeds off the right edge of the viewport at 1440, while its notes sit in the left gutter, tied to the UI by hairlines. In the peak, the year ruler runs edge to edge outside the container and the slab sits off-axis on cols 7–11 with the caption on cols 1–4.

## 5. Motion budget
Three families: (1) scroll-scrub, the Rewind (one ScrollTrigger timeline: ruler translateX, slab screen swap, slab outline morph, stage colour planes by opacity, snap per stop); (2) line draw, three hairlines in the OneRM section, once; (3) entrance-reveal, the hero headline on load, once. Work and contact are still. No smooth-scroll library: native scroll, because the owner judges feel against native iOS. The slab outline morph animates `clip-path: inset(... round r)` on one element: a written exception to transform/opacity only, priced as one layer.

## 6. Reflex check
a) Portfolio: dark page, huge name as hero, marquee of skills, floating rainbow iPhone mockups fanned on a gradient (moodboard tiles 01, 07), card grid of projects.
b) Avoiding that: white Swiss minimal with mono labels and a numbered project index (roughly the current site).
c) Ours: a lit page that puts the real app icons inside the opening sentence, then one physical object, a screen that rewinds through seven years of shipped work in each app's own colour.

## 7. House tells broken
1. Near-black background → lit page (L 0.975); the only dark frame is one stop of the peak.
2. Mono service type → none; every label is in the text face. JetBrains Mono is removed.
3. Status-bar header → no header bar. Name top-left in the display face, one theme toggle top-right, nothing in between; section links live in the hero lede.
4. Wordmark-as-hero → the hero is a sentence about what he makes, with the apps inside it.
