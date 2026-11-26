# STORYBOARD: juancastillom.com (redesign)

## Film meta
- **Product:** Juan Castillo's personal site. Senior React Native engineer (Agile Six, ex-Tesla) with five live side projects: CalAutoX (2026), OneRM (2025), Atlas Design System (2024), Atlas (2020), WSIGTE (2019). An unannounced game is teased, never named.
- **Audience:** hiring managers and clients first (work history, availability), people who use his apps second (store and site links one tap away).
- **The one feeling:** momentum. Seven years of shipping, felt as a physical rewind through real screens.
- **Peak scene:** Scene 3, "Rewind".
- **Assets available up front:** real screenshots in `public/images/projects/` (OneRM bare screens, Atlas with baked device frames, CalAutoX and WSIGTE desktop captures, ADS composite, app icons). No footage, no generated imagery needed.
- **Sourced-asset findings:** Atlas 1–3 have an iPhone frame baked in (1314×2658), while OneRM 1–2 are bare screens (1260×2736). The slab needs bare screens, so the build has to crop the Atlas frames or the owner supplies bare captures. CalAutoX is a dark UI with an orange accent, WSIGTE is cream with a red-orange accent. Each app's own colour drives its stage colour.
- **Assumptions made:** OneRM's featuredDetails status "In development" is stale (the app is live). Agile Six is written "Agile Six" in public copy. The infrastructure sentence in CalAutoX's description is dropped (public copy rule). Featured OneRM shows bare screen onerm1.
- **References taken:** recon skipped refscout (bounded pass). The mechanic is native: an iOS date-picker / tape-measure ruler scrubbed by scroll, plus a stepped slab that swaps screens.
- **Moodboard read:** the sheet confirmed the category reflex: rows of floating rainbow iPhone mockups on gradients (tiles 01, 07). Avoid device mockups and multi-phone fans. Take the gallery-label idea from tiles 10/13: a small factual caption next to one hung object.
- **Style gate verdict:** round 2: hero sentence with inline icons approved ("that was cool"); bio replaced by gallery label; direction "too plain, not enough wow, hard to judge static" -> peak goes to working prototypes.
- **Direction (round 5–6):** data peak "Every commit" (prototypes/d) chosen; round 3 screenshot peaks and the type picker rejected. Wow upgrade picked: Secret ending (scene dims, only the secret game's lines lit, line "Fate, Lightly Seeded"). Teaser copy for the unannounced project: only "Something new" / "Fate, Lightly Seeded".
- **Owner facts (round 2):** title is Senior React Native Software Engineer, but the work is VA.gov Appointments, front and back end; he also does native iOS.

## Arc

| # | Scene | Beat | Intensity | layout family | motion family |
|---|-------|------|-----------|---------------|---------------|
| 1 | Hero: apps in the sentence | hook | 6 | editorial-columns | entrance-reveal (load only) |
| 2 | OneRM, annotated | rising | 5 | marginal-notes | line draw (hairlines draw on entry) |
| 3 | Rewind | **peak** | 9 | pinned-canvas | scroll-scrub |
| 4 | Where I've worked | proof | 3 | editorial-columns (ledger) | none |
| 5 | Say hi | door | 3 | centred-type | none |

Motion families page-wide: entrance-reveal, line draw, scroll-scrub (3).

---

### Scene 1: Hero   | beat: hook | intensity: 6
- **purpose:** feel: a person who makes real things / learn: who he is, what he builds, that he's available
- **subject:** typography with the real app icons set inline in the headline
- **layout_family / motion_family:** editorial-columns / entrance-reveal
- **camera:** static, eye-level
- **lighting:** paper-flat daylight
- **motion:** headline lines rise 12px and unblur once on load (60ms stagger); icons settle from scale 0.95
- **transition_in / out:** none / cut
- **scroll_len:** content (~100vh)
- **copy:** H: "I make apps for the gym [OneRM] [Atlas], the race track [CalAutoX] and dinner plans [WSIGTE]." / label (owner pick, round 2 bio A): Now: Agile Six, building VA.gov appointments, front and back end · Also: Native iOS in Swift, React Native · Before: Tesla, KFC, First Tech · Based: Northern California · Weekends: Autocross / avail: "Taking on select projects."
- **media:** type: still (existing icons) · route: SOURCE (repo) · frame prompt: n/a
- **fallback:** identical, no motion

### Scene 2: OneRM, annotated   | beat: rising | intensity: 5
- **purpose:** feel: craft, attention to detail / learn: the flagship app, what it does, how to get it
- **subject:** one bare OneRM screen, oversized
- **layout_family / motion_family:** marginal-notes / line draw
- **camera:** macro, the screen is larger than a phone, cropped by the viewport's right edge
- **lighting:** studio, one soft light from upper left
- **motion:** three hairlines draw from note to UI point when the section enters (stroke-dashoffset, 600ms ease-out, 80ms stagger)
- **transition_in / out:** cut / the page colour hands over to the first stage colour
- **scroll_len:** content (~120vh)
- **copy:** H: "OneRM" / sub: "A workout logger that works out your one-rep max from the sets you already log. Free on the App Store, with no ads, no subscriptions and no trackers." / notes: "Every logged set feeds an estimated max, charted over time." · "Weight and reps step in plate-sized jumps." · "A plate calculator tells you what to load on each side." / meta: "Designed and built solo · React Native, Expo, WatermelonDB"
- **media:** still (onerm1.png, onerm2.png) · SOURCE (repo)
- **fallback:** notes sit beside the screen without lines

### Scene 3: Rewind   | beat: PEAK | intensity: 9
- **purpose:** feel: momentum, seven years in one gesture / learn: everything he has shipped, with a link out for each
- **subject:** one screen slab, a year ruler, the stage colour
- **layout_family / motion_family:** pinned-canvas / scroll-scrub
- **camera:** static, eye-level; the slab is the only object
- **lighting:** drenched flat colour per app, taken from each app's own UI
- **motion:** one ScrollTrigger drives three things: (1) a full-bleed year ruler slides right to left, Next → 2026 → 2019, continuously; (2) the slab holds each app, then swaps: the outgoing screen slides up inside the slab's clip while the next slides in, and the slab's outline morphs between phone (portrait) and browser (landscape) for web apps; (3) stacked stage-colour planes cross-fade (opacity only). Snaps to each stop.
- **stops:** Next (secret game, unlit screen) → 2026 CalAutoX → 2025 OneRM → 2024 Atlas Design System → 2020 Atlas → 2019 WSIGTE
- **transition_in / out:** colour cut from page to first stage / colour cut back to the lit page
- **scroll_len:** 600vh desktop (100vh per stop), 360vh mobile
- **copy:** heading on stage: "Everything I've shipped, newest first." Stop captions:
  - Next: "Fate, Lightly Seeded" (owner pick, round 6; Culture-Mind ship-name tone, Title Case, no full stop)
  - CalAutoX: "Results for SFRSCCA autocross: season standings, every run time, and live timing while an event runs." → "Open sfr.calautox.com"
  - OneRM: "A workout logger that estimates your one-rep max." → "App Store"
  - Atlas Design System: "The React Native component library behind Atlas and my other apps. 20+ components, light and dark themes." → "npm"
  - Atlas: "A stats-focused workout logger for iOS, designed and built solo." → "App Store"
  - WSIGTE: "Where Should I Go To Eat? Tap once and it picks a place nearby, for groups who can't decide." → "Open wsigte.com"
- **media:** stills (repo screenshots, cropped to bare screens) · SOURCE
- **fallback:** no pin: each stop is a full-width band in its stage colour with the slab, year and caption

### Scene 4: Where I've worked   | beat: proof | intensity: 3
- **purpose:** feel: steady, credible / learn: roles, companies, years
- **subject:** a typographic ledger
- **layout_family / motion_family:** editorial-columns / none
- **camera:** static · **lighting:** paper-flat
- **copy:** H: "Where I've worked" / rows: Agile Six, Senior React Native Engineer, Aug 2024–now, "Mobile and web apps for veterans." · Tesla, Software Engineer, Mar 2022–Jul 2024, "Mobile and backend features for Tesla's apps." · KFC US, Associate Manager, RIS and React Native Developer, Mar 2021–Mar 2022, "Led mobile engineering on the RIS team." · First Tech Federal Credit Union, Mobile Engineer, Aug 2019–Jul 2020, "Worked on the First Tech banking app."
- **media:** none (type-led)
- **fallback:** identical

### Scene 5: Say hi   | beat: door | intensity: 3
- **copy:** H: "Say hi" / "Taking on select projects." / links: Email (mailto link, the address never shown) · GitHub @juancstlm · LinkedIn in/juancstlm (owner, round 7).
- **layout_family / motion_family:** centred-type / none · **media:** none · **fallback:** identical

## Gate 0 checklist
- [x] exactly one scene with intensity ≥8
- [x] no two adjacent scenes share layout family or motion family
- [x] ≤3 distinct motion families across the whole page
- [x] every scene has real copy and a fallback
- [x] every media block filled
- [ ] storyboard approved (user)
