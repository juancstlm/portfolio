# ROUND 5 BRIEF: two new peaks, "Every commit" (data) and "Picker" (type-led)

Read `design/PROTOTYPE-BRIEF.md` first. Everything in it still applies (shared files read-only, file ownership, rules, QA steps, report format) except where this file overrides it. Then read `design/COMMIT-SHEET-C.md` (data) or `design/COMMIT-SHEET-D.md` (type), whichever is yours.

## Why a new round
Round 3 built three screenshot-led peaks (A App launch, B Rewind with a ruler and 3D card, C Home screen). The owner rejected all three. His diagnosis: "still not enough wow". He asked for two new directions: **your data** and **type-led**. Do not rebuild any round-3 idea: no icon launch zoom, no home-screen grid, no flipping card, no per-app colour floods across the full stage, no app-by-app slideshow of screenshots as the main event. Screenshots may appear, small and secondary.

## What still holds
- Hero sentence with inline icons (loved), gallery-label bio, Funnel Display + Atkinson Hyperlegible Next, work ledger, contact. All in the shared shell.
- Funnel Display is a variable font: weight axis 400–800 is loaded by the shell (`wght@400..800`). You may animate `font-variation-settings`/`font-weight` on a small number of elements (your one written exception to transform/opacity, with a comment).
- The owner measures motion against native iOS: 1:1 with scroll, no lag, no tweened numbers ("odometer" was called subpar). A number shown at a scroll position is computed for that position and rendered directly.
- Unannounced project: id `next`. Only "Something new" / "Fate, Lightly Seeded". Never name or describe it.

## Real data: `prototypes/shared/history.json` (READ ONLY)
Built by `tools/build-history.py` from Juan's own git history and public stats. Do not invent numbers; every figure on screen must come from this file (or data.json).
- `series`: one entry per day he committed: `{"d":"YYYY-MM-DD", "<project>": n, ...}`. Projects: `wsigte, atlas, ads, onerm, calautox, next, site` (this website), `other` (unnamed side projects: show as "other projects", never name them).
- `totals`, `total` (3,785), `first` 2018-05-17, `last` (today).
- `milestones`: dated first commits and launches (App Store, npm).
- `stats`: OneRM (version, release date, rating), Atlas, ADS (49 npm versions, downloads), autocross (19 events, 101 runs, 2 class wins, 10 podiums since 2025).
- `races`: dates and class finish of every autocross event (weekends).
- Shape of the data you must design for (this is the story, handle it honestly):
  - per year: 2018 111 · 2019 81 · 2020 147 · 2021 200 · 2022 16 · 2023 7 · 2024 107 · 2025 244 · **2026 2,872**
  - 2022–2023 are nearly empty (full-time at Tesla). 2026 holds 76% of all commits; the busiest day is 2026-11-15 (293 commits).
  - The secret game starts 2026-10-27 and has 854 commits in a month.
  A linear time axis puts 2018–2025 in a thin sliver; a linear count axis flattens everything before 2026. Choose scales deliberately (e.g. sqrt counts, or a time axis that gives each year equal width and says so) and label them honestly.

## Prototype ids, ports, shot prefixes
| id | peak | port | shots prefix | sheet |
|---|---|---|---|---|
| d | Every commit (data) | 4104 | design/shots/proto-d- | design/COMMIT-SHEET-C.md |
| t | Picker (type-led) | 4105 | design/shots/proto-t- | design/COMMIT-SHEET-D.md |

Class prefix `d-` / `t-`. Files only in `prototypes/<id>/`, `tools/*-proto-<id>*`, `design/shots/proto-<id>-*`. Build with `node prototypes/build.mjs <id>`. `fetch('../shared/history.json')` works over http; also include the JSON inline is NOT needed (prototypes are served over http).
